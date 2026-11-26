import { Link } from 'react-router-dom';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaHora, plural } from '../../formato.js';
import { Cargando, Encabezado, Tabla, Tarjeta } from '../../components/ui.jsx';

export default function ListaNotas() {
  const ordenes = useDatos('/ordenes');
  const notas = useDatos('/notas-entrada');

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-07"
        ruta="Notas de entrada"
        titulo="Notas de entrada"
        subtitulo="Registra la recepción de las órdenes aprobadas."
      />
      {!ordenes.datos || !notas.datos ? <Cargando error={ordenes.error || notas.error} /> : (
        <>
          <Tarjeta titulo="Órdenes pendientes de recepción">
            <Tabla
              vacio="No hay órdenes aprobadas pendientes de recibir."
              filas={ordenes.datos.filter((o) => o.estado === 'Aprobado' && !o.notaEntrada)}
              columnas={[
                { titulo: 'Orden', valor: (o) => o.codigo },
                { titulo: 'Proveedor', valor: (o) => o.proveedor },
                { titulo: 'Ítems', valor: (o) => plural(o.items.length, 'ítem') },
                {
                  titulo: 'Acción',
                  valor: (o) => (
                    <Link className="boton chico primario" to={`/almacen/notas/nueva/${o.codigo}`}>
                      Registrar nota de entrada
                    </Link>
                  )
                }
              ]}
            />
          </Tarjeta>
          <Tarjeta titulo="Notas registradas">
            <Tabla
              vacio="Todavía no se registraron notas de entrada."
              filas={notas.datos}
              columnas={[
                { titulo: 'Nota', valor: (n) => n.codigo },
                { titulo: 'Orden', valor: (n) => n.orden },
                { titulo: 'Registrada por', valor: (n) => n.usuario },
                { titulo: 'Fecha', valor: (n) => fechaHora(n.fecha) },
                {
                  titulo: 'Acción',
                  valor: (n) => <Link className="boton chico secundario" to={`/almacen/notas/${n.codigo}`}>Ver detalle</Link>
                }
              ]}
            />
          </Tarjeta>
        </>
      )}
    </>
  );
}
