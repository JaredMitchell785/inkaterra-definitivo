// Datos de ejemplo tomados del diseño en Figma
const fecha = (dia, hora = '09:00') => `2026-${dia}T${hora}:00-05:00`;

const evento = (tipo, accion, usuario, cuando) => ({ tipo, accion, usuario, fecha: cuando });

// Convierte [['ALI-00482', 24], ...] en la lista de productos de un documento
const productosDe = (lista) =>
  lista.map(([codigo, cantidad, atendido = 0]) => ({ codigo, cantidad, atendido }));

function requerimiento(codigo, solicitante, almacen, cuando, prioridad, estado, items) {
  const historial = [evento('registrar', 'Registró el requerimiento', solicitante, cuando)];
  const dia = cuando.slice(5, 10);

  if (estado === 'Observado') {
    historial.push(evento('observar', 'Observó el requerimiento', 'Luis Paredes', fecha(dia, '15:30')));
  }
  if (['Aprobado', 'Atendido parcial'].includes(estado)) {
    historial.push(evento('revisar', 'Revisó el requerimiento', 'Luis Paredes', fecha(dia, '14:05')));
    historial.push(evento('aprobar', 'Aprobó el requerimiento', 'Claudia Mendoza', fecha(dia, '16:20')));
  }

  return {
    codigo, solicitante, almacen, fecha: cuando, prioridad, estado,
    observacion: estado === 'Observado' ? 'Confirmar las cantidades con el almacén.' : '',
    guia: null,
    items: productosDe(items),
    historial
  };
}

function orden(codigo, proveedor, solicitante, cuando, estado, items) {
  const historial = [evento('registrar', 'Registró la orden', solicitante, cuando)];
  const dia = cuando.slice(5, 10);

  if (estado !== 'Registrado') {
    historial.push(evento('revisar', 'Revisó la orden', 'Luis Paredes', fecha(dia, '10:05')));
  }
  if (estado === 'Aprobado') {
    historial.push(evento('aprobar', 'Aprobó la orden', 'Claudia Mendoza', fecha(dia, '10:18')));
  }
  if (estado === 'Rechazado') {
    historial.push(evento('rechazar', 'Rechazó la orden', 'Claudia Mendoza', fecha(dia, '11:00')));
  }

  return {
    codigo, proveedor, solicitante, almacen: 'Reserva Amazónica · Principal',
    fecha: cuando, estado,
    observacion: estado === 'Rechazado' ? 'El precio supera lo cotizado.' : '',
    notaEntrada: null,
    correo: null,
    items: items.map(([codigoProducto, cantidad, precio]) => ({ codigo: codigoProducto, cantidad, precio })),
    historial
  };
}

export function datosIniciales() {
  return {
    usuarios: [
      { usuario: 'coordinador', clave: '1234', nombre: 'Luis Paredes', rol: 'coordinador', cargo: 'Coordinador' },
      { usuario: 'admin', clave: '1234', nombre: 'Claudia Mendoza', rol: 'administrador', cargo: 'Administradora' },
      { usuario: 'almacen', clave: '1234', nombre: 'Carlos Medina', rol: 'almacenero', cargo: 'Almacenero' }
    ],
    solicitantes: ['Rosa Huamán', 'Jorge Salas', 'Ana Torres'],
    almacenes: ['Almacén Reserva Norte', 'Almacén Lodge Río', 'Almacén Cocina Central'],
    proveedores: ['Distribuciones Tambopata SAC', 'Agroselva EIRL', 'Cafetal Madre de Dios', 'Granja Los Pinos'],
    // stock = unidades en el almacén "Reserva Amazónica · Principal"
    productos: [
      { codigo: 'ALI-00482', descripcion: 'Arroz extra graneado 5 kg', unidad: 'Bolsa', precio: 34.5, stock: 36 },
      { codigo: 'BAR-00091', descripcion: 'Café orgánico Tambopata 500 g', unidad: 'Paquete', precio: 29.8, stock: 22 },
      { codigo: 'LIM-00137', descripcion: 'Detergente biodegradable 4 L', unidad: 'Galón', precio: 46.9, stock: 0 },
      { codigo: 'ALI-00510', descripcion: 'Azúcar rubia 5 kg', unidad: 'Bolsa', precio: 21.5, stock: 80 },
      { codigo: 'ALI-00623', descripcion: 'Aceite vegetal 5 L', unidad: 'Bidón', precio: 42, stock: 55 },
      { codigo: 'ALI-00745', descripcion: 'Quinua perlada 1 kg', unidad: 'Bolsa', precio: 14.8, stock: 70 },
      { codigo: 'BAR-00134', descripcion: 'Cacao en polvo 1 kg', unidad: 'Paquete', precio: 33, stock: 45 },
      { codigo: 'BAR-00210', descripcion: 'Infusión de hierba luisa x100', unidad: 'Caja', precio: 18.5, stock: 60 },
      { codigo: 'LIM-00204', descripcion: 'Jabón líquido biodegradable 4 L', unidad: 'Galón', precio: 38, stock: 50 },
      { codigo: 'LIM-00319', descripcion: 'Papel higiénico ecológico x24', unidad: 'Paquete', precio: 27.9, stock: 90 },
      { codigo: 'AMN-00052', descripcion: 'Champú natural 5 L', unidad: 'Bidón', precio: 52, stock: 40 },
      { codigo: 'AMN-00087', descripcion: 'Repelente natural 250 ml', unidad: 'Frasco', precio: 16.5, stock: 100 }
    ],
    requerimientos: [
      requerimiento('REQ-2026-0097', 'Jorge Salas', 'Almacén Lodge Río', fecha('10-06', '08:15'), 'Media', 'Registrado', [
        ['ALI-00510', 10], ['ALI-00623', 6], ['ALI-00745', 8], ['BAR-00134', 5],
        ['BAR-00210', 4], ['LIM-00204', 6], ['LIM-00319', 12], ['AMN-00087', 10]
      ]),
      requerimiento('REQ-2026-0096', 'Rosa Huamán', 'Almacén Reserva Norte', fecha('10-05', '09:42'), 'Alta', 'Registrado', [
        ['ALI-00482', 24], ['BAR-00091', 18], ['LIM-00137', 12], ['ALI-00510', 10],
        ['ALI-00623', 8], ['ALI-00745', 6], ['BAR-00134', 4], ['BAR-00210', 3],
        ['LIM-00204', 5], ['LIM-00319', 10], ['AMN-00052', 2], ['AMN-00087', 12]
      ]),
      requerimiento('REQ-2026-0094', 'Ana Torres', 'Almacén Cocina Central', fecha('10-04', '11:20'), 'Baja', 'Observado', [
        ['ALI-00482', 6], ['ALI-00510', 8], ['ALI-00623', 4], ['ALI-00745', 5], ['BAR-00210', 2]
      ]),
      requerimiento('REQ-2026-0090', 'Rosa Huamán', 'Almacén Reserva Norte', fecha('10-02', '09:05'), 'Media', 'Aprobado', [
        ['ALI-00510', 5], ['ALI-00623', 4], ['ALI-00745', 6], ['BAR-00134', 3], ['BAR-00210', 2], ['LIM-00204', 4]
      ]),
      requerimiento('REQ-2026-0088', 'Jorge Salas', 'Almacén Lodge Río', fecha('10-01', '10:30'), 'Media', 'Aprobado', [
        ['ALI-00482', 24], ['BAR-00091', 18], ['LIM-00137', 12], ['ALI-00510', 8], ['ALI-00623', 6],
        ['ALI-00745', 5], ['BAR-00134', 4], ['BAR-00210', 3], ['LIM-00204', 6]
      ]),
      requerimiento('REQ-2026-0085', 'Ana Torres', 'Almacén Cocina Central', fecha('09-30', '08:50'), 'Alta', 'Atendido parcial', [
        ['ALI-00510', 10, 10], ['LIM-00137', 8, 0], ['BAR-00134', 6, 6], ['AMN-00052', 4, 2]
      ])
    ],
    ordenes: [
      orden('OC-2026-0184', 'Distribuciones Tambopata SAC', 'Carlos Medina', fecha('10-05', '09:42'), 'Revisado', [
        ['ALI-00482', 24, 34.5], ['BAR-00091', 18, 29.8], ['LIM-00137', 12, 46.9]
      ]),
      orden('OC-2026-0181', 'Agroselva EIRL', 'Jorge Salas', fecha('10-03', '08:30'), 'Revisado', [
        ['ALI-00510', 40, 30], ['ALI-00745', 20, 39]
      ]),
      orden('OC-2026-0178', 'Cafetal Madre de Dios', 'María Paredes', fecha('09-29', '09:10'), 'Aprobado', [
        ['ALI-00482', 24, 48], ['BAR-00091', 18, 75.05], ['LIM-00137', 12, 59.4]
      ]),
      orden('OC-2026-0175', 'Granja Los Pinos', 'Carlos Medina', fecha('09-27', '09:00'), 'Rechazado', [
        ['ALI-00623', 20, 37]
      ])
    ],
    notasEntrada: [],
    transferencias: [
      {
        codigo: 'TR-2026-0012', requerimiento: 'REQ-2026-0085', destino: 'Almacén Cocina Central',
        usuario: 'Carlos Medina', fecha: fecha('10-01', '09:00'),
        items: [{ codigo: 'ALI-00510', cantidad: 10 }, { codigo: 'BAR-00134', cantidad: 6 }, { codigo: 'AMN-00052', cantidad: 2 }]
      }
    ],
    // Último número usado de cada documento
    contadores: { requerimiento: 97, orden: 184, nota: 40, transferencia: 12, guia: 20 }
  };
}
