import { useState } from 'react';
import Icono from './Icono.jsx';

// Filtra una lista por texto y por estado
export function useFiltros(lista, textoDe) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');

  const filtrados = lista.filter(
    (elemento) =>
      (!estado || elemento.estado === estado) &&
      textoDe(elemento).toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return { filtrados, filtros: { busqueda, setBusqueda, estado, setEstado } };
}

export default function Filtros({ busqueda, setBusqueda, estado, setEstado, estados }) {
  return (
    <div className="filtros">
      <label className="campo-buscar">
        <Icono nombre="search" tamano={16} />
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en resultados…" />
      </label>
      {estados && (
        <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      )}
    </div>
  );
}
