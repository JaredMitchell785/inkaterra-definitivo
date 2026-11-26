// Historial general: quién hizo qué y cuándo
import { Link } from 'react-router-dom';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaHora } from '../../formato.js';
import Filtros, { useFiltros } from '../../components/Filtros.jsx';
import { Cargando, Encabezado, Tabla, Tarjeta } from '../../components/ui.jsx';

const rutaDe = (codigo) => `/admin/${codigo.startsWith('OC') ? 'ordenes' : 'requerimientos'}/${codigo}`;

export default function Historial() {
  const { datos, error } = useDatos('/historial');
  const lista = (datos || []).map((e, i) => ({ ...e, id: i }));
  const { filtrados, filtros } = useFiltros(lista, (e) => `${e.documento} ${e.accion} ${e.usuario}`);

  return (
    <>
      <Encabezado
        etiqueta="ADMINISTRADOR"
        ruta="Historial"
        titulo="Historial de acciones"
        subtitulo="Usuario, fecha y hora de cada acción sobre órdenes y requerimientos."
      />
      {!datos ? <Cargando error={error} /> : (
        <Tarjeta titulo="Actividad reciente">
          <Filtros {...filtros} />
          <Tabla
            clave="id"
            filas={filtrados}
            columnas={[
              { titulo: 'Documento', valor: (e) => <Link to={rutaDe(e.documento)}>{e.documento}</Link> },
              { titulo: 'Acción', valor: (e) => e.accion },
              { titulo: 'Usuario', valor: (e) => e.usuario },
              { titulo: 'Fecha y hora', valor: (e) => fechaHora(e.fecha) }
            ]}
          />
        </Tarjeta>
      )}
    </>
  );
}
