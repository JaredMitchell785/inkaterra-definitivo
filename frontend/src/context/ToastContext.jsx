// Aviso flotante en la esquina inferior derecha
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Icono from '../components/Icono.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const avisar = useCallback((titulo, texto, esError = false) => {
    setToast({ titulo, texto, esError });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const reloj = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(reloj);
  }, [toast]);

  return (
    <ToastContext.Provider value={avisar}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <Icono nombre={toast.esError ? 'alert' : 'check-verde'} tamano={20} />
          <div>
            <strong>{toast.titulo}</strong>
            <p>{toast.texto}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
