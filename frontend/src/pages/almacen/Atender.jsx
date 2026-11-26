// L5 · Atender requerimiento
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaHora } from '../../formato.js';
import Historial from '../../components/Historial.jsx';
import { Alerta, Cargando, DatosEnFilas, Encabezado, Estado, Nota, Pasos, Tabla, Tarjeta } from '../../components/ui.jsx';

export default function Atender() {
  const { codigo } = useParams();
  const { datos: r, error, setDatos } = useDatos(`/requerimientos/${codigo}`);
  const { ocupado, ejecutar, avisar } = useAccion();

  if (!r) return <Cargando error={error} />;

  const atendible = ['Aprobado', 'Atendido parcial', 'Atendido'].includes(r.estado);
  const hayParaEnviar = r.items.some((i) => i.pendiente > 0 && i.stock > 0);
  const puedeTransferir = atendible && r.estado !== 'Atendido' && hayParaEnviar;

  const pasos = [
    { texto: 'Aprobado', tono: atendible ? 'verde' : 'gris' },
    { texto: 'Guía generada', tono: r.guia ? 'verde' : atendible ? 'ambar' : 'gris' },
    {
      texto: r.estado === 'Atendido parcial' ? 'Transferido (parcial)' : 'Transferido',
      tono: r.estado === 'Atendido' ? 'verde' : r.estado === 'Atendido parcial' || r.guia ? 'ambar' : 'gris'
    }
  ];

  const generarGuia = () =>
    ejecutar(async () => {
      const actualizado = await api(`/requerimientos/${codigo}/guia`, { metodo: 'POST' });
      setDatos(actualizado);
      avisar('Guía generada', `Se creó la guía ${actualizado.guia.codigo}.`);
    });

  const huboEnvios = r.items.some((i) => i.atendido > 0);
  const columnas = [
    { titulo: 'Código', ancho: 120, valor: (i) => i.codigo },
    { titulo: 'Descripción', valor: (i) => i.descripcion },
    { titulo: 'Solicitado', ancho: 100, valor: (i) => i.cantidad },
    ...(huboEnvios ? [{ titulo: 'Pendiente', ancho: 100, valor: (i) => i.pendiente }] : []),
    { titulo: 'Disponible', ancho: 100, valor: (i) => i.stock },
    { titulo: 'Estado', ancho: 140, valor: (i) => <Estado valor={i.disponibilidad} /> }
  ];

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-12"
        ruta={`Requerimientos › ${r.codigo}`}
        titulo={r.codigo}
        subtitulo="Elige cómo atender: guía, transferencia o ambas, según la disponibilidad."
      >
        <Link className="boton secundario" to="/almacen/requerimientos">Volver</Link>
      </Encabezado>

      {!atendible && <Alerta>Este requerimiento está en estado {r.estado}. Solo se atienden los aprobados (RN-04).</Alerta>}

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Estado de atención">
            <Pasos pasos={pasos} />
          </Tarjeta>
          <Tarjeta titulo="Disponibilidad por producto" subtitulo="Stock en Reserva Amazónica · Principal">
            <Tabla columnas={columnas} filas={r.items} />
          </Tarjeta>
          <Tarjeta titulo="Opciones de atención" subtitulo="Puedes usar una opción o ambas (RN-05)">
            <div className="opciones">
              <div>
                <span className="etiqueta">CU-13</span>
                <h3>Generar guía</h3>
                <p>Documenta la atención aunque no todo esté disponible. La transferencia puede registrarse después.</p>
                <button className="boton secundario" disabled={!atendible || Boolean(r.guia) || ocupado} onClick={generarGuia}>
                  {r.guia ? `Guía ${r.guia.codigo} generada` : 'Generar guía'}
                </button>
              </div>
              <div>
                <span className="etiqueta">CU-14</span>
                <h3>Registrar transferencia</h3>
                <p>Descuenta stock del almacén de origen. Requiere stock suficiente.</p>
                {puedeTransferir ? (
                  <Link className="boton primario" to={`/almacen/transferencias/nueva/${r.codigo}`}>
                    Registrar transferencia
                  </Link>
                ) : (
                  <button className="boton primario" disabled>
                    {r.estado === 'Atendido' ? 'Atención completa' : 'Sin stock o no aprobado'}
                  </button>
                )}
              </div>
            </div>
          </Tarjeta>
        </div>
        <aside>
          <Tarjeta titulo="Datos del requerimiento">
            <DatosEnFilas datos={[
              ['Solicitante', r.solicitante],
              ['Almacén', r.almacen.replace('Almacén ', '')],
              ['Prioridad', r.prioridad],
              ['Ítems', r.items.length]
            ]} />
          </Tarjeta>
          {r.guia && (
            <Tarjeta titulo="Guía">
              <DatosEnFilas datos={[
                ['Número', r.guia.codigo],
                ['Emitida', fechaHora(r.guia.fecha)],
                ['Por', r.guia.usuario]
              ]} />
            </Tarjeta>
          )}
          <Historial eventos={r.historial} />
          <Nota>RN-05: puedes generar solo la guía, solo la transferencia, o ambas, según la disponibilidad real.</Nota>
        </aside>
      </div>
    </>
  );
}
