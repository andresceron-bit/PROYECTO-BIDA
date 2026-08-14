const express = require('express');
const ruta = express.Router();

const obtenerFechaHoraColombia = (date = new Date()) => {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(date);

    const valores = Object.fromEntries(
        partes.map(({ type, value }) => [type, value])
    );

    return `${valores.year}-${valores.month}-${valores.day} ${valores.hour}:${valores.minute}:${valores.second}`;
};


module.exports = (conexion) => {

    // ============================================================
    // POST - REGISTRAR UNA FACTURA
    // POST /servidor/factura
    // ============================================================

    ruta.post('/factura', (req, res) => {

        const payload = req.body || {};

        const idEmpleado =
            payload.id_Empleado ??
            payload.id_empleado ??
            payload.idEmpleado;

        const idPaciente =
            payload.id_Paciente ??
            payload.id_paciente ??
            payload.idPaciente;

        const metodoPago =
            payload.metodoPago ??
            payload.metodo_pago;

        const idCita =
            payload.id_cita ??
            payload.idCita;

        const tratamientos = payload.tratamiento || [];

        // ------------------------------------------------------------
        // Validar datos principales
        // ------------------------------------------------------------

        if (!idEmpleado || !idPaciente || !metodoPago || !idCita) {
            return res.status(400).send({
                mensaje: 'Faltan datos obligatorios de la factura'
            });
        }

        if (!Array.isArray(tratamientos) || tratamientos.length === 0) {
            return res.status(400).send({
                mensaje: 'Debe existir al menos un tratamiento'
            });
        }

        // ------------------------------------------------------------
        // Calcular total
        // ------------------------------------------------------------

        let totalpagar = 0;

        for (const item of tratamientos) {

            const idTratamiento =
                item.id_Tratamiento ??
                item.id_tratamiento ??
                item.idTratamiento;

            const cantidad =
                item.cantidad ??
                item.cant ??
                item.quantity;

            const precioUnitario =
                item.precioUnitario ??
                item.precio ??
                item.precio_unitario;

            if (
                !idTratamiento ||
                !cantidad ||
                !precioUnitario ||
                Number(cantidad) <= 0 ||
                Number(precioUnitario) < 0
            ) {
                return res.status(400).send({
                    mensaje: 'Datos inválidos en el tratamiento'
                });
            }

            totalpagar += Number(cantidad) * Number(precioUnitario);
        }

        // ------------------------------------------------------------
        // Crear factura
        // ------------------------------------------------------------

        const facturaData = {
            fecha_emision: obtenerFechaHoraColombia(),
            total: totalpagar.toFixed(2),
            metodo_pago: metodoPago,
            id_cita: idCita,
            id_empleado: idEmpleado,
            id_paciente: idPaciente
        };

        const sqlFactura = 'INSERT INTO factura SET ?';

        conexion.query(sqlFactura, facturaData, (error, resultado) => {

            if (error) {

                console.error('Error al registrar factura:', error);

                return res.status(500).send({
                    mensaje: 'Error al registrar la factura',
                    errorDetails: error.message
                });
            }

            const idFactura = resultado.insertId;

            // --------------------------------------------------------
            // Insertar los detalles del tratamiento
            //
            // IMPORTANTE:
            // Tu tabla detalle_tratamiento NO tiene id_factura.
            // Se relaciona mediante id_cita.
            // --------------------------------------------------------

            let detallesProcesados = 0;

            const insertarDetalles = (indice) => {

                if (indice >= tratamientos.length) {

                    return res.status(201).send({
                        mensaje: 'Factura registrada exitosamente',
                        idFactura: idFactura,
                        total: totalpagar.toFixed(2)
                    });
                }

                const item = tratamientos[indice];

                const idTratamiento =
                    item.id_Tratamiento ??
                    item.id_tratamiento ??
                    item.idTratamiento;

                const costoAplicado =
                    item.precioUnitario ??
                    item.precio ??
                    item.precio_unitario;

                const idCitaDetalle =
                    item.id_cita ??
                    item.idCita ??
                    idCita;

                const observaciones =
                    item.observaciones || null;

                const detalleData = {
                    id_tratamiento: idTratamiento,
                    id_cita: idCitaDetalle,
                    costo_aplicado: costoAplicado,
                    observaciones: observaciones
                };

                const sqlDetalle =
                    'INSERT INTO detalle_tratamiento SET ?';

                conexion.query(
                    sqlDetalle,
                    detalleData,
                    (errorDetalle, resultadoDetalle) => {

                        if (errorDetalle) {

                            console.error(
                                'Error al insertar detalle del tratamiento:',
                                errorDetalle
                            );

                            return res.status(500).send({
                                mensaje: 'La factura fue creada, pero ocurrió un error al registrar el detalle del tratamiento',
                                idFactura: idFactura,
                                errorDetails: errorDetalle.message
                            });
                        }

                        detallesProcesados++;

                        insertarDetalles(indice + 1);
                    }
                );
            };

            insertarDetalles(0);
        });
    });

    //===============================================================
// MÉTODO PARA CONSULTAR UNA FACTURA POR ID
// GET /servidor/factura/:id
//===============================================================

ruta.get('/factura/:id', (req, res) => {

    const idFactura = req.params.id;

    const sql = `
        SELECT
            f.id_factura,
            f.fecha_emision,
            f.total,
            f.metodo_pago,
            f.id_cita,
            f.id_empleado,
            f.id_paciente,

            p.documento_identidad,
            p.nombre AS nombre_paciente,
            p.apellido AS apellido_paciente,
            p.telefono,
            p.correo,

            e.nombre AS nombre_empleado,
            e.apellido AS apellido_empleado,
            e.cargo,

            c.fecha AS fecha_cita,
            c.hora AS hora_cita,
            c.estado AS estado_cita,

            o.id_odontologo,
            o.numero_licencia,
            o.nombre AS nombre_odontologo,
            o.apellido AS apellido_odontologo,
            o.especialidad,

            dt.id_detalle,
            dt.id_tratamiento,
            dt.costo_aplicado,
            dt.observaciones,

            t.nombre_tratamiento,
            t.descripcion,
            t.costo_base

        FROM factura f

        LEFT JOIN paciente p
            ON f.id_paciente = p.id_paciente

        LEFT JOIN empleado e
            ON f.id_empleado = e.id_empleado

        LEFT JOIN cita c
            ON f.id_cita = c.id_cita

        LEFT JOIN odontologo o
            ON c.id_odontologo = o.id_odontologo

        LEFT JOIN detalle_tratamiento dt
            ON c.id_cita = dt.id_cita

        LEFT JOIN tratamiento t
            ON dt.id_tratamiento = t.id_tratamiento

        WHERE f.id_factura = ?
    `;

    conexion.query(sql, [idFactura], (error, resultados) => {

        if (error) {
            console.error('ERROR AL CONSULTAR FACTURA:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar la factura',
                errorDetails: error.message
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: `No se encontró la factura con ID ${idFactura}`
            });
        }

        const factura = {
            id_factura: resultados[0].id_factura,
            fecha_emision: resultados[0].fecha_emision,
            total: resultados[0].total,
            metodo_pago: resultados[0].metodo_pago,
            id_cita: resultados[0].id_cita,
            id_empleado: resultados[0].id_empleado,
            id_paciente: resultados[0].id_paciente,

            paciente: {
                documento_identidad: resultados[0].documento_identidad,
                nombre: resultados[0].nombre_paciente,
                apellido: resultados[0].apellido_paciente,
                telefono: resultados[0].telefono,
                correo: resultados[0].correo
            },

            empleado: {
                nombre: resultados[0].nombre_empleado,
                apellido: resultados[0].apellido_empleado,
                cargo: resultados[0].cargo
            },

            cita: {
                fecha: resultados[0].fecha_cita,
                hora: resultados[0].hora_cita,
                estado: resultados[0].estado_cita
            },

            odontologo: {
                id_odontologo: resultados[0].id_odontologo,
                numero_licencia: resultados[0].numero_licencia,
                nombre: resultados[0].nombre_odontologo,
                apellido: resultados[0].apellido_odontologo,
                especialidad: resultados[0].especialidad
            },

            detalles: resultados
                .filter(detalle => detalle.id_detalle !== null)
                .map(detalle => ({
                    id_detalle: detalle.id_detalle,
                    id_tratamiento: detalle.id_tratamiento,
                    nombre_tratamiento: detalle.nombre_tratamiento,
                    descripcion: detalle.descripcion,
                    costo_aplicado: detalle.costo_aplicado,
                    costo_base: detalle.costo_base,
                    observaciones: detalle.observaciones
                }))
        };

        return res.status(200).json(factura);
    });
});

return ruta;
};