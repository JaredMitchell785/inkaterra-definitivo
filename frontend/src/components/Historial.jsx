import { fechaRelativa } from '../formato.js';
import { Tarjeta } from './ui.jsx';

export default function Historial({ eventos }) {
  // Primero el evento más reciente
  const ordenados = [...eventos].reverse();

  return (
    <Tarjeta titulo="Historial" subtitulo="Usuario, fecha y hora de cada acción">
      <ul className="historial">
        {ordenados.map((e, i) => (
          <li key={`${e.fecha}-${i}`}>
            <strong>{e.accion}</strong>
            <span>{e.usuario} · {fechaRelativa(e.fecha)}</span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
