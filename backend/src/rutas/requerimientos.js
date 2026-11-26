// CRUD de requerimientos
import { Router } from 'express';
import { leerDB, guardarDB } from '../db.js';
import { requiereRol } from '../auth.js';
import { agregarRutasDeFlujo } from './flujo.js';
import {
  ErrorApi, ahora, buscarPorCodigo, exigirEstado, registrarEvento, siguienteCodigo,
  opcionValida, validarItems, completarItems
} from '../utilidades.js';

const router = Router();
const NOMBRE = 'el requerimiento';

// Calcula si el almacén tiene stock para lo que falta atender
export function presentarRequerimiento(db, requerimiento) {
  const items = completarItems(db, requerimiento.items).map((item) => {
    const pendiente = item.cantidad - item.atendido;
    let disponibilidad = 'Atendido';
    if (pendiente > 0) {
      if (item.stock >= pendiente) disponibilidad = 'Disponible';
      else disponibilidad = item.stock > 0 ? 'Parcial' : 'Sin stock';
    }
    return { ...item, pendiente, disponibilidad };
  });

  const pendientes = items.filter((i) => i.pendiente > 0);
  let disponibilidad = 'Parcial';
  if (pendientes.every((i) => i.disponibilidad === 'Disponible')) disponibilidad = 'Todo disponible';
  else if (pendientes.every((i) => i.disponibilidad === 'Sin stock')) disponibilidad = 'Sin stock';

  return { ...requerimiento, items, disponibilidad };
}

function validarDatos(db, datos = {}) {
  return {
    solicitante: opcionValida(datos.solicitante, db.solicitantes, 'Solicitante'),
    almacen: opcionValida(datos.almacen, db.almacenes, 'Almacén solicitante'),
    prioridad: opcionValida(datos.prioridad, ['Alta', 'Media', 'Baja'], 'Prioridad'),
    items: validarItems(db, datos.items)
  };
}

// LISTAR
router.get('/', (req, res) => {
  const db = leerDB();
  const lista = db.requerimientos.map((r) => presentarRequerimiento(db, r));
  res.json(lista.sort((a, b) => b.codigo.localeCompare(a.codigo)));
});

// VER UNO
router.get('/:codigo', (req, res) => {
  const db = leerDB();
  res.json(presentarRequerimiento(db, buscarPorCodigo(db.requerimientos, req.params.codigo, NOMBRE)));
});

// CREAR
router.post('/', requiereRol('coordinador'), (req, res) => {
  const db = leerDB();
  const datos = validarDatos(db, req.body);
  const nuevo = {
    codigo: siguienteCodigo(db, 'requerimiento', 'REQ'),
    ...datos,
    fecha: ahora(),
    estado: 'Registrado',
    observacion: '',
    guia: null,
    historial: []
  };
  registrarEvento(nuevo, 'registrar', 'Registró el requerimiento', req.usuario);
  db.requerimientos.push(nuevo);
  guardarDB(db);
  res.status(201).json(presentarRequerimiento(db, nuevo));
});

// EDITAR
router.put('/:codigo', requiereRol('coordinador'), (req, res) => {
  const db = leerDB();
  const requerimiento = buscarPorCodigo(db.requerimientos, req.params.codigo, NOMBRE);
  exigirEstado(requerimiento, ['Registrado', 'Observado'], 'Solo se puede editar si está Registrado u Observado');

  // Al corregirlo vuelve a la bandeja de revisión
  Object.assign(requerimiento, validarDatos(db, req.body), { estado: 'Registrado', observacion: '' });
  registrarEvento(requerimiento, 'editar', 'Editó el requerimiento', req.usuario);
  guardarDB(db);
  res.json(presentarRequerimiento(db, requerimiento));
});

// ELIMINAR
router.delete('/:codigo', requiereRol('coordinador'), (req, res) => {
  const db = leerDB();
  const requerimiento = buscarPorCodigo(db.requerimientos, req.params.codigo, NOMBRE);
  exigirEstado(requerimiento, ['Registrado', 'Observado', 'Rechazado'],
    'No se puede eliminar un requerimiento que ya fue revisado o aprobado');
  db.requerimientos = db.requerimientos.filter((r) => r !== requerimiento);
  guardarDB(db);
  res.status(204).end();
});

// GENERAR GUÍA (RN-04 y RN-05)
router.post('/:codigo/guia', requiereRol('almacenero'), (req, res) => {
  const db = leerDB();
  const requerimiento = buscarPorCodigo(db.requerimientos, req.params.codigo, NOMBRE);
  exigirEstado(requerimiento, ['Aprobado', 'Atendido parcial', 'Atendido'],
    'Solo un requerimiento Aprobado puede atenderse');
  if (requerimiento.guia) throw new ErrorApi('Este requerimiento ya tiene una guía', 409);

  requerimiento.guia = {
    codigo: siguienteCodigo(db, 'guia', 'GR'),
    fecha: ahora(),
    usuario: req.usuario.nombre
  };
  registrarEvento(requerimiento, 'guia', `Generó la guía ${requerimiento.guia.codigo}`, req.usuario);
  guardarDB(db);
  res.status(201).json(presentarRequerimiento(db, requerimiento));
});

agregarRutasDeFlujo(router, {
  coleccion: 'requerimientos', nombre: NOMBRE, terminacion: 'o', presentar: presentarRequerimiento
});

export default router;
