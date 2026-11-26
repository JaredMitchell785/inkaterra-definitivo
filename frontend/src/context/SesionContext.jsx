import { createContext, useContext, useEffect, useState } from 'react';
import { api, leerSesion, CLAVE_SESION } from '../api.js';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  function cerrarLocal() {
    localStorage.removeItem(CLAVE_SESION);
    setSesion(null);
  }

  useEffect(() => {
    window.addEventListener('sesion-expirada', cerrarLocal);
    return () => window.removeEventListener('sesion-expirada', cerrarLocal);
  }, []);

  async function entrar(usuario, clave) {
    const nueva = await api('/login', { metodo: 'POST', datos: { usuario, clave } });
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
    setSesion(nueva);
  }

  async function salir() {
    await api('/logout', { metodo: 'POST' }).catch(() => {});
    cerrarLocal();
  }

  return (
    <SesionContext.Provider value={{ usuario: sesion?.usuario ?? null, entrar, salir }}>
      {children}
    </SesionContext.Provider>
  );
}

export const useSesion = () => useContext(SesionContext);
