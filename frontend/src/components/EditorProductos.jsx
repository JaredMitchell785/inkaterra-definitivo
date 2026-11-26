// Lista editable de productos para los formularios de registro
export const filaVacia = () => ({ id: crypto.randomUUID(), codigo: '', cantidad: '', precio: '' });

// Revisa las filas antes de enviarlas al servidor
export function revisarFilas(filas, conPrecio) {
  if (filas.length === 0) return 'Agrega al menos un producto.';
  if (filas.some((f) => !f.codigo)) return 'Selecciona el producto en todas las filas.';
  if (new Set(filas.map((f) => f.codigo)).size !== filas.length) return 'Hay productos repetidos.';
  if (filas.some((f) => !Number.isInteger(Number(f.cantidad)) || Number(f.cantidad) < 1)) {
    return 'Las cantidades deben ser números enteros mayores que 0.';
  }
  if (conPrecio && filas.some((f) => !(Number(f.precio) > 0))) return 'Los precios deben ser mayores que 0.';
  return '';
}

export default function EditorProductos({ productos, filas, setFilas, conPrecio = false }) {
  function cambiar(id, campo, valor) {
    setFilas(
      filas.map((fila) => {
        if (fila.id !== id) return fila;
        const nueva = { ...fila, [campo]: valor };
        // Al elegir un producto se sugiere su precio
        if (conPrecio && campo === 'codigo') {
          nueva.precio = productos.find((p) => p.codigo === valor)?.precio ?? '';
        }
        return nueva;
      })
    );
  }

  return (
    <div className="editor">
      {filas.map((fila, i) => (
        <div className={`editor-fila ${conPrecio ? 'con-precio' : ''}`} key={fila.id}>
          <label className="campo">
            Producto {i + 1}
            <select value={fila.codigo} onChange={(e) => cambiar(fila.id, 'codigo', e.target.value)}>
              <option value="">Selecciona…</option>
              {productos.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.codigo} · {p.descripcion} ({p.unidad})</option>
              ))}
            </select>
          </label>
          <label className="campo">
            Cantidad
            <input type="number" min="1" step="1" value={fila.cantidad}
              onChange={(e) => cambiar(fila.id, 'cantidad', e.target.value)} />
          </label>
          {conPrecio && (
            <label className="campo">
              P. unitario (S/)
              <input type="number" min="0.01" step="0.01" value={fila.precio}
                onChange={(e) => cambiar(fila.id, 'precio', e.target.value)} />
            </label>
          )}
          <button type="button" className="boton secundario chico" disabled={filas.length === 1}
            onClick={() => setFilas(filas.filter((f) => f.id !== fila.id))}>
            Quitar
          </button>
        </div>
      ))}
      <button type="button" className="boton secundario chico agregar" onClick={() => setFilas([...filas, filaVacia()])}>
        + Agregar producto
      </button>
    </div>
  );
}
