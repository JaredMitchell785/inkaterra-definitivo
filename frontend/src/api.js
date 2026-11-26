// Todas las peticiones al backend pasan por esta función
export const CLAVE_SESION = 'inkaterra-sesion';

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

export async function api(ruta, { metodo = 'GET', datos } = {}) {
  const cabeceras = { 'Content-Type': 'application/json' };
  const sesion = leerSesion();
  if (sesion) cabeceras.Authorization = `Bearer ${sesion.token}`;

  const respuesta = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: datos ? JSON.stringify(datos) : undefined
  });

  // Si el servidor se reinició, la sesión ya no es válida
  if (respuesta.status === 401 && ruta !== '/login') {
    window.dispatchEvent(new Event('sesion-expirada'));
  }

  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(cuerpo?.mensaje || 'No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  return cuerpo;
}
