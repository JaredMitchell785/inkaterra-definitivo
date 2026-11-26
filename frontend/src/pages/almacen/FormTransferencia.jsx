// L6 · Registrar transferencia
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useAccion } from '../../hooks/useAccion.js';
import { useDatos } from '../../hooks/useDatos.js';
import { plural } from '../../formato.js';
import {
  Alerta, Cargando, DatosEnFilas, Encabezado, Estado, Nota, Tabla, Tarjeta, Validacion
} from '../../components/ui.jsx';

export default function FormTransferencia() {
  const { codigo } = useParams();
  const { datos, error } = useDatos(`/requerimientos/${codigo}`);

  if (!datos) return <Cargando error={error} />;
  return <Formulario key={codigo} requerimiento={datos} />;
}

// RN-07: valida la cantidad escrita para un producto
function validar(item, texto) {
  const cantidad = Number(texto);
  if (texto === '' || !Number.isInteger(cantidad) || cantidad < 0) return 'Cantidad no válida';
  if (cantidad > item.stock) return 'Supera el stock';
  if (cantidad > item.pendiente) return 'Supera lo pendiente';
  return cantidad === 0 ? 'No se envía' : 'Stock suficiente';
}

const esError = (resultado) => !['Stock suficiente', 'No se envía'].includes(resultado);

function Formulario({ requerimiento }) {
  const items = requerimiento.items.filter((i) => i.pendiente > 0);
  const [cantidades, setCantidades] = useState(() =>
    Object.fromEntries(items.map((i) => [i.codigo, String(i.pendiente)]))
  );
  const { ocupado, ejecutar, avisar } = useAccion();
  const navegar = useNavigate();
  const volver = `/almacen/requerimientos/${requerimiento.codigo}`;

  const atendible = ['Aprobado', 'Atendido parcial'].includes(requerimiento.estado);
  const resultado = (item) => validar(item, cantidades[item.codigo]);
  const errores = items.filter((i) => esError(resultado(i))).length;
  const hayEnvio = items.some((i) => Number(cantidades[i.codigo]) > 0);

  function confirmar() {
    ejecutar(async () => {
      const transferencia = await api('/transferencias', {
        metodo: 'POST',
        datos: {
          requerimiento: requerimiento.codigo,
          items: items.map((i) => ({ codigo: i.codigo, cantidad: Number(cantidades[i.codigo]) }))
        }
      });
      avisar('Transferencia registrada', `${transferencia.codigo}: el stock fue descontado.`);
      navegar(volver);
    });
  }

  const columnas = [
    { titulo: 'Código', ancho: 115, valor: (i) => i.codigo },
    { titulo: 'Descripción', valor: (i) => i.descripcion },
    { titulo: 'Pendiente', ancho: 95, valor: (i) => i.pendiente },
    { titulo: 'Stock disp.', ancho: 95, valor: (i) => i.stock },
    {
      titulo: 'A transferir',
      ancho: 110,
      valor: (i) => (
        <input
          className={`entrada-cantidad ${esError(resultado(i)) ? 'invalida' : ''}`}
          type="number" min="0" step="1"
          aria-label={`Cantidad a transferir de ${i.descripcion}`}
          value={cantidades[i.codigo]}
          disabled={!atendible}
          onChange={(e) => setCantidades({ ...cantidades, [i.codigo]: e.target.value })}
        />
      )
    },
    { titulo: 'Validación', ancho: 160, valor: (i) => <Estado valor={resultado(i)} /> }
  ];

  return (
    <>
      <Encabezado
        etiqueta="ALMACENERO · CU-14 + CU-16 + CU-17"
        ruta="Transferencias › Nueva"
        titulo="Nueva transferencia"
        subtitulo={`${requerimiento.codigo} · Reserva Amazónica → ${requerimiento.almacen}.`}
      >
        <Link className="boton secundario" to={volver}>Cancelar</Link>
        <button className="boton primario" disabled={ocupado || !atendible || errores > 0 || !hayEnvio} onClick={confirmar}>
          Confirmar transferencia
        </button>
      </Encabezado>

      {!atendible && <Alerta>Este requerimiento no está disponible para transferir (estado {requerimiento.estado}).</Alerta>}

      <div className="dos-columnas">
        <div>
          {atendible && errores > 0 && (
            <Alerta>
              {items.some((i) => resultado(i) === 'Supera el stock') ? 'Stock insuficiente' : 'Cantidad incorrecta'}: revisa {plural(errores, 'producto')} antes de continuar.
            </Alerta>
          )}
          <Tarjeta titulo="Productos a transferir" subtitulo="La cantidad no puede superar el stock disponible (RN-07)">
            <Tabla columnas={columnas} filas={items} vacio="No quedan productos pendientes." />
          </Tarjeta>
        </div>
        <aside>
          <Tarjeta titulo="Origen y destino">
            <DatosEnFilas datos={[
              ['Origen', 'Reserva Principal'],
              ['Destino', requerimiento.almacen.replace('Almacén ', '')],
              ['Requerimiento', requerimiento.codigo]
            ]} />
          </Tarjeta>
          <Tarjeta titulo="Validación de stock">
            {items.map((i) => (
              <Validacion key={i.codigo} correcta={!esError(resultado(i))}>
                {i.codigo} · {resultado(i).toLowerCase()}
                {resultado(i) === 'Supera el stock' ? ` (${i.stock})` : ''}
              </Validacion>
            ))}
          </Tarjeta>
          <Nota>El stock disminuye únicamente al confirmar la transferencia, una vez validado.</Nota>
        </aside>
      </div>
    </>
  );
}
