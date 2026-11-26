// C2 · Revisar requerimiento y C3 · Observar requerimiento
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import { ROLES } from '../../roles.js';
import { fechaHora, plural } from '../../formato.js';
import { pasosDeAprobacion } from '../../pasos.js';
import Historial from '../../components/Historial.jsx';
import { ModalConfirmar, ModalMotivo } from '../../components/Modal.jsx';
import { Alerta, Cargando, DatosEnCajas, Encabezado, Nota, Pasos, Tabla, Tarjeta } from '../../components/ui.jsx';

const COLUMNAS = [
  { titulo: 'Código', ancho: 130, valor: (i) => i.codigo },
  { titulo: 'Descripción', valor: (i) => i.descripcion },
  { titulo: 'Unidad', ancho: 110, valor: (i) => i.unidad },
  { titulo: 'Cant. solicitada', ancho: 140, valor: (i) => i.cantidad }
];

export default function DetalleRequerimiento() {
  const { codigo } = useParams();
  const { usuario } = useSesion();
  const { datos: r, error, setDatos } = useDatos(`/requerimientos/${codigo}`);
  const { ocupado, ejecutar, avisar } = useAccion();
  const [modal, setModal] = useState(null);
  const navegar = useNavigate();

  if (!r) return <Cargando error={error} />;

  const esCoordinador = usuario.rol === 'coordinador';
  const bandeja = `${ROLES[usuario.rol].base}/requerimientos`;
  const cerrar = () => setModal(null);

  const cambiarEstado = (accion, titulo, texto, motivo) =>
    ejecutar(async () => {
      setDatos(await api(`/requerimientos/${codigo}/${accion}`, { metodo: 'POST', datos: { motivo } }));
      cerrar();
      avisar(titulo, texto);
    });

  const eliminar = () =>
    ejecutar(async () => {
      await api(`/requerimientos/${codigo}`, { metodo: 'DELETE' });
      avisar('Requerimiento eliminado', `${codigo} se eliminó de la bandeja.`);
      navegar(bandeja);
    });

  const puedeDecidir = esCoordinador ? r.estado === 'Registrado' : r.estado === 'Revisado';
  const puedeEditar = esCoordinador && ['Registrado', 'Observado'].includes(r.estado);
  const puedeEliminar = esCoordinador && ['Registrado', 'Observado', 'Rechazado'].includes(r.estado);

  let subtitulo = `Estado del requerimiento: ${r.estado}.`;
  if (puedeDecidir) {
    subtitulo = esCoordinador
      ? 'Revisa el contenido antes de enviarlo a aprobación del Administrador.'
      : 'Revisado por el Coordinador. Decide si se aprueba o se rechaza.';
  }

  return (
    <>
      <Encabezado
        etiqueta={esCoordinador ? 'COORDINADOR · CU-10' : 'ADMINISTRADOR'}
        ruta={`${esCoordinador ? 'Revisión' : 'Aprobaciones'} › ${r.codigo}`}
        titulo={r.codigo}
        subtitulo={subtitulo}
      >
        <Link className="boton secundario" to={bandeja}>Volver a la bandeja</Link>
        {puedeEliminar && <button className="boton secundario" onClick={() => setModal('eliminar')}>Eliminar</button>}
        {puedeEditar && <Link className="boton secundario" to={`${bandeja}/${codigo}/editar`}>Editar</Link>}
        {puedeDecidir && esCoordinador && (
          <>
            <button className="boton alerta-boton" onClick={() => setModal('observar')}>Observar</button>
            <button className="boton primario" disabled={ocupado}
              onClick={() => cambiarEstado('revisar', 'Requerimiento revisado', 'Se envió a aprobación del Administrador.')}>
              Marcar como revisado
            </button>
          </>
        )}
        {puedeDecidir && !esCoordinador && (
          <>
            <button className="boton peligro" onClick={() => setModal('rechazar')}>Rechazar</button>
            <button className="boton primario" disabled={ocupado}
              onClick={() => cambiarEstado('aprobar', 'Requerimiento aprobado', 'El almacén ya puede atenderlo.')}>
              Aprobar requerimiento
            </button>
          </>
        )}
      </Encabezado>

      {r.observacion && <Alerta>Motivo registrado: {r.observacion}</Alerta>}

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Estado actual">
            <Pasos pasos={pasosDeAprobacion(r.estado)} />
          </Tarjeta>
          <Tarjeta titulo="Información del requerimiento">
            <DatosEnCajas datos={[
              ['Solicitante', r.solicitante],
              ['Almacén solicitante', r.almacen],
              ['Fecha de registro', fechaHora(r.fecha)],
              ['Prioridad', r.prioridad]
            ]} />
          </Tarjeta>
          <Tarjeta titulo="Productos solicitados" subtitulo={`${plural(r.items.length, 'ítem')} del requerimiento`}>
            <Tabla columnas={COLUMNAS} filas={r.items} />
          </Tarjeta>
        </div>
        <aside>
          <Historial eventos={r.historial} />
          <Nota>
            Flujo obligatorio: Registrado → Revisado → Aprobado. Al revisar u observar se guarda tu usuario, fecha y hora.
          </Nota>
        </aside>
      </div>

      {modal === 'observar' && (
        <ModalMotivo
          titulo="Observar requerimiento"
          descripcion="El requerimiento volverá al solicitante con la observación registrada en el historial."
          etiqueta="Motivo de la observación"
          boton="Enviar observación"
          claseBoton="alerta-boton"
          onCerrar={cerrar}
          onConfirmar={(motivo) => cambiarEstado('observar', 'Observación enviada', 'Quedó registrada en el historial.', motivo)}
        />
      )}
      {modal === 'rechazar' && (
        <ModalMotivo
          titulo="Rechazar requerimiento"
          descripcion="El requerimiento quedará en estado Rechazado."
          etiqueta="Motivo del rechazo"
          boton="Confirmar rechazo"
          claseBoton="peligro"
          onCerrar={cerrar}
          onConfirmar={(motivo) => cambiarEstado('rechazar', 'Requerimiento rechazado', 'Quedó registrado en el historial.', motivo)}
        />
      )}
      {modal === 'eliminar' && (
        <ModalConfirmar
          titulo="Eliminar requerimiento"
          descripcion={`¿Seguro que deseas eliminar ${r.codigo}? Esta acción no se puede deshacer.`}
          boton="Eliminar"
          onCerrar={cerrar}
          onConfirmar={eliminar}
        />
      )}
    </>
  );
}
