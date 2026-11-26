// Estructura común: menú lateral + barra superior + contenido
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();

  // En celular el menú se cierra al cambiar de página
  useEffect(() => {
    setMenuAbierto(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <Sidebar abierto={menuAbierto} />
      {menuAbierto && <div className="fondo-menu" onClick={() => setMenuAbierto(false)} />}
      <div className="workspace">
        <Topbar onMenu={() => setMenuAbierto(true)} />
        <main className="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
