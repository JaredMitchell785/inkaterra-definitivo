// Flujo obligatorio, igual para requerimientos y órdenes:
// Registrado → Revisado → Aprobado  (o bien Observado / Rechazado)
import { leerDB, guardarDB } from '../db.js';
import { requiereRol } from '../auth.js';
import { ahora, buscarPorCodigo, exigirEstado, registrarEvento, textoObligatorio } from '../utilidades.js';

const PASOS = {
  revisar: { rol: 'coordinador', desde: 'Registrado', hacia: 'Revisado', verbo: 'Revisó' },
  observar: { rol: 'coordinador', desde: 'Registrado', hacia: 'Observado', verbo: 'Observó', conMotivo: true },
  aprobar: { rol: 'administrador', desde: 'Revisado', hacia: 'Aprobado', verbo: 'Aprobó', avisa: true },
  rechazar: { rol: 'administrador', desde: 'Revisado', hacia: 'Rechazado', verbo: 'Rechazó', conMotivo: true, avisa: true }
};

export function agregarRutasDeFlujo(router, { coleccion, nombre, terminacion, presentar }) {
  for (const [accion, paso] of Object.entries(PASOS)) {
    router.post(`/:codigo/${accion}`, requiereRol(paso.rol), (req, res) => {
      const db = leerDB();
      const documento = buscarPorCodigo(db[coleccion], req.params.codigo, nombre);

      exigirEstado(documento, [paso.desde], `Solo se puede ${accion} cuando está en estado ${paso.desde}`);
      if (paso.conMotivo) documento.observacion = textoObligatorio(req.body?.motivo, 'motivo');

      documento.estado = paso.hacia;
      registrarEvento(documento, accion, `${paso.verbo} ${nombre}`, req.usuario);

      // Correo simulado: solo se registra el aviso, no se envía nada
      if (paso.avisa) {
        documento.correo = {
          para: documento.solicitante,
          asunto: `${documento.codigo} ${paso.hacia.toLowerCase().slice(0, -1)}${terminacion}`,
          enviado: ahora()
        };
      }

      guardarDB(db);
      res.json(presentar(db, documento));
    });
  }
}
