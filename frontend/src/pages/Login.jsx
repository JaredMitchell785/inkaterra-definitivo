import { useState } from 'react';
import { useSesion } from '../context/SesionContext.jsx';
import { Alerta } from '../components/ui.jsx';

const DEMOS = [
  ['coordinador', 'Coordinador'],
  ['admin', 'Administradora'],
  ['almacen', 'Almacenero']
];

export default function Login() {
  const { entrar } = useSesion();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!usuario.trim() || !clave) return setError('Escribe tu usuario y contraseña.');
    setError('');
    setEnviando(true);
    try {
      await entrar(usuario.trim(), clave);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <div className="login-marca">
        <div className="marca">
          <span className="marca-logo">I</span>
          INKATERRA
        </div>
        <div>
          <h2>Sistema de Logística</h2>
          <p>Requerimientos, órdenes de compra, notas de entrada y transferencias en un solo lugar.</p>
        </div>
        <p className="version">Reserva Amazónica · Principal</p>
      </div>

      <main className="login-panel">
        <form className="tarjeta" onSubmit={enviar} noValidate>
          <header>
            <h1>Iniciar sesión</h1>
            <p>Ingresa con el usuario de tu rol.</p>
          </header>
          {error && <Alerta>{error}</Alerta>}
          <label className="campo">
            Usuario
            <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" autoFocus />
          </label>
          <label className="campo">
            Contraseña
            <input type="password" value={clave} onChange={(e) => setClave(e.target.value)}
              autoComplete="current-password" />
          </label>
          <button className="boton primario" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>

          <div className="demos">
            <p>Usuarios de prueba (contraseña 1234):</p>
            <div>
              {DEMOS.map(([nombre, texto]) => (
                <button type="button" key={nombre} className="boton secundario chico"
                  onClick={() => { setUsuario(nombre); setClave('1234'); }}>
                  {texto}
                </button>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
