const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    // ============================================================
    // MÉTODO GET - MOSTRAR TODAS LAS CITAS
    // GET /servidor/cita
    // ============================================================

    ruta.get('/cita', (req, res) => {

        const sql = `
            SELECT
                c.id_cita,
                c.fecha,
                c.hora,
                c.estado,
                c.id_paciente,
                c.id_odontologo,

                p.documento_identidad,
                p.nombre AS nombre_paciente,
                p.apellido AS apellido_paciente,
                p.telefono AS telefono_paciente,
                p.correo AS correo_paciente,

                o.numero_licencia,
                o.nombre AS nombre_odontologo,
                o.apellido AS apellido_odontologo,
                o.especialidad,
                o.telefono AS telefono_odontologo

            FROM cita c

            LEFT JOIN paciente p
                ON c.id_paciente = p.id_paciente

            LEFT JOIN odontologo o
                ON c.id_odontologo = o.id_odontologo

            ORDER BY c.fecha, c.hora
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {

                console.error(
                    'ERROR AL CONSULTAR CITAS:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al consultar las citas',
                    errorDetails: error.message
                });
            }

            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje: 'No se encontraron citas'
                });
            }

            return res.status(200).json({
                mensaje: 'Citas obtenidas correctamente',
                total: resultados.length,
                citas: resultados
            });
        });
    });


    // ============================================================
    // MÉTODO GET - OBTENER UNA CITA POR ID
    // GET /servidor/cita/:id
    // ============================================================

    ruta.get('/cita/:id', (req, res) => {

        const idCita = req.params.id;

        const sql = `
            SELECT
                c.id_cita,
                c.fecha,
                c.hora,
                c.estado,
                c.id_paciente,
                c.id_odontologo,

                p.documento_identidad,
                p.nombre AS nombre_paciente,
                p.apellido AS apellido_paciente,
                p.fecha_nacimiento,
                p.genero,
                p.direccion,
                p.telefono AS telefono_paciente,
                p.correo AS correo_paciente,

                o.numero_licencia,
                o.nombre AS nombre_odontologo,
                o.apellido AS apellido_odontologo,
                o.especialidad,
                o.correo AS correo_odontologo,
                o.telefono AS telefono_odontologo

            FROM cita c

            LEFT JOIN paciente p
                ON c.id_paciente = p.id_paciente

            LEFT JOIN odontologo o
                ON c.id_odontologo = o.id_odontologo

            WHERE c.id_cita = ?
        `;

        conexion.query(
            sql,
            [idCita],
            (error, resultados) => {

                if (error) {

                    console.error(
                        'ERROR AL CONSULTAR CITA:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al consultar la cita',
                        errorDetails: error.message
                    });
                }

                if (resultados.length === 0) {

                    return res.status(404).json({
                        mensaje: `No se encontró la cita con ID ${idCita}`
                    });
                }

                const cita = resultados[0];

                return res.status(200).json({

                    id_cita: cita.id_cita,
                    fecha: cita.fecha,
                    hora: cita.hora,
                    estado: cita.estado,

                    paciente: {
                        id_paciente: cita.id_paciente,
                        documento_identidad: cita.documento_identidad,
                        nombre: cita.nombre_paciente,
                        apellido: cita.apellido_paciente,
                        fecha_nacimiento: cita.fecha_nacimiento,
                        genero: cita.genero,
                        direccion: cita.direccion,
                        telefono: cita.telefono_paciente,
                        correo: cita.correo_paciente
                    },

                    odontologo: {
                        id_odontologo: cita.id_odontologo,
                        numero_licencia: cita.numero_licencia,
                        nombre: cita.nombre_odontologo,
                        apellido: cita.apellido_odontologo,
                        especialidad: cita.especialidad,
                        correo: cita.correo_odontologo,
                        telefono: cita.telefono_odontologo
                    }
                });
            }
        );
    });


    // ============================================================
    // MÉTODO POST - CREAR UNA CITA
    // POST /servidor/cita
    // ============================================================

    ruta.post('/cita', (req, res) => {

        const {
            fecha,
            hora,
            estado,
            id_paciente,
            id_odontologo
        } = req.body;

        // ------------------------------------------------------------
        // Validar datos obligatorios
        // ------------------------------------------------------------

        if (
            !fecha ||
            !hora ||
            !estado ||
            !id_paciente ||
            !id_odontologo
        ) {

            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios: fecha, hora, estado, id_paciente, id_odontologo'
            });
        }

        // ------------------------------------------------------------
        // Datos para insertar
        // ------------------------------------------------------------

        const datos = {
            fecha,
            hora,
            estado,
            id_paciente,
            id_odontologo
        };

        const sql = `
            INSERT INTO cita
            SET ?
        `;

        conexion.query(
            sql,
            datos,
            (error, resultado) => {

                if (error) {

                    console.error(
                        'ERROR AL CREAR CITA:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al crear la cita',
                        errorDetails: error.message
                    });
                }

                return res.status(201).json({
                    mensaje: 'Cita creada correctamente',
                    id_cita: resultado.insertId,
                    cita: datos
                });
            }
        );
    });


    // ============================================================
    // MÉTODO PUT - ACTUALIZAR UNA CITA
    // PUT /servidor/cita/:id
    // ============================================================

    ruta.put('/cita/:id', (req, res) => {

        const idCita = req.params.id;

        const {
            fecha,
            hora,
            estado,
            id_paciente,
            id_odontologo
        } = req.body;

        const campos = [];
        const valores = [];

        if (fecha !== undefined) {
            campos.push('fecha = ?');
            valores.push(fecha);
        }

        if (hora !== undefined) {
            campos.push('hora = ?');
            valores.push(hora);
        }

        if (estado !== undefined) {
            campos.push('estado = ?');
            valores.push(estado);
        }

        if (id_paciente !== undefined) {
            campos.push('id_paciente = ?');
            valores.push(id_paciente);
        }

        if (id_odontologo !== undefined) {
            campos.push('id_odontologo = ?');
            valores.push(id_odontologo);
        }

        if (campos.length === 0) {

            return res.status(400).json({
                mensaje: 'No hay datos para actualizar'
            });
        }

        valores.push(idCita);

        const sql = `
            UPDATE cita
            SET ${campos.join(', ')}
            WHERE id_cita = ?
        `;

        conexion.query(
            sql,
            valores,
            (error, resultado) => {

                if (error) {

                    console.error(
                        'ERROR AL ACTUALIZAR CITA:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al actualizar la cita',
                        errorDetails: error.message
                    });
                }

                if (resultado.affectedRows === 0) {

                    return res.status(404).json({
                        mensaje: 'No se encontró la cita con ID ${idCita}'
                    });
                }

                return res.status(200).json({
                    mensaje: 'Cita ${idCita} actualizada correctamente',
                    datosActualizados: req.body
                });
            }
        );
    });


    // ============================================================
    // MÉTODO DELETE - ELIMINAR UNA CITA
    // DELETE /servidor/cita/:id
    // ============================================================

    ruta.delete('/cita/:id', (req, res) => {

        const idCita = req.params.id;

        const sql = `
            DELETE FROM cita
            WHERE id_cita = ?
        `;

        conexion.query(
            sql,
            [idCita],
            (error, resultado) => {

                if (error) {

                    console.error(
                        'ERROR AL ELIMINAR CITA:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al eliminar la cita',
                        errorDetails: error.message
                    });
                }

                if (resultado.affectedRows === 0) {

                    return res.status(404).json({
                        mensaje: `No se encontró la cita con ID ${idCita}`
                    });
                }

                return res.status(200).json({
                    mensaje: `Cita ${idCita} eliminada correctamente`
                });
            }
        );
    });


    return ruta;
};