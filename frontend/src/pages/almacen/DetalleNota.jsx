// L3 · Stock actualizado
import { Link, useParams } from 'react-router-dom';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaHora } from '../../formato.js';
import Historial from '../../components/Historial.jsx';
import { Cargando, DatosEnCajas, Encabezado, Nota, Tabla, Tarjeta } from '../../components/ui.jsx';

const COLUMNAS = [
  { titulo: 'Código', ancho: 130, valor: (i) => i.codigo },
  { titulo: 'Descripción', valor: (i) => i.descripcion },
  { titulo: 'Stock anterior', ancho: 130, valor: (i) => i.stockAnterior },
  { titulo: 'Ingreso', ancho: 100, valor: (i) => <strong className="ingreso">+{i.recibido}</strong> },
  { titulo: 'Stock actual', ancho: 120, valor: (i) => <strong>{i.stockActual}</strong> }
];

export default function DetalleNota() {
  const { codigo } = useParams();
  const { datos: nota, error } = useDatos(`/notas-entrada/${codigo}`);

  if (!nota) return <Cargando error={error} />;

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-07 + CU-17"
        ruta={`Notas de entrada › ${nota.codigo}`}
        titulo={nota.codigo}
        subtitulo="Nota de entrada registrada. El inventario ya fue actualizado."
      >
        <Link className="boton secundario" to="/almacen/ordenes">Volver a órdenes</Link>
      </Encabezado>

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Resumen de la nota">
            <DatosEnCajas datos={[
              ['Nota', nota.codigo],
              ['Orden', nota.orden],
              ['Registrada por', nota.usuario],
              ['Fecha', fechaHora(nota.fecha)]
            ]} />
          </Tarjeta>
          <Tarjeta titulo="Stock actualizado" subtitulo="Aumento automático por la nota de entrada">
            <Tabla columnas={COLUMNAS} filas={nota.items} />
          </Tarjeta>
        </div>
        <aside>
          <Historial eventos={[{ accion: 'Registró la nota de entrada', usuario: nota.usuario, fecha: nota.fecha }]} />
          <Nota>RN-03: el inventario aumenta únicamente cuando se registra una nota de entrada.</Nota>
        </aside>
      </div>
    </>
  );
}
