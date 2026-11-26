import { Router } from 'express';
import { leerDB } from '../db.js';
import { crearSesion, cerrarSesion, leerToken } from '../auth.js';
import { ErrorApi } from '../utilidades.js';

const router = Router();

router.post('/login', (req, res) => {
  const { usuario, clave } = req.body || {};
  const encontrado = leerDB().usuarios.find((u) => u.usuario === usuario && u.clave === clave);
  if (!encontrado) throw new ErrorApi('Usuario o contraseña incorrectos', 401);

  // Nunca se devuelve la contraseña
  const { clave: _, ...datos } = encontrado;
  res.json({ token: crearSesion(datos), usuario: datos });
});

router.post('/logout', (req, res) => {
  cerrarSesion(leerToken(req));
  res.status(204).end();
});

export default router;
