// Login simple: el servidor guarda en memoria qué usuario tiene cada token
import { randomUUID } from 'node:crypto';
import { ErrorApi } from './utilidades.js';

const sesiones = new Map();

export function crearSesion(usuario) {
  const token = randomUUID();
  sesiones.set(token, usuario);
  return token;
}

export function cerrarSesion(token) {
  sesiones.delete(token);
}

export const leerToken = (req) => (req.headers.authorization || '').replace('Bearer ', '');

export function requiereSesion(req, res, next) {
  const usuario = sesiones.get(leerToken(req));
  if (!usuario) throw new ErrorApi('Inicia sesión para continuar', 401);
  req.usuario = usuario;
  next();
}

export const requiereRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    throw new ErrorApi('Tu rol no tiene permiso para esta acción', 403);
  }
  next();
};
