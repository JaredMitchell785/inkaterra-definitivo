// Catálogos, historial general y buscador
import { Router } from 'express';
import { leerDB } from '../db.js';
import { requiereRol } from '../auth.js';

const router = Router();

router.get('/catalogo', (req, res) => {
  const { productos, proveedores, almacenes, solicitantes } = leerDB();
  res.json({ productos, proveedores, almacenes, solicitantes });
});

router.get('/historial', requiereRol('administrador'), (req, res) => {
  const db = leerDB();
  const documentos = [...db.requerimientos, ...db.ordenes];
  const eventos = documentos.flatMap((doc) => doc.historial.map((e) => ({ ...e, documento: doc.codigo })));
  eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(eventos);
});

router.get('/buscar', (req, res) => {
  const texto = String(req.query.q || '').trim().toLowerCase();
  if (texto.length < 2) return res.json([]);

  const db = leerDB();
  const resultados = [
    ...db.requerimientos.map((r) => ({
      tipo: 'requerimiento', codigo: r.codigo, detalle: `${r.solicitante} · ${r.estado}`, guia: r.guia?.codigo
    })),
    ...db.ordenes.map((o) => ({ tipo: 'orden', codigo: o.codigo, detalle: `${o.proveedor} · ${o.estado}` }))
  ];

  res.json(
    resultados
      .filter((r) => `${r.codigo} ${r.detalle} ${r.guia || ''}`.toLowerCase().includes(texto))
      .slice(0, 6)
  );
});

export default router;
