// Funciones de ayuda que usan varias rutas

export class ErrorApi extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

export const ahora = () => new Date().toISOString();

export function buscarPorCodigo(lista, codigo, nombre) {
  const encontrado = lista.find((elemento) => elemento.codigo === codigo);
  if (!encontrado) throw new ErrorApi(`No existe ${nombre} ${codigo}`, 404);
  return encontrado;
}

export function exigirEstado(documento, estados, mensaje) {
  if (!estados.includes(documento.estado)) throw new ErrorApi(mensaje, 409);
}

export function registrarEvento(documento, tipo, accion, usuario) {
  documento.historial.push({ tipo, accion, usuario: usuario.nombre, fecha: ahora() });
}

// Genera códigos como REQ-2026-0098
export function siguienteCodigo(db, tipo, prefijo) {
  db.contadores[tipo] += 1;
  const numero = String(db.contadores[tipo]).padStart(4, '0');
  return `${prefijo}-${new Date().getFullYear()}-${numero}`;
}

export function textoObligatorio(valor, campo) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new ErrorApi(`El campo "${campo}" es obligatorio`);
  }
  return valor.trim();
}

export function opcionValida(valor, opciones, campo) {
  if (!opciones.includes(valor)) throw new ErrorApi(`Selecciona un valor válido en "${campo}"`);
  return valor;
}

export const esEntero = (valor, minimo) => Number.isInteger(valor) && valor >= minimo;

// Valida la lista de productos de un requerimiento o de una orden
export function validarItems(db, items, { conPrecio = false } = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorApi('Agrega al menos un producto');
  }

  const usados = new Set();

  return items.map((item) => {
    const producto = db.productos.find((p) => p.codigo === item?.codigo);
    if (!producto) throw new ErrorApi('Hay un producto que no existe en el catálogo');
    if (usados.has(producto.codigo)) throw new ErrorApi(`El producto ${producto.codigo} está repetido`);
    usados.add(producto.codigo);

    if (!esEntero(item.cantidad, 1)) {
      throw new ErrorApi(`La cantidad de ${producto.codigo} debe ser un número entero mayor que 0`);
    }
    if (!conPrecio) return { codigo: producto.codigo, cantidad: item.cantidad, atendido: 0 };

    if (typeof item.precio !== 'number' || !(item.precio > 0)) {
      throw new ErrorApi(`El precio de ${producto.codigo} debe ser mayor que 0`);
    }
    return { codigo: producto.codigo, cantidad: item.cantidad, precio: Math.round(item.precio * 100) / 100 };
  });
}

// Añade la descripción, unidad y stock a cada producto antes de enviarlo al frontend
export function completarItems(db, items) {
  return items.map((item) => {
    const { descripcion, unidad, stock } = db.productos.find((p) => p.codigo === item.codigo);
    return { ...item, descripcion, unidad, stock };
  });
}
