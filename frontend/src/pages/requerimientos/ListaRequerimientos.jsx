// C1 · Bandeja de revisión (Coordinador) y bandeja de aprobación (Administrador)
import { Link } from 'react-router-dom';
import { useSesion } from '../../context/SesionContext.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { ROLES } from '../../roles.js';
import { contarHoy, fechaCorta, plural } from '../../formato.js';
import Filtros, { useFiltros } from '../../components/Filtros.jsx';
import { Cargando, Encabezado, Estado, Resumen, Tabla, Tarjeta } from '../../components/ui.jsx';

const ESTADOS = ['Registrado', 'Observado', 'Revisado', 'Aprobado', 'Rechazado', 'Atendido parcial', 'Atendido'];

export default function ListaRequerimientos() {
  const { usuario } = useSesion();
  const { datos, error } = useDatos('/requerimientos');
  const lista = datos || [];
  const { filtrados, filtros } = useFiltros(lista, (r) => `${r.codigo} ${r.solicitante} ${r.almacen}`);

  const esCoordinador = usuario.rol === 'coordinador';
  const base = ROLES[usuario.rol].base;
  const porAtender = esCoordinador ? 'Registrado' : 'Revisado';
  const cuantos = (estado) => lista.filter((r) => r.estado === estado).length;

  const resumen = esCoordinador
    ? [['Por revisar', cuantos('Registrado')], ['Observados', cuantos('Observado')], ['Revisados hoy', contarHoy(lista, 'revisar')]]
    : [['Por aprobar', cuantos('Revisado')], ['Aprobados hoy', contarHoy(lista, 'aprobar')], ['Rechazados', cuantos('Rechazado')]];

  const columnas = [
    { titulo: 'Solicitud', valor: (r) => r.codigo },
    { titulo: 'Solicitante', valor: (r) => r.solicitante },
    { titulo: 'Almacén solicitante', valor: (r) => r.almacen },
    { titulo: 'Fecha', valor: (r) => fechaCorta(r.fecha) },
    { titulo: 'Ítems', valor: (r) => plural(r.items.length, 'ítem') },
    { titulo: 'Prioridad', valor: (r) => r.prioridad },
    { titulo: 'Estado', valor: (r) => <Estado valor={r.estado} /> },
    {
      titulo: 'Acción',
      valor: (r) => {
        const pendiente = r.estado === porAtender;
        return (
          <Link className={`boton chico ${pendiente ? 'primario' : 'secundario'}`} to={`${base}/requerimientos/${r.codigo}`}>
            {pendiente ? (esCoordinador ? 'Revisar' : 'Decidir') : 'Ver detalle'}
          </Link>
        );
      }
    }
  ];

  return (
    <>
      <Encabezado
        etiqueta={esCoordinador ? 'COORDINADOR · CU-10' : 'ADMINISTRADOR'}
        ruta={`${esCoordinador ? 'Revisión' : 'Aprobaciones'} › Requerimientos`}
        titulo={esCoordinador ? 'Requerimientos por revisar' : 'Requerimientos por aprobar'}
        subtitulo={esCoordinador
          ? 'Revisa los requerimientos registrados antes de enviarlos a aprobación.'
          : 'Solo se pueden aprobar los requerimientos que ya fueron revisados por el Coordinador.'}
      >
        {esCoordinador && (
          <Link className="boton primario" to={`${base}/requerimientos/nuevo`}>Nuevo requerimiento</Link>
        )}
      </Encabezado>

      {!datos ? <Cargando error={error} /> : (
        <>
          <Resumen datos={resumen} />
          <Tarjeta titulo={esCoordinador ? 'Bandeja de requerimientos' : 'Bandeja de aprobación'}>
            <Filtros {...filtros} estados={ESTADOS} />
            <Tabla columnas={columnas} filas={filtrados} />
          </Tarjeta>
        </>
      )}
    </>
  );
}
