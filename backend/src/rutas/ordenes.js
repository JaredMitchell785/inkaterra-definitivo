// CRUD de órdenes de compra
import { Router } from 'express';
import { leerDB, guardarDB } from '../db.js';
import { requiereRol } from '../auth.js';
import { agregarRutasDeFlujo } from './flujo.js';
import {
  ahora, buscarPorCodigo, exigirEstado, registrarEvento, siguienteCodigo,
  opcionValida, validarItems, completarItems
} from '../utilidades.js';

const router = Router();
const NOMBRE = 'la orden';
const redondear = (numero) => Math.round(numero * 100) / 100;

export function presentarOrden(db, orden) {
  const items = completarItems(db, orden.items).map((i) => ({ ...i, subtotal: redondear(i.cantidad * i.precio) }));
  const total = redondear(items.reduce((suma, i) => suma + i.subtotal, 0));
  return { ...orden, items, total };
}

function validarDatos(db, datos = {}) {
  return {
    proveedor: opcionValida(datos.proveedor, db.proveedores, 'Proveedor'),
    items: validarItems(db, datos.items, { conPrecio: true })
  };
}

router.get('/', (req, res) => {
  const db = leerDB();
  const lista = db.ordenes.map((o) => presentarOrden(db, o));
  res.json(lista.sort((a, b) => b.codigo.localeCompare(a.codigo)));
});

router.get('/:codigo', (req, res) => {
  const db = leerDB();
  res.json(presentarOrden(db, buscarPorCodigo(db.ordenes, req.params.codigo, NOMBRE)));
});

router.post('/', requiereRol('almacenero'), (req, res) => {
  const db = leerDB();
  const datos = validarDatos(db, req.body);
  const nueva = {
    codigo: siguienteCodigo(db, 'orden', 'OC'),
    ...datos,
    solicitante: req.usuario.nombre,
    almacen: 'Reserva Amazónica · Principal',
    fecha: ahora(),
    estado: 'Registrado',
    observacion: '',
    notaEntrada: null,
    correo: null,
    historial: []
  };
  registrarEvento(nueva, 'registrar', 'Registró la orden', req.usuario);
  db.ordenes.push(nueva);
  guardarDB(db);
  res.status(201).json(presentarOrden(db, nueva));
});

router.put('/:codigo', requiereRol('almacenero'), (req, res) => {
  const db = leerDB();
  const orden = buscarPorCodigo(db.ordenes, req.params.codigo, NOMBRE);
  exigirEstado(orden, ['Registrado', 'Observado'], 'Solo se puede editar si está Registrada u Observada');

  Object.assign(orden, validarDatos(db, req.body), { estado: 'Registrado', observacion: '' });
  registrarEvento(orden, 'editar', 'Editó la orden', req.usuario);
  guardarDB(db);
  res.json(presentarOrden(db, orden));
});

router.delete('/:codigo', requiereRol('almacenero'), (req, res) => {
  const db = leerDB();
  const orden = buscarPorCodigo(db.ordenes, req.params.codigo, NOMBRE);
  exigirEstado(orden, ['Registrado', 'Observado', 'Rechazado'],
    'No se puede eliminar una orden que ya fue revisada o aprobada');
  db.ordenes = db.ordenes.filter((o) => o !== orden);
  guardarDB(db);
  res.status(204).end();
});

agregarRutasDeFlujo(router, { coleccion: 'ordenes', nombre: NOMBRE, terminacion: 'a', presentar: presentarOrden });

export default router;
