// Pruebas de las reglas de negocio:  npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Las pruebas usan un archivo temporal para no tocar tus datos
const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'inkaterra-'));
process.env.RUTA_DB = path.join(carpeta, 'db.json');
const { app } = await import('../src/app.js');

let servidor, base;
const tokens = {};

async function pedir(metodo, ruta, { rol, datos } = {}) {
  const respuesta = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens[rol] || ''}` },
    body: datos ? JSON.stringify(datos) : undefined
  });
  const cuerpo = respuesta.status === 204 ? null : await respuesta.json();
  return { estado: respuesta.status, cuerpo };
}

before(async () => {
  servidor = app.listen(0);
  base = `http://localhost:${servidor.address().port}/api`;
  for (const [rol, usuario] of [['coordinador', 'coordinador'], ['administrador', 'admin'], ['almacenero', 'almacen']]) {
    const { cuerpo } = await pedir('POST', '/login', { datos: { usuario, clave: '1234' } });
    tokens[rol] = cuerpo.token;
  }
});

after(() => {
  servidor.close();
  fs.rmSync(carpeta, { recursive: true, force: true });
});

test('login incorrecto y rutas sin sesión responden 401', async () => {
  assert.equal((await pedir('POST', '/login', { datos: { usuario: 'admin', clave: 'x' } })).estado, 401);
  assert.equal((await pedir('GET', '/requerimientos')).estado, 401);
});

test('CRUD de requerimientos', async () => {
  const datos = {
    solicitante: 'Rosa Huamán', almacen: 'Almacén Reserva Norte', prioridad: 'Alta',
    items: [{ codigo: 'ALI-00482', cantidad: 2 }]
  };
  const creado = await pedir('POST', '/requerimientos', { rol: 'coordinador', datos });
  assert.equal(creado.estado, 201);
  const ruta = `/requerimientos/${creado.cuerpo.codigo}`;

  const editado = await pedir('PUT', ruta, { rol: 'coordinador', datos: { ...datos, prioridad: 'Baja' } });
  assert.equal(editado.cuerpo.prioridad, 'Baja');
  assert.equal((await pedir('GET', ruta, { rol: 'coordinador' })).estado, 200);
  assert.equal((await pedir('DELETE', ruta, { rol: 'coordinador' })).estado, 204);
  assert.equal((await pedir('GET', ruta, { rol: 'coordinador' })).estado, 404);
});

test('validaciones y permisos', async () => {
  const sinItems = await pedir('POST', '/ordenes', { rol: 'almacenero', datos: { proveedor: 'Agroselva EIRL', items: [] } });
  assert.equal(sinItems.estado, 400);
  assert.equal((await pedir('POST', '/ordenes/OC-2026-0184/aprobar', { rol: 'almacenero' })).estado, 403);
  const sinMotivo = await pedir('POST', '/ordenes/OC-2026-0184/rechazar', { rol: 'administrador', datos: { motivo: ' ' } });
  assert.equal(sinMotivo.estado, 400);
});

test('flujo de una orden: Registrado → Revisado → Aprobado', async () => {
  const creada = await pedir('POST', '/ordenes', {
    rol: 'almacenero',
    datos: { proveedor: 'Agroselva EIRL', items: [{ codigo: 'ALI-00510', cantidad: 3, precio: 10.5 }] }
  });
  assert.equal(creada.cuerpo.total, 31.5);
  const ruta = `/ordenes/${creada.cuerpo.codigo}`;

  assert.equal((await pedir('POST', `${ruta}/aprobar`, { rol: 'administrador' })).estado, 409);
  assert.equal((await pedir('POST', `${ruta}/revisar`, { rol: 'coordinador' })).cuerpo.estado, 'Revisado');
  const aprobada = await pedir('POST', `${ruta}/aprobar`, { rol: 'administrador' });
  assert.equal(aprobada.cuerpo.estado, 'Aprobado');
  assert.match(aprobada.cuerpo.correo.asunto, /aprobada$/);
  assert.equal((await pedir('DELETE', ruta, { rol: 'almacenero' })).estado, 409);
});

test('la nota de entrada sube el stock y la transferencia lo baja', async () => {
  const items = [
    { codigo: 'ALI-00482', recibido: 24 }, { codigo: 'BAR-00091', recibido: 18 }, { codigo: 'LIM-00137', recibido: 4 }
  ];
  const noAprobada = await pedir('POST', '/notas-entrada', { rol: 'almacenero', datos: { orden: 'OC-2026-0181', items } });
  assert.equal(noAprobada.estado, 409);

  const nota = await pedir('POST', '/notas-entrada', { rol: 'almacenero', datos: { orden: 'OC-2026-0178', items } });
  assert.equal(nota.cuerpo.codigo, 'NE-2026-0041');
  assert.deepEqual(nota.cuerpo.items.map((i) => i.stockActual), [60, 40, 4]);
  const repetida = await pedir('POST', '/notas-entrada', { rol: 'almacenero', datos: { orden: 'OC-2026-0178', items } });
  assert.equal(repetida.estado, 409);

  const envio = (detergente) => ({
    requerimiento: 'REQ-2026-0088',
    items: [{ codigo: 'ALI-00482', cantidad: 24 }, { codigo: 'LIM-00137', cantidad: detergente }]
  });
  const excedida = await pedir('POST', '/transferencias', { rol: 'almacenero', datos: envio(12) });
  assert.equal(excedida.estado, 400);
  assert.match(excedida.cuerpo.mensaje, /Stock insuficiente/);

  assert.equal((await pedir('POST', '/transferencias', { rol: 'almacenero', datos: envio(4) })).estado, 201);
  const req = await pedir('GET', '/requerimientos/REQ-2026-0088', { rol: 'almacenero' });
  assert.equal(req.cuerpo.estado, 'Atendido parcial');
  assert.equal(req.cuerpo.items[0].stock, 36);
});
