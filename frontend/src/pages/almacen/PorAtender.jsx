// L4 · Requerimientos por atender
import { Link } from 'react-router-dom';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaCorta, plural } from '../../formato.js';
import Filtros, { useFiltros } from '../../components/Filtros.jsx';
import { Cargando, Encabezado, Estado, Nota, Tabla, Tarjeta } from '../../components/ui.jsx';

const ESTADOS = ['Aprobado', 'Atendido parcial'];

const COLUMNAS = [
  { titulo: 'Requerimiento', valor: (r) => r.codigo },
  { titulo: 'Solicitante', valor: (r) => r.solicitante },
  { titulo: 'Almacén', valor: (r) => r.almacen.replace('Almacén ', '') },
  { titulo: 'Fecha', valor: (r) => fechaCorta(r.fecha) },
  { titulo: 'Ítems', valor: (r) => plural(r.items.length, 'ítem') },
  { titulo: 'Disponibilidad', valor: (r) => <Estado valor={r.disponibilidad} /> },
  { titulo: 'Estado', valor: (r) => <Estado valor={r.estado} /> },
  {
    titulo: 'Acción',
    valor: (r) => <Link className="boton chico primario" to={`/almacen/requerimientos/${r.codigo}`}>Atender</Link>
  }
];

export default function PorAtender() {
  const { datos, error } = useDatos('/requerimientos');
  const lista = (datos || []).filter((r) => ESTADOS.includes(r.estado));
  const { filtrados, filtros } = useFiltros(lista, (r) => `${r.codigo} ${r.solicitante} ${r.almacen}`);

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-12"
        ruta="Requerimientos › Por atender"
        titulo="Requerimientos aprobados"
        subtitulo="Solo los requerimientos aprobados pueden atenderse con guía y/o transferencia."
      />
      {!datos ? <Cargando error={error} /> : (
        <>
          <Tarjeta titulo="Por atender">
            <Filtros {...filtros} estados={ESTADOS} />
            <Tabla columnas={COLUMNAS} filas={filtrados} />
          </Tarjeta>
          <Nota>RN-04: solo un requerimiento en estado Aprobado puede atenderse mediante guía y/o transferencia.</Nota>
        </>
      )}
    </>
  );
}
