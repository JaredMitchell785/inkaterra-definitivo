import express from 'express';
import { requiereSesion } from './auth.js';
import rutasAuth from './rutas/sesion.js';
import rutasGenerales from './rutas/generales.js';
import rutasRequerimientos from './rutas/requerimientos.js';
import rutasOrdenes from './rutas/ordenes.js';
import rutasAlmacen from './rutas/almacen.js';

export const app = express();

app.use(express.json());

// Rutas públicas
app.use('/api', rutasAuth);

// A partir de aquí todas las rutas necesitan iniciar sesión
app.use('/api', requiereSesion);
app.use('/api', rutasGenerales);
app.use('/api/requerimientos', rutasRequerimientos);
app.use('/api/ordenes', rutasOrdenes);
app.use('/api', rutasAlmacen);

app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// Manejador de errores: todas las respuestas de error tienen la forma { mensaje }
app.use((error, req, res, next) => {
  const estado = error.status || 500;
  if (estado === 500) console.error(error);
  res.status(estado).json({
    mensaje: estado === 500 ? 'Error interno del servidor' : error.message
  });
});
