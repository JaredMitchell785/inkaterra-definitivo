import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

// Ejecuta una acción contra la API y muestra el error si falla.
// "ocupado" sirve para evitar dobles clics.
export function useAccion() {
  const avisar = useToast();
  const [ocupado, setOcupado] = useState(false);

  async function ejecutar(accion) {
    setOcupado(true);
    try {
      await accion();
    } catch (error) {
      avisar('No se pudo completar', error.message, true);
    } finally {
      setOcupado(false);
    }
  }

  return { ocupado, ejecutar, avisar };
}
