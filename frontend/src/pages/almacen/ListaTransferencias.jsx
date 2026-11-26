import { Link } from 'react-router-dom';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaHora } from '../../formato.js';
import { Cargando, Encabezado, Estado, Tabla, Tarjeta } from '../../components/ui.jsx';

export default function ListaTransferencias() {
  const requerimientos = useDatos('/requerimientos');
  const transferencias = useDatos('/transferencias');

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-14"
        ruta="Transferencias"
        titulo="Transferencias"
        subtitulo="Envíos desde Reserva Amazónica hacia los almacenes solicitantes."
      />
      {!requerimientos.datos || !transferencias.datos ? (
        <Cargando error={requerimientos.error || transferencias.error} />
      ) : (
        <>
          <Tarjeta titulo="Requerimientos pendientes de transferir">
            <Tabla
              vacio="No hay requerimientos pendientes."
              filas={requerimientos.datos.filter((r) => ['Aprobado', 'Atendido parcial'].includes(r.estado))}
              columnas={[
                { titulo: 'Requerimiento', valor: (r) => r.codigo },
                { titulo: 'Destino', valor: (r) => r.almacen },
                { titulo: 'Disponibilidad', valor: (r) => <Estado valor={r.disponibilidad} /> },
                {
                  titulo: 'Acción',
                  valor: (r) => (
                    <Link className="boton chico primario" to={`/almacen/transferencias/nueva/${r.codigo}`}>
                      Nueva transferencia
                    </Link>
                  )
                }
              ]}
            />
          </Tarjeta>
          <Tarjeta titulo="Transferencias registradas">
            <Tabla
              vacio="Todavía no hay transferencias."
              filas={transferencias.datos}
              columnas={[
                { titulo: 'Transferencia', valor: (t) => t.codigo },
                { titulo: 'Requerimiento', valor: (t) => t.requerimiento },
                { titulo: 'Destino', valor: (t) => t.destino },
                { titulo: 'Productos', valor: (t) => <div>{t.items.map((i) => <div key={i.codigo}>{i.cantidad} × {i.codigo}</div>)}</div> },
                { titulo: 'Registrada por', valor: (t) => t.usuario },
                { titulo: 'Fecha', valor: (t) => fechaHora(t.fecha) }
              ]}
            />
          </Tarjeta>
        </>
      )}
    </>
  );
}
