import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// Pide datos a la API cuando la página se muestra
export function useDatos(ruta) {
  const [estado, setEstado] = useState({ ruta: null, datos: null, error: '' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    api(ruta)
      .then((datos) => activo && setEstado({ ruta, datos, error: '' }))
      .catch((e) => activo && setEstado({ ruta, datos: null, error: e.message }));
    return () => {
      activo = false;
    };
  }, [ruta, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const setDatos = useCallback((datos) => setEstado({ ruta, datos, error: '' }), [ruta]);
  const vigente = estado.ruta === ruta;

  return {
    datos: vigente ? estado.datos : null,
    error: vigente ? estado.error : '',
    recargar,
    setDatos
  };
}
