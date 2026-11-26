// L2 · Registrar nota de entrada
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import { fechaNumerica } from '../../formato.js';
import { Alerta, Cargando, DatosEnCajas, Encabezado, Nota, Tabla, Tarjeta, Validacion } from '../../components/ui.jsx';

export default function FormNota() {
  const { codigo } = useParams();
  const { datos, error } = useDatos(`/ordenes/${codigo}`);

  if (!datos) return <Cargando error={error} />;
  return <Formulario key={codigo} orden={datos} />;
}

function Formulario({ orden }) {
  // Se empieza suponiendo que llegó todo; el almacenero corrige lo necesario
  const [recibidos, setRecibidos] = useState(() =>
    Object.fromEntries(orden.items.map((i) => [i.codigo, String(i.cantidad)]))
  );
  const { ocupado, ejecutar, avisar } = useAccion();
  const navegar = useNavigate();

  const esValida = (item) => {
    const texto = recibidos[item.codigo];
    const numero = Number(texto);
    return texto !== '' && Number.isInteger(numero) && numero >= 0 && numero <= item.cantidad;
  };

  const aprobada = orden.estado === 'Aprobado' && !orden.notaEntrada;
  const cantidadesValidas = orden.items.every(esValida) && orden.items.some((i) => Number(recibidos[i.codigo]) > 0);

  function registrar() {
    ejecutar(async () => {
      const nota = await api('/notas-entrada', {
        metodo: 'POST',
        datos: {
          orden: orden.codigo,
          items: orden.items.map((i) => ({ codigo: i.codigo, recibido: Number(recibidos[i.codigo]) }))
        }
      });
      avisar('Nota de entrada registrada', `El stock se actualizó con la nota ${nota.codigo}.`);
      navegar(`/almacen/notas/${nota.codigo}`);
    });
  }

  const columnas = [
    { titulo: 'Código', ancho: 130, valor: (i) => i.codigo },
    { titulo: 'Descripción', valor: (i) => i.descripcion },
    { titulo: 'Ordenada', ancho: 110, valor: (i) => i.cantidad },
    {
      titulo: 'Recibida',
      ancho: 130,
      valor: (i) => (
        <input
          className={`entrada-cantidad ${esValida(i) ? '' : 'invalida'}`}
          type="number" min="0" max={i.cantidad} step="1"
          aria-label={`Cantidad recibida de ${i.descripcion}`}
          value={recibidos[i.codigo]}
          disabled={!aprobada}
          onChange={(e) => setRecibidos({ ...recibidos, [i.codigo]: e.target.value })}
        />
      )
    }
  ];

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-07"
        ruta="Notas de entrada › Nueva"
        titulo="Nueva nota de entrada"
        subtitulo={`Registra los productos recibidos de la orden ${orden.codigo}.`}
      >
        <Link className="boton secundario" to="/almacen/ordenes">Cancelar</Link>
        <button className="boton primario" disabled={ocupado || !aprobada || !cantidadesValidas} onClick={registrar}>
          Registrar nota de entrada
        </button>
      </Encabezado>

      {!aprobada && (
        <Alerta>
          {orden.notaEntrada
            ? `Esta orden ya tiene la nota ${orden.notaEntrada}.`
            : 'Solo las órdenes en estado Aprobado permiten registrar la nota de entrada (RN-02).'}
        </Alerta>
      )}

      <div className="dos-columnas">
        <div>
          <Tarjeta titulo="Orden de compra de origen">
            <DatosEnCajas datos={[
              ['Orden', orden.codigo],
              ['Proveedor', orden.proveedor],
              ['Estado', orden.estado],
              ['Fecha de ingreso', fechaNumerica(new Date().toISOString())]
            ]} />
          </Tarjeta>
          <Tarjeta titulo="Productos recibidos" subtitulo="Ingresa las cantidades realmente recibidas.">
            <Tabla columnas={columnas} filas={orden.items} />
          </Tarjeta>
        </div>
        <aside>
          <Tarjeta titulo="Validaciones">
            <Validacion correcta={aprobada}>
              {aprobada ? 'Orden en estado Aprobado' : 'La orden no se puede recibir'}
            </Validacion>
            <Validacion correcta={cantidadesValidas}>
              {cantidadesValidas ? 'Cantidades recibidas válidas' : 'Revisa las cantidades recibidas'}
            </Validacion>
          </Tarjeta>
          <Nota>Al registrar la nota, el stock de cada producto aumenta automáticamente (RN-03).</Nota>
        </aside>
      </div>
    </>
  );
}
