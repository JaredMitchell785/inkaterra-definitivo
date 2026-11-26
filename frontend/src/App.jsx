import { Navigate, Route, Routes } from 'react-router-dom';
import { useSesion } from './context/SesionContext.jsx';
import { ROLES } from './roles.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import ListaRequerimientos from './pages/requerimientos/ListaRequerimientos.jsx';
import DetalleRequerimiento from './pages/requerimientos/DetalleRequerimiento.jsx';
import FormRequerimiento from './pages/requerimientos/FormRequerimiento.jsx';
import ListaOrdenes from './pages/ordenes/ListaOrdenes.jsx';
import DetalleOrden from './pages/ordenes/DetalleOrden.jsx';
import FormOrden from './pages/ordenes/FormOrden.jsx';
import ListaNotas from './pages/almacen/ListaNotas.jsx';
import FormNota from './pages/almacen/FormNota.jsx';
import DetalleNota from './pages/almacen/DetalleNota.jsx';
import PorAtender from './pages/almacen/PorAtender.jsx';
import Atender from './pages/almacen/Atender.jsx';
import ListaTransferencias from './pages/almacen/ListaTransferencias.jsx';
import FormTransferencia from './pages/almacen/FormTransferencia.jsx';
import Historial from './pages/admin/Historial.jsx';

// Solo deja entrar a las páginas del rol que inició sesión
function RutaDeRol({ rol }) {
  const { usuario } = useSesion();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) return <Navigate to={ROLES[usuario.rol].inicio} replace />;
  return <Layout />;
}

export default function App() {
  const { usuario } = useSesion();
  const inicio = usuario ? ROLES[usuario.rol].inicio : '/login';

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to={inicio} replace /> : <Login />} />

      <Route path="/coordinador" element={<RutaDeRol rol="coordinador" />}>
        <Route path="requerimientos" element={<ListaRequerimientos />} />
        <Route path="requerimientos/nuevo" element={<FormRequerimiento />} />
        <Route path="requerimientos/:codigo" element={<DetalleRequerimiento />} />
        <Route path="requerimientos/:codigo/editar" element={<FormRequerimiento />} />
        <Route path="ordenes" element={<ListaOrdenes />} />
        <Route path="ordenes/:codigo" element={<DetalleOrden />} />
      </Route>

      <Route path="/admin" element={<RutaDeRol rol="administrador" />}>
        <Route path="ordenes" element={<ListaOrdenes />} />
        <Route path="ordenes/:codigo" element={<DetalleOrden />} />
        <Route path="requerimientos" element={<ListaRequerimientos />} />
        <Route path="requerimientos/:codigo" element={<DetalleRequerimiento />} />
        <Route path="historial" element={<Historial />} />
      </Route>

      <Route path="/almacen" element={<RutaDeRol rol="almacenero" />}>
        <Route path="ordenes" element={<ListaOrdenes />} />
        <Route path="ordenes/nueva" element={<FormOrden />} />
        <Route path="ordenes/:codigo" element={<DetalleOrden />} />
        <Route path="ordenes/:codigo/editar" element={<FormOrden />} />
        <Route path="notas" element={<ListaNotas />} />
        <Route path="notas/nueva/:codigo" element={<FormNota />} />
        <Route path="notas/:codigo" element={<DetalleNota />} />
        <Route path="requerimientos" element={<PorAtender />} />
        <Route path="requerimientos/:codigo" element={<Atender />} />
        <Route path="transferencias" element={<ListaTransferencias />} />
        <Route path="transferencias/nueva/:codigo" element={<FormTransferencia />} />
      </Route>

      <Route path="*" element={<Navigate to={inicio} replace />} />
    </Routes>
  );
}
