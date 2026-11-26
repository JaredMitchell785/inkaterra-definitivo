import { useEffect, useState } from 'react';

function Modal({ titulo, descripcion, onCerrar, children }) {
  // La tecla Escape cierra la ventana
  useEffect(() => {
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  return (
    <div className="velo">
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        {children}
      </div>
    </div>
  );
}

// Pide un motivo obligatorio (observar o rechazar)
export function ModalMotivo({ titulo, descripcion, etiqueta, boton, claseBoton, onConfirmar, onCerrar }) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  function enviar(e) {
    e.preventDefault();
    if (!motivo.trim()) return setError('Escribe el motivo para continuar.');
    onConfirmar(motivo.trim());
  }

  return (
    <Modal titulo={titulo} descripcion={descripcion} onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        <label className="campo">
          {etiqueta} *
          <textarea rows="4" value={motivo} autoFocus
            onChange={(e) => { setMotivo(e.target.value); setError(''); }} />
        </label>
        {error && <p className="error-campo">{error}</p>}
        <div className="modal-acciones">
          <button type="button" className="boton secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className={`boton ${claseBoton}`}>{boton}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ModalConfirmar({ titulo, descripcion, boton, onConfirmar, onCerrar }) {
  return (
    <Modal titulo={titulo} descripcion={descripcion} onCerrar={onCerrar}>
      <div className="modal-acciones">
        <button className="boton secundario" onClick={onCerrar}>Cancelar</button>
        <button className="boton peligro" onClick={onConfirmar}>{boton}</button>
      </div>
    </Modal>
  );
}
