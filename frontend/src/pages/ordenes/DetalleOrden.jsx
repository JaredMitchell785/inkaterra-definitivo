// A2 · Aprobar, A3 · Rechazar y A4 · Orden aprobada y notificada
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useSesion } from '../../context/SesionContext.jsx';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import { ROLES } from '../../roles.js';
import { fechaNumerica, fechaRelativa, plural, soles } from '../../formato.js';
import { pasosDeAprobacion } from '../../pasos.js';
import Historial from '../../components/Historial.jsx';
import { ModalConfirmar, ModalMotivo } from '../../components/Modal.jsx';
import {
  Alerta, Cargando, DatosEnCajas, DatosEnFilas, Encabezado, Nota, Pasos, Tabla, Tarjeta
} from '../../components/ui.jsx';

const COLUMNAS = [
  { titulo: 'Código', ancho: 130, valor: (i) => i.codigo },
  { titulo: 'Descripción', valor: (i) => i.descripcion },
  { titulo: 'Cantidad', ancho: 100, valor: (i) => i.cantidad },
  { titulo: 'P. unitario', ancho: 120, valor: (i) => soles(i.precio) },
  { titulo: 'Subtotal', ancho: 120, valor: (i) => soles(i.subtotal) }
];

const ETIQUETAS = { coordinador: 'COORDINADOR', administrador: 'ADMINISTRADOR · CU-06', almacenero: 'ALMACENERO · CU-04' };

export default function DetalleOrden() {
  const { codigo } = useParams();
  const { usuario } = useSesion();
  const { datos: orden, error, setDatos } = useDatos(`/ordenes/${codigo}`);
  const { ocupado, ejecutar, avisar } = useAccion();
  const [modal, setModal] = useState(null);
  const navegar = useNavigate();

  if (!orden) return <Cargando error={error} />;

  const rol = usuario.rol;
  const base = ROLES[rol].base;
  const bandeja = `${base}/ordenes`;
  const cerrar = () => setModal(null);

  const cambiarEstado = (accion, titulo, texto, motivo) =>
    ejecutar(async () => {
      setDatos(await api(`/ordenes/${codigo}/${accion}`, { metodo: 'POST', datos: { motivo } }));
      cerrar();
      avisar(titulo, texto);
    });

  const eliminar = () =>
    ejecutar(async () => {
      await api(`/ordenes/${codigo}`, { metodo: 'DELETE' });
      avisar('Orden eliminada', `${codigo} se eliminó.`);
      navegar(bandeja);
    });

  const esAlmacen = rol === 'almacenero';
  const puedeRevisar = rol === 'coordinador' && orden.estado === 'Registrado';
  const puedeDecidir = rol === 'administrador' && orden.estado === 'Revisado';
  const puedeEditar = esAlmacen && ['Registrado', 'Observado'].includes(orden.estado);
  const puedeEliminar = esAlmacen && ['Registrado', 'Observado', 'Rechazado'].includes(orden.estado);

  let subtitulo = `Estado de la orden: ${orden.estado}.`;
  if (puedeRevisar) subtitulo = 'Revisa el contenido antes de enviarla a aprobación del Administrador.';
  if (puedeDecidir) subtitulo = 'Revisada por el Coordinador. Decide si se aprueba o se rechaza.';
  if (orden.estado === 'Aprobado') {
    subtitulo = orden.notaEntrada
      ? `Orden aprobada y recibida con la nota ${orden.notaEntrada}.`
      : 'Orden aprobada. Ya puede usarse para registrar su nota de entrada.';
  }

  return (
    <>
      <Encabezado
        etiqueta={ETIQUETAS[rol]}
        ruta={`${rol === 'administrador' ? 'Aprobaciones' : 'Órdenes de compra'} › ${orden.codigo}`}
        titulo={orden.codigo}
        subtitulo={subtitulo}
      >
        <Link className="boton secundario" to={bandeja}>Volver a la bandeja</Link>
        {puedeEliminar && <button className="boton secundario" onClick={() => setModal('eliminar')}>Eliminar</button>}
        {puedeEditar && <Link className="boton secundario" to={`${bandeja}/${codigo}/editar`}>Editar</Link>}
        {esAlmacen && orden.estado === 'Aprobado' && (
          orden.notaEntrada
            ? <Link className="boton primario" to={`${base}/notas/${orden.notaEntrada}`}>Ver nota de entrada</Link>
            : <Link className="boton primario" to={`${base}/notas/nueva/${codigo}`}>Registrar nota de entrada</Link>
        )}
        {puedeRevisar && (
          <>
            <button className="boton alerta-boton" onClick={() => setModal('observar')}>Observar</button>
            <button className="boton primario" disabled={ocupado}
              onClick={() => cambiarEstado('revisar', 'Orden revisada', 'Se envió a aprobación del Administrador.')}>
              Marcar como revisada
            </button>
          </>
        )}
        {puedeDecidir && (
          <>
            <button className="boton peligro" onClick={() => setModal('rechazar')}>Rechazar</button>
            <button className="boton primario" disabled={ocupado}
              onClick={() => cambiarEstado('aprobar', 'Orden aprobada',
                'Se registró el aviso al solicitante (simulado) y quedó en el historial.')}>
              Aprobar orden
            </button>
          </>
        )}
      </Encabezado>

      {orden.observacion && <Alerta>Motivo registrado: {orden.observacion}</Alerta>}

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Estado actual">
            <Pasos pasos={pasosDeAprobacion(orden.estado)} />
          </Tarjeta>
          <Tarjeta titulo="Información de la orden">
            <DatosEnCajas datos={[
              ['Proveedor', orden.proveedor],
              ['Solicitante', orden.solicitante],
              ['Almacén destino', orden.almacen],
              ['Fecha', fechaNumerica(orden.fecha)]
            ]} />
          </Tarjeta>
          <Tarjeta titulo="Productos de la orden"
            subtitulo={`${plural(orden.items.length, 'ítem')} · Total ${soles(orden.total)}`}>
            <Tabla columnas={COLUMNAS} filas={orden.items} />
          </Tarjeta>
        </div>
        <aside>
          <Historial eventos={orden.historial} />
          {orden.correo ? (
            <Tarjeta titulo="Notificación por correo" subtitulo="Envío simulado (sin servidor de correo)">
              <DatosEnFilas datos={[
                ['Para', orden.correo.para],
                ['Asunto', orden.correo.asunto],
                ['Registrado', fechaRelativa(orden.correo.enviado)]
              ]} />
            </Tarjeta>
          ) : (
            <Nota>Al aprobar se registra un aviso por correo y se guarda tu usuario, fecha y hora en el historial.</Nota>
          )}
        </aside>
      </div>

      {modal === 'observar' && (
        <ModalMotivo
          titulo="Observar orden de compra"
          descripcion="La orden volverá al almacén para que la corrija."
          etiqueta="Motivo de la observación"
          boton="Enviar observación"
          claseBoton="alerta-boton"
          onCerrar={cerrar}
          onConfirmar={(motivo) => cambiarEstado('observar', 'Observación enviada', 'Quedó registrada en el historial.', motivo)}
        />
      )}
      {modal === 'rechazar' && (
        <ModalMotivo
          titulo="Rechazar orden de compra"
          descripcion="La orden quedará en estado Rechazado y el solicitante será notificado."
          etiqueta="Motivo del rechazo"
          boton="Confirmar rechazo"
          claseBoton="peligro"
          onCerrar={cerrar}
          onConfirmar={(motivo) => cambiarEstado('rechazar', 'Orden rechazada', 'Se registró el motivo en el historial.', motivo)}
        />
      )}
      {modal === 'eliminar' && (
        <ModalConfirmar
          titulo="Eliminar orden de compra"
          descripcion={`¿Seguro que deseas eliminar ${orden.codigo}? Esta acción no se puede deshacer.`}
          boton="Eliminar"
          onCerrar={cerrar}
          onConfirmar={eliminar}
        />
      )}
    </>
  );
}
