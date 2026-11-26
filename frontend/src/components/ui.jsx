// Componentes pequeños que se repiten en todas las pantallas
import Icono from './Icono.jsx';

export function Encabezado({ etiqueta, ruta, titulo, subtitulo, children }) {
  return (
    <div className="encabezado">
      <div>
        <span className="etiqueta">{etiqueta}</span>
        <p className="miga">{ruta}</p>
        <h1>{titulo}</h1>
        <p className="subtitulo">{subtitulo}</p>
      </div>
      {children && <div className="acciones">{children}</div>}
    </div>
  );
}

export function Tarjeta({ titulo, subtitulo, children }) {
  return (
    <section className="tarjeta">
      {titulo && (
        <header>
          <h2>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

const TONOS = {
  Registrado: 'gris',
  Revisado: 'azul',
  Aprobado: 'verde',
  Observado: 'ambar',
  Rechazado: 'rojo',
  Atendido: 'verde',
  'Atendido parcial': 'ambar',
  Disponible: 'verde',
  'Todo disponible': 'verde',
  Parcial: 'ambar',
  'Sin stock': 'rojo',
  'Stock suficiente': 'verde',
  'Supera el stock': 'rojo',
  'Supera lo pendiente': 'rojo',
  'Cantidad no válida': 'rojo',
  'No se envía': 'gris'
};

export function Estado({ valor }) {
  return <span className={`badge ${TONOS[valor] || 'gris'}`}>{valor}</span>;
}

// pasos = [{ texto, tono }]
export function Pasos({ pasos }) {
  return (
    <ol className="pasos">
      {pasos.map((paso) => (
        <li key={paso.texto} className={paso.tono}>{paso.texto}</li>
      ))}
    </ol>
  );
}

export function DatosEnCajas({ datos }) {
  return (
    <dl className="cajas">
      {datos.map(([nombre, valor]) => (
        <div key={nombre}>
          <dt>{nombre}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DatosEnFilas({ datos }) {
  return (
    <dl className="filas">
      {datos.map(([nombre, valor]) => (
        <div key={nombre}>
          <dt>{nombre}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Nota({ children }) {
  return (
    <div className="nota">
      <Icono nombre="info" />
      <p>{children}</p>
    </div>
  );
}

export function Validacion({ correcta, children }) {
  return (
    <p className="validacion">
      <Icono nombre={correcta ? 'check-verde' : 'x'} tamano={16} />
      {children}
    </p>
  );
}

export function Alerta({ children }) {
  return (
    <div className="alerta" role="alert">
      <Icono nombre="alert" />
      <p>{children}</p>
    </div>
  );
}

export function Cargando({ error }) {
  return error ? <Alerta>{error}</Alerta> : <p className="cargando">Cargando…</p>;
}

// columnas = [{ titulo, ancho, valor: (fila) => contenido }]
// Si no hay espacio suficiente, cada fila se muestra como una tarjeta (ver styles.css)
export function Tabla({ columnas, filas, clave = 'codigo', vacio = 'No hay registros para mostrar.' }) {
  if (filas.length === 0) return <p className="vacio">{vacio}</p>;

  return (
    <div className="tabla-contenedor">
      <div className={`tabla ${columnas.length >= 7 ? 'ancha' : ''}`}>
        <table>
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c.titulo} style={{ width: c.ancho }}>{c.titulo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila[clave]}>
                {columnas.map((c) => (
                  <td key={c.titulo} data-titulo={c.titulo}>{c.valor(fila)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Resumen({ datos }) {
  return (
    <div className="resumen">
      {datos.map(([texto, numero]) => (
        <div key={texto}>
          <strong>{numero}</strong>
          <span>{texto}</span>
        </div>
      ))}
    </div>
  );
}
