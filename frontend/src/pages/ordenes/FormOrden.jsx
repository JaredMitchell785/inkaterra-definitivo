// Registrar y editar órdenes de compra
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import { soles } from '../../formato.js';
import EditorProductos, { filaVacia, revisarFilas } from '../../components/EditorProductos.jsx';
import { Alerta, Cargando, DatosEnFilas, Encabezado, Nota, Tarjeta } from '../../components/ui.jsx';

const BANDEJA = '/almacen/ordenes';

export default function FormOrden() {
  const { codigo } = useParams();
  const catalogo = useDatos('/catalogo');
  const actual = useDatos(codigo ? `/ordenes/${codigo}` : '/catalogo');

  if (!catalogo.datos || !actual.datos) return <Cargando error={catalogo.error || actual.error} />;

  return <Formulario key={codigo || 'nueva'} catalogo={catalogo.datos} inicial={codigo ? actual.datos : null} />;
}

function Formulario({ catalogo, inicial }) {
  const [proveedor, setProveedor] = useState(inicial?.proveedor || '');
  const [filas, setFilas] = useState(() =>
    inicial
      ? inicial.items.map((i) => ({ ...filaVacia(), codigo: i.codigo, cantidad: i.cantidad, precio: i.precio }))
      : [filaVacia()]
  );
  const [error, setError] = useState('');
  const { ocupado, ejecutar, avisar } = useAccion();
  const navegar = useNavigate();

  // El total se recalcula cada vez que cambian las filas
  const total = filas.reduce((suma, f) => suma + (Number(f.cantidad) || 0) * (Number(f.precio) || 0), 0);

  function guardar(e) {
    e.preventDefault();
    const problema = !proveedor ? 'Selecciona el proveedor.' : revisarFilas(filas, true);
    setError(problema);
    if (problema) return;

    ejecutar(async () => {
      const datos = {
        proveedor,
        items: filas.map((f) => ({ codigo: f.codigo, cantidad: Number(f.cantidad), precio: Number(f.precio) }))
      };
      const guardada = await api(inicial ? `/ordenes/${inicial.codigo}` : '/ordenes', {
        metodo: inicial ? 'PUT' : 'POST',
        datos
      });
      avisar(inicial ? 'Cambios guardados' : 'Orden registrada', `${guardada.codigo} está en estado Registrado.`);
      navegar(`${BANDEJA}/${guardada.codigo}`);
    });
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Encabezado
        etiqueta="ALMACENERO"
        ruta={`Órdenes de compra › ${inicial ? inicial.codigo : 'Nueva'}`}
        titulo={inicial ? `Editar ${inicial.codigo}` : 'Nueva orden de compra'}
        subtitulo="Elige el proveedor y agrega los productos con su precio."
      >
        <Link className="boton secundario" to={inicial ? `${BANDEJA}/${inicial.codigo}` : BANDEJA}>Cancelar</Link>
        <button className="boton primario" disabled={ocupado}>{inicial ? 'Guardar cambios' : 'Registrar orden'}</button>
      </Encabezado>

      {error && <Alerta>{error}</Alerta>}

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Datos de la orden">
            <div className="rejilla-campos">
              <label className="campo">
                Proveedor *
                <select value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {catalogo.proveedores.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="campo">
                Almacén destino
                <input value="Reserva Amazónica · Principal" readOnly />
              </label>
            </div>
          </Tarjeta>
          <Tarjeta titulo="Productos de la orden">
            <EditorProductos productos={catalogo.productos} filas={filas} setFilas={setFilas} conPrecio />
          </Tarjeta>
        </div>
        <aside>
          <Tarjeta titulo="Resumen">
            <DatosEnFilas datos={[['Productos', filas.filter((f) => f.codigo).length], ['Total', soles(total)]]} />
          </Tarjeta>
          <Nota>La orden debe ser revisada por el Coordinador y aprobada por el Administrador.</Nota>
        </aside>
      </div>
    </form>
  );
}
