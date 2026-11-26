// "Base de datos" del proyecto: un archivo JSON (todavía no usamos SQL)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { datosIniciales } from './datosIniciales.js';

const carpeta = path.dirname(fileURLToPath(import.meta.url));
const RUTA_DB = process.env.RUTA_DB || path.join(carpeta, '..', 'data', 'db.json');

export function guardarDB(db) {
  fs.mkdirSync(path.dirname(RUTA_DB), { recursive: true });
  fs.writeFileSync(RUTA_DB, JSON.stringify(db, null, 2));
}

export function leerDB() {
  // La primera vez se crea el archivo con los datos de ejemplo
  if (!fs.existsSync(RUTA_DB)) guardarDB(datosIniciales());
  return JSON.parse(fs.readFileSync(RUTA_DB, 'utf-8'));
}

export function reiniciarDB() {
  guardarDB(datosIniciales());
}
