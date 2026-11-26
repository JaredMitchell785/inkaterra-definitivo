// Configuración de cada rol: carpeta de rutas, página inicial y menú lateral
export const ROLES = {
  coordinador: {
    nombre: 'Coordinador de Logística',
    base: '/coordinador',
    inicio: '/coordinador/requerimientos',
    menu: [
      { ruta: '/coordinador/requerimientos', texto: 'Requerimientos', icono: 'list' },
      { ruta: '/coordinador/ordenes', texto: 'Órdenes de compra', icono: 'check' }
    ]
  },
  administrador: {
    nombre: 'Administrador',
    base: '/admin',
    inicio: '/admin/ordenes',
    menu: [
      { ruta: '/admin/ordenes', texto: 'Aprobar órdenes', icono: 'check' },
      { ruta: '/admin/requerimientos', texto: 'Requerimientos', icono: 'list' },
      { ruta: '/admin/historial', texto: 'Historial', icono: 'clock' }
    ]
  },
  almacenero: {
    nombre: 'Almacenero',
    base: '/almacen',
    inicio: '/almacen/ordenes',
    menu: [
      { ruta: '/almacen/ordenes', texto: 'Estado de órdenes', icono: 'list' },
      { ruta: '/almacen/notas', texto: 'Notas de entrada', icono: 'inbox' },
      { ruta: '/almacen/requerimientos', texto: 'Requerimientos', icono: 'list' },
      { ruta: '/almacen/transferencias', texto: 'Transferencias', icono: 'swap' }
    ]
  }
};
