import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { useSesion } from '../context/SesionContext.jsx';
import { ROLES } from '../roles.js';
import Icono from './Icono.jsx';

// Buscador general de requerimientos, órdenes y guías
function Buscador() {
  const { usuario } = useSesion();
  const { pathname } = useLocation();
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState([]);

  useEffect(() => setTexto(''), [pathname]);

  useEffect(() => {
    setResultados([]);
    if (texto.trim().length < 2) return;
    let activo = true;
    // Espera a que el usuario deje de escribir
    const reloj = setTimeout(() => {
      api(`/buscar?q=${encodeURIComponent(texto)}`)
        .then((datos) => activo && setResultados(datos))
        .catch(() => {});
    }, 250);
    return () => {
      activo = false;
      clearTimeout(reloj);
    };
  }, [texto]);

  const base = ROLES[usuario.rol].base;
  const carpeta = { requerimiento: 'requerimientos', orden: 'ordenes' };

  return (
    <div className="buscador">
      <Icono nombre="search" tamano={16} />
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar requerimiento, orden o guía…"
        aria-label="Buscar requerimiento, orden o guía"
      />
      {resultados.length > 0 && (
        <ul className="resultados">
          {resultados.map((r) => (
            <li key={r.codigo}>
              <Link to={`${base}/${carpeta[r.tipo]}/${r.codigo}`} onClick={() => setTexto('')}>
                <strong>{r.codigo}</strong>
                <span>{r.detalle}{r.guia ? ` · ${r.guia}` : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Topbar({ onMenu }) {
  const { usuario, salir } = useSesion();
  const iniciales = usuario.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2);

  return (
    <header className="topbar">
      <button className="boton-menu" onClick={onMenu} aria-label="Abrir menú">
        <Icono nombre="menu" tamano={22} />
      </button>
      <Buscador />
      <div className="topbar-acciones">
        <span className="chip-almacen">Reserva Amazónica · Principal</span>
        <span className="avatar">{iniciales}</span>
        <span className="usuario">{usuario.nombre} · {usuario.cargo}</span>
        <button className="enlace" onClick={salir}>Salir</button>
      </div>
    </header>
  );
}
