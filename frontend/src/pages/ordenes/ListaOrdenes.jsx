// A1 · Bandeja de aprobación, L1 · Estado de órdenes y bandeja de revisión del Coordinador
import { Link } from 'react-router-dom';
import { useSesion } from '../../context/SesionContext.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { ROLES } from '../../roles.js';
import { contarHoy, fechaCorta, soles } from '../../formato.js';
import Filtros, { useFiltros } from '../../components/Filtros.jsx';
import { Cargando, Encabezado, Estado, Nota, Resumen, Tabla, Tarjeta } from '../../components/ui.jsx';

const ESTADOS = ['Registrado', 'Observado', 'Revisado', 'Aprobado', 'Rechazado'];

const TEXTOS = {
  coordinador: {
    etiqueta: 'COORDINADOR', ruta: 'Revisión › Órdenes de compra', titulo: 'Órdenes de compra por revisar',
    subtitulo: 'Revisa las órdenes registradas antes de enviarlas a aprobación.', tarjeta: 'Bandeja de revisión'
  },
  administrador: {
    etiqueta: 'ADMINISTRADOR · CU-06', ruta: 'Aprobaciones › Órdenes de compra', titulo: 'Órdenes de compra por aprobar',
    subtitulo: 'Solo se pueden aprobar las órdenes que ya fueron revisadas por el Coordinador.', tarjeta: 'Bandeja de aprobación'
  },
  almacenero: {
    etiqueta: 'ALMACENERO · CU-04', ruta: 'Órdenes de compra › Estado', titulo: 'Órdenes de compra',
    subtitulo: 'Consulta en qué etapa del flujo está cada orden.', tarjeta: 'Estado de las órdenes'
  }
};

export default function ListaOrdenes() {
  const { usuario } = useSesion();
  const { datos, error } = useDatos('/ordenes');
  const lista = datos || [];
  const { filtrados, filtros } = useFiltros(lista, (o) => `${o.codigo} ${o.proveedor} ${o.solicitante}`);

  const rol = usuario.rol;
  const base = ROLES[rol].base;
  const textos = TEXTOS[rol];
  const cuantos = (estado) => lista.filter((o) => o.estado === estado).length;

  function accion(o) {
    let boton = { texto: 'Ver detalle', ruta: `${base}/ordenes/${o.codigo}`, clase: 'secundario' };
    if (rol === 'coordinador' && o.estado === 'Registrado') boton = { ...boton, texto: 'Revisar', clase: 'primario' };
    if (rol === 'administrador' && o.estado === 'Revisado') boton = { ...boton, texto: 'Decidir', clase: 'primario' };
    // RN-02: solo las aprobadas permiten registrar la nota de entrada
    if (rol === 'almacenero' && o.estado === 'Aprobado' && !o.notaEntrada) {
      boton = { texto: 'Registrar nota de entrada', ruta: `${base}/notas/nueva/${o.codigo}`, clase: 'primario' };
    }
    return <Link className={`boton chico ${boton.clase}`} to={boton.ruta}>{boton.texto}</Link>;
  }

  const columnas = [
    { titulo: 'Orden', valor: (o) => o.codigo },
    { titulo: 'Proveedor', valor: (o) => o.proveedor },
    ...(rol === 'almacenero' ? [] : [{ titulo: 'Solicitante', valor: (o) => o.solicitante }]),
    { titulo: 'Fecha', valor: (o) => fechaCorta(o.fecha) },
    { titulo: 'Total', valor: (o) => soles(o.total) },
    { titulo: 'Estado', valor: (o) => <Estado valor={o.estado} /> },
    { titulo: 'Acción', valor: accion }
  ];

  const resumen = {
    coordinador: [['Por revisar', cuantos('Registrado')], ['Observadas', cuantos('Observado')], ['Revisadas hoy', contarHoy(lista, 'revisar')]],
    administrador: [['Por aprobar', cuantos('Revisado')], ['Aprobadas hoy', contarHoy(lista, 'aprobar')], ['Rechazadas', cuantos('Rechazado')]]
  }[rol];

  return (
    <>
      <Encabezado etiqueta={textos.etiqueta} ruta={textos.ruta} titulo={textos.titulo} subtitulo={textos.subtitulo}>
        {rol === 'almacenero' && <Link className="boton primario" to={`${base}/ordenes/nueva`}>Nueva orden de compra</Link>}
      </Encabezado>

      {!datos ? <Cargando error={error} /> : (
        <>
          {resumen && <Resumen datos={resumen} />}
          <Tarjeta titulo={textos.tarjeta}>
            <Filtros {...filtros} estados={ESTADOS} />
            <Tabla columnas={columnas} filas={filtrados} />
          </Tarjeta>
          {rol === 'almacenero' && (
            <Nota>Solo las órdenes en estado Aprobado habilitan el registro de la nota de entrada (RN-02).</Nota>
          )}
        </>
      )}
    </>
  );
}
