// Notas de entrada (el stock sube) y transferencias (el stock baja)
import { Router } from 'express';
import { leerDB, guardarDB } from '../db.js';
import { requiereRol } from '../auth.js';
import {
  ErrorApi, ahora, buscarPorCodigo, exigirEstado, registrarEvento, siguienteCodigo,
  esEntero, completarItems
} from '../utilidades.js';

const router = Router();
const soloAlmacen = requiereRol('almacenero');
const presentar = (db, documento) => ({ ...documento, items: completarItems(db, documento.items) });
const masRecientes = (db, lista) => [...lista].reverse().map((d) => presentar(db, d));

// Devuelve la cantidad que el usuario escribió para un producto
const cantidadDe = (items, codigo, campo) =>
  Array.isArray(items) ? items.find((i) => i?.codigo === codigo)?.[campo] : undefined;

router.get('/notas-entrada', soloAlmacen, (req, res) => {
  const db = leerDB();
  res.json(masRecientes(db, db.notasEntrada));
});

router.get('/notas-entrada/:codigo', soloAlmacen, (req, res) => {
  const db = leerDB();
  res.json(presentar(db, buscarPorCodigo(db.notasEntrada, req.params.codigo, 'la nota de entrada')));
});

router.post('/notas-entrada', soloAlmacen, (req, res) => {
  const db = leerDB();
  const orden = buscarPorCodigo(db.ordenes, req.body?.orden, 'la orden');

  // RN-02: solo las órdenes aprobadas
  exigirEstado(orden, ['Aprobado'], 'Solo las órdenes en estado Aprobado permiten registrar la nota de entrada');
  if (orden.notaEntrada) throw new ErrorApi('Esta orden ya tiene una nota de entrada', 409);

  // Primero se valida todo y recién después se modifica el stock
  const recibidos = orden.items.map((item) => {
    const recibido = cantidadDe(req.body.items, item.codigo, 'recibido');
    if (!esEntero(recibido, 0) || recibido > item.cantidad) {
      throw new ErrorApi(`La cantidad recibida de ${item.codigo} debe estar entre 0 y ${item.cantidad}`);
    }
    return { codigo: item.codigo, ordenado: item.cantidad, recibido };
  });
  if (recibidos.every((i) => i.recibido === 0)) throw new ErrorApi('Ingresa al menos una cantidad recibida');

  // RN-03: el inventario aumenta con la nota de entrada
  const items = recibidos.map((item) => {
    const producto = db.productos.find((p) => p.codigo === item.codigo);
    const stockAnterior = producto.stock;
    producto.stock += item.recibido;
    return { ...item, stockAnterior, stockActual: producto.stock };
  });

  const nota = {
    codigo: siguienteCodigo(db, 'nota', 'NE'),
    orden: orden.codigo,
    usuario: req.usuario.nombre,
    fecha: ahora(),
    items
  };
  db.notasEntrada.push(nota);
  orden.notaEntrada = nota.codigo;
  registrarEvento(orden, 'nota', `Registró la nota de entrada ${nota.codigo}`, req.usuario);

  guardarDB(db);
  res.status(201).json(presentar(db, nota));
});

router.get('/transferencias', soloAlmacen, (req, res) => {
  const db = leerDB();
  res.json(masRecientes(db, db.transferencias));
});

router.post('/transferencias', soloAlmacen, (req, res) => {
  const db = leerDB();
  const requerimiento = buscarPorCodigo(db.requerimientos, req.body?.requerimiento, 'el requerimiento');

  // RN-04
  exigirEstado(requerimiento, ['Aprobado', 'Atendido parcial'], 'Solo un requerimiento Aprobado puede atenderse');

  const envios = requerimiento.items.map((item) => {
    const producto = db.productos.find((p) => p.codigo === item.codigo);
    const cantidad = cantidadDe(req.body.items, item.codigo, 'cantidad') ?? 0;
    const pendiente = item.cantidad - item.atendido;

    if (!esEntero(cantidad, 0)) throw new ErrorApi(`La cantidad de ${item.codigo} no es válida`);
    // RN-07: no se puede transferir más de lo que hay
    if (cantidad > producto.stock) {
      throw new ErrorApi(`Stock insuficiente de ${item.codigo}: hay ${producto.stock}`);
    }
    if (cantidad > pendiente) throw new ErrorApi(`De ${item.codigo} solo faltan ${pendiente}`);
    return { item, producto, cantidad };
  });
  if (envios.every((e) => e.cantidad === 0)) throw new ErrorApi('Ingresa al menos una cantidad a transferir');

  for (const { item, producto, cantidad } of envios) {
    producto.stock -= cantidad;
    item.atendido += cantidad;
  }

  const completo = requerimiento.items.every((i) => i.atendido === i.cantidad);
  requerimiento.estado = completo ? 'Atendido' : 'Atendido parcial';

  const transferencia = {
    codigo: siguienteCodigo(db, 'transferencia', 'TR'),
    requerimiento: requerimiento.codigo,
    destino: requerimiento.almacen,
    usuario: req.usuario.nombre,
    fecha: ahora(),
    items: envios.filter((e) => e.cantidad > 0).map((e) => ({ codigo: e.item.codigo, cantidad: e.cantidad }))
  };
  db.transferencias.push(transferencia);
  registrarEvento(requerimiento, 'transferir', `Registró la transferencia ${transferencia.codigo}`, req.usuario);

  guardarDB(db);
  res.status(201).json(presentar(db, transferencia));
});

export default router;
