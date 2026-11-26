import { NavLink } from 'react-router-dom';
import { useSesion } from '../context/SesionContext.jsx';
import { ROLES } from '../roles.js';
import Icono from './Icono.jsx';

export default function Sidebar({ abierto }) {
  const { usuario } = useSesion();
  const rol = ROLES[usuario.rol];

  return (
    <aside className={`sidebar ${abierto ? 'abierto' : ''}`}>
      <div className="sidebar-arriba">
        <div className="marca">
          <span className="marca-logo">I</span>
          INKATERRA
        </div>
        <div className="rol">
          <small>ROL</small>
          <span>{rol.nombre}</span>
        </div>
        <nav>
          {rol.menu.map((item) => (
            <NavLink key={item.ruta} to={item.ruta}>
              <Icono nombre={item.icono} />
              {item.texto}
            </NavLink>
          ))}
        </nav>
      </div>
      <p className="version">Ayuda · Sistema v2.4</p>
    </aside>
  );
}
