// Registrar y editar requerimientos
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import EditorProductos, { filaVacia, revisarFilas } from '../../components/EditorProductos.jsx';
import { Alerta, Cargando, Encabezado, Nota, Tarjeta } from '../../components/ui.jsx';

const BANDEJA = '/coordinador/requerimientos';

export default function FormRequerimiento() {
  const { codigo } = useParams();
  const catalogo = useDatos('/catalogo');
  // Si no hay código es un registro nuevo y no hace falta cargar nada
  const actual = useDatos(codigo ? `/requerimientos/${codigo}` : '/catalogo');

  if (!catalogo.datos || !actual.datos) return <Cargando error={catalogo.error || actual.error} />;

  return <Formulario key={codigo || 'nuevo'} catalogo={catalogo.datos} inicial={codigo ? actual.datos : null} />;
}

function Formulario({ catalogo, inicial }) {
  const [solicitante, setSolicitante] = useState(inicial?.solicitante || '');
  const [almacen, setAlmacen] = useState(inicial?.almacen || '');
  const [prioridad, setPrioridad] = useState(inicial?.prioridad || 'Media');
  const [filas, setFilas] = useState(() =>
    inicial ? inicial.items.map((i) => ({ ...filaVacia(), codigo: i.codigo, cantidad: i.cantidad })) : [filaVacia()]
  );
  const [error, setError] = useState('');
  const { ocupado, ejecutar, avisar } = useAccion();
  const navegar = useNavigate();

  function guardar(e) {
    e.preventDefault();
    const problema = !solicitante || !almacen
      ? 'Selecciona el solicitante y el almacén.'
      : revisarFilas(filas, false);
    setError(problema);
    if (problema) return;

    ejecutar(async () => {
      const datos = {
        solicitante, almacen, prioridad,
        items: filas.map((f) => ({ codigo: f.codigo, cantidad: Number(f.cantidad) }))
      };
      const guardado = await api(inicial ? `/requerimientos/${inicial.codigo}` : '/requerimientos', {
        metodo: inicial ? 'PUT' : 'POST',
        datos
      });
      avisar(inicial ? 'Cambios guardados' : 'Requerimiento registrado', `${guardado.codigo} está en estado Registrado.`);
      navegar(`${BANDEJA}/${guardado.codigo}`);
    });
  }

  const selector = (texto, valor, cambiar, opciones) => (
    <label className="campo">
      {texto} *
      <select value={valor} onChange={(e) => cambiar(e.target.value)}>
        <option value="">Selecciona…</option>
        {opciones.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <form onSubmit={guardar} noValidate>
      <Encabezado
        etiqueta="COORDINADOR"
        ruta={`Requerimientos › ${inicial ? inicial.codigo : 'Nuevo'}`}
        titulo={inicial ? `Editar ${inicial.codigo}` : 'Nuevo requerimiento'}
        subtitulo="Completa los datos y agrega los productos que necesita el almacén."
      >
        <Link className="boton secundario" to={inicial ? `${BANDEJA}/${inicial.codigo}` : BANDEJA}>Cancelar</Link>
        <button className="boton primario" disabled={ocupado}>{inicial ? 'Guardar cambios' : 'Registrar requerimiento'}</button>
      </Encabezado>

      {error && <Alerta>{error}</Alerta>}

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Datos del requerimiento">
            <div className="rejilla-campos">
              {selector('Solicitante', solicitante, setSolicitante, catalogo.solicitantes)}
              {selector('Almacén solicitante', almacen, setAlmacen, catalogo.almacenes)}
              {selector('Prioridad', prioridad, setPrioridad, ['Alta', 'Media', 'Baja'])}
            </div>
          </Tarjeta>
          <Tarjeta titulo="Productos solicitados">
            <EditorProductos productos={catalogo.productos} filas={filas} setFilas={setFilas} />
          </Tarjeta>
        </div>
        <aside>
          <Nota>Al guardar, el requerimiento queda en estado Registrado y aparece en la bandeja de revisión.</Nota>
        </aside>
      </div>
    </form>
  );
}
