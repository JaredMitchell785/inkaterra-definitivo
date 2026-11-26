// Barra de estado: Registrado → Revisado → Aprobado
export function pasosDeAprobacion(estado) {
  const paso = (texto, tono) => ({ texto, tono });
  const registrado = paso('Registrado', 'verde');

  switch (estado) {
    case 'Registrado':
      return [registrado, paso('Revisado', 'ambar'), paso('Aprobado', 'gris')];
    case 'Observado':
      return [registrado, paso('Observado', 'ambar'), paso('Aprobado', 'gris')];
    case 'Revisado':
      return [registrado, paso('Revisado', 'verde'), paso('Aprobado', 'ambar')];
    case 'Rechazado':
      return [registrado, paso('Revisado', 'verde'), paso('Rechazado', 'rojo')];
    default:
      return [registrado, paso('Revisado', 'verde'), paso('Aprobado', 'verde')];
  }
}
