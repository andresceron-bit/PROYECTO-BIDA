const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    // ============================================================
    // MÉTODO GET - MOSTRAR TODOS LOS DETALLES DE TRATAMIENTO
    // GET /servidor/detalle-tratamiento
    // ============================================================

    ruta.get('/detalle-tratamiento', (req, res) => {

        const sql = `
            SELECT
                dt.id_detalle,
                dt.id_tratamiento,
                dt.id_cita,
                dt.costo_aplicado,
                dt.observaciones,

                t.nombre_tratamiento,
                t.descripcion,
                t.costo_base,

                c.fecha,
                c.hora,
                c.estado,

                p.id_paciente,
                p.nombre AS nombre_paciente,
                p.apellido AS apellido_paciente,

                o.id_odontologo,
                o.nombre AS nombre_odontologo,
                o.apellido AS apellido_odontologo

            FROM detalle_tratamiento dt

            LEFT JOIN tratamiento t
                ON dt.id_tratamiento = t.id_tratamiento

            LEFT JOIN cita c
                ON dt.id_cita = c.id_cita

            LEFT JOIN paciente p
                ON c.id_paciente = p.id_paciente

            LEFT JOIN odontologo o
                ON c.id_odontologo = o.id_odontologo
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {

                console.error(
                    'ERROR AL CONSULTAR DETALLES:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al consultar los detalles de tratamiento',
                    errorDetails: error.message
                });
            }

            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje: 'No se encontraron detalles de tratamiento'
                });
            }

            return res.status(200).json({
                mensaje: 'Detalles de tratamiento obtenidos correctamente',
                total: resultados.length,
                detalles: resultados
            });
        });
    });


    // ============================================================
    // MÉTODO GET - OBTENER UN DETALLE POR ID
    // GET /servidor/detalle-tratamiento/:id
    // ============================================================

    ruta.get('/detalle-tratamiento/:id', (req, res) => {

        const idDetalle = req.params.id;

        const sql = `
            SELECT
                dt.id_detalle,
                dt.id_tratamiento,
                dt.id_cita,
                dt.costo_aplicado,
                dt.observaciones,

                t.nombre_tratamiento,
                t.descripcion,
                t.costo_base,

                c.fecha,
                c.hora,
                c.estado,

                p.id_paciente,
                p.documento_identidad,
                p.nombre AS nombre_paciente,
                p.apellido AS apellido_paciente,
                p.telefono,
                p.correo,

                o.id_odontologo,
                o.numero_licencia,
                o.nombre AS nombre_odontologo,
                o.apellido AS apellido_odontologo,
                o.especialidad

            FROM detalle_tratamiento dt

            LEFT JOIN tratamiento t
                ON dt.id_tratamiento = t.id_tratamiento

            LEFT JOIN cita c
                ON dt.id_cita = c.id_cita

            LEFT JOIN paciente p
                ON c.id_paciente = p.id_paciente

            LEFT JOIN odontologo o
                ON c.id_odontologo = o.id_odontologo

            WHERE dt.id_detalle = ?
        `;

        conexion.query(sql, [idDetalle], (error, resultados) => {

            if (error) {

                console.error(
                    'ERROR AL CONSULTAR DETALLE:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al consultar el detalle de tratamiento',
                    errorDetails: error.message
                });
            }

            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje: `No se encontró el detalle de tratamiento con ID ${idDetalle}`
                });
            }

            const detalle = resultados[0];

            return res.status(200).json({
                id_detalle: detalle.id_detalle,

                tratamiento: {
                    id_tratamiento: detalle.id_tratamiento,
                    nombre_tratamiento: detalle.nombre_tratamiento,
                    descripcion: detalle.descripcion,
                    costo_base: detalle.costo_base
                },

                cita: {
                    id_cita: detalle.id_cita,
                    fecha: detalle.fecha,
                    hora: detalle.hora,
                    estado: detalle.estado
                },

                paciente: {
                    id_paciente: detalle.id_paciente,
                    documento_identidad: detalle.documento_identidad,
                    nombre: detalle.nombre_paciente,
                    apellido: detalle.apellido_paciente,
                    telefono: detalle.telefono,
                    correo: detalle.correo
                },

                odontologo: {
                    id_odontologo: detalle.id_odontologo,
                    numero_licencia: detalle.numero_licencia,
                    nombre: detalle.nombre_odontologo,
                    apellido: detalle.apellido_odontologo,
                    especialidad: detalle.especialidad
                },

                costo_aplicado: detalle.costo_aplicado,
                observaciones: detalle.observaciones
            });
        });
    });


    // ============================================================
    // MÉTODO POST - CREAR DETALLE DE TRATAMIENTO
    // POST /servidor/detalle-tratamiento
    // ============================================================

    ruta.post('/detalle-tratamiento', (req, res) => {

        const {
            id_tratamiento,
            id_cita,
            costo_aplicado,
            observaciones
        } = req.body;

        if (
            !id_tratamiento ||
            !id_cita ||
            costo_aplicado === undefined
        ) {

            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios'
            });
        }

        const datos = {
            id_tratamiento,
            id_cita,
            costo_aplicado,
            observaciones: observaciones || null
        };

        const sql = `
            INSERT INTO detalle_tratamiento
            SET ?
        `;

        conexion.query(sql, datos, (error, resultado) => {

            if (error) {

                console.error(
                    'ERROR AL CREAR DETALLE:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al crear el detalle de tratamiento',
                    errorDetails: error.message
                });
            }

            return res.status(201).json({
                mensaje: 'Detalle de tratamiento creado correctamente',
                id_detalle: resultado.insertId,
                detalle: datos
            });
        });
    });


    // ============================================================
    // MÉTODO PUT - ACTUALIZAR DETALLE DE TRATAMIENTO
    // PUT /servidor/detalle-tratamiento/:id
    // ============================================================

    ruta.put('/detalle-tratamiento/:id', (req, res) => {

        const idDetalle = req.params.id;

        const {
            id_tratamiento,
            id_cita,
            costo_aplicado,
            observaciones
        } = req.body;

        const campos = [];
        const valores = [];

        if (id_tratamiento !== undefined) {
            campos.push('id_tratamiento = ?');
            valores.push(id_tratamiento);
        }

        if (id_cita !== undefined) {
            campos.push('id_cita = ?');
            valores.push(id_cita);
        }

        if (costo_aplicado !== undefined) {
            campos.push('costo_aplicado = ?');
            valores.push(costo_aplicado);
        }

        if (observaciones !== undefined) {
            campos.push('observaciones = ?');
            valores.push(observaciones);
        }

        if (campos.length === 0) {

            return res.status(400).json({
                mensaje: 'No hay datos para actualizar'
            });
        }

        valores.push(idDetalle);

        const sql = `
            UPDATE detalle_tratamiento
            SET ${campos.join(', ')}
            WHERE id_detalle = ?
        `;

        conexion.query(sql, valores, (error, resultado) => {

            if (error) {

                console.error(
                    'ERROR AL ACTUALIZAR DETALLE:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al actualizar el detalle de tratamiento',
                    errorDetails: error.message
                });
            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: 'No se encontró el detalle con ID ' + idDetalle
                });
            }

            return res.status(200).json({
                mensaje: 'Detalle de tratamiento ' + idDetalle + ' actualizado correctamente',
                datosActualizados: req.body
            });
        });
    });


    // ============================================================
    // MÉTODO DELETE - ELIMINAR DETALLE DE TRATAMIENTO
    // DELETE /servidor/detalle-tratamiento/:id
    // ============================================================

    ruta.delete('/detalle-tratamiento/:id', (req, res) => {

        const idDetalle = req.params.id;

        const sql = `
            DELETE FROM detalle_tratamiento
            WHERE id_detalle = ?
        `;

        conexion.query(sql, [idDetalle], (error, resultado) => {

            if (error) {

                console.error(
                    'ERROR AL ELIMINAR DETALLE:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al eliminar el detalle de tratamiento',
                    errorDetails: error.message
                });
            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: 'No se encontró el detalle con ID ' + idDetalle
                });
            }

            return res.status(200).json({
                mensaje: 'Detalle de tratamiento ' + idDetalle + ' eliminado correctamente'
            });
        });
    });


    return ruta;
};