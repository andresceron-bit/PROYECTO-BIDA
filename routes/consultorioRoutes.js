const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    // ============================================================
    // MÉTODO GET - MOSTRAR TODOS LOS CONSULTORIOS
    // GET /servidor/consultorio
    // ============================================================

    ruta.get('/consultorio', (req, res) => {

        const sql = `
            SELECT
                c.id_consultorio,
                c.id_numero,
                c.id_local,
                c.id_odontologo,

                l.calle,
                l.numero AS numero_local,
                l.ciudad,

                o.numero_licencia,
                o.nombre AS nombre_odontologo,
                o.apellido AS apellido_odontologo,
                o.especialidad

            FROM consultorio c

            LEFT JOIN local l
                ON c.id_local = l.id_local

            LEFT JOIN odontologo o
                ON c.id_odontologo = o.id_odontologo
        `;

        conexion.query(sql, (error, resultados) => {

            if (error) {

                console.error(
                    'ERROR AL CONSULTAR CONSULTORIOS:',
                    error
                );

                return res.status(500).json({
                    mensaje: 'Error al consultar los consultorios',
                    errorDetails: error.message
                });
            }

            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje: 'No se encontraron consultorios'
                });
            }

            return res.status(200).json({
                mensaje: 'Consultorios obtenidos correctamente',
                total: resultados.length,
                consultorios: resultados
            });
        });
    });


    // ============================================================
    // MÉTODO GET - OBTENER UN CONSULTORIO POR ID
    // GET /servidor/consultorio/:id
    // ============================================================

    ruta.get('/consultorio/:id', (req, res) => {

        const idConsultorio = req.params.id;

        const sql = `
            SELECT
                c.id_consultorio,
                c.id_numero,
                c.id_local,
                c.id_odontologo,

                l.calle,
                l.numero AS numero_local,
                l.ciudad,

                o.numero_licencia,
                o.nombre AS nombre_odontologo,
                o.apellido AS apellido_odontologo,
                o.especialidad,
                o.correo,
                o.telefono

            FROM consultorio c

            LEFT JOIN local l
                ON c.id_local = l.id_local

            LEFT JOIN odontologo o
                ON c.id_odontologo = o.id_odontologo

            WHERE c.id_consultorio = ?
        `;

        conexion.query(
            sql,
            [idConsultorio],
            (error, resultados) => {

                if (error) {

                    console.error(
                        'ERROR AL CONSULTAR CONSULTORIO:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al consultar el consultorio',
                        errorDetails: error.message
                    });
                }

                if (resultados.length === 0) {

                    return res.status(404).json({
                        mensaje: `No se encontró el consultorio con ID ${idConsultorio}`
                    });
                }

                const consultorio = resultados[0];

                return res.status(200).json({
                    id_consultorio: consultorio.id_consultorio,
                    id_numero: consultorio.id_numero,

                    local: {
                        id_local: consultorio.id_local,
                        calle: consultorio.calle,
                        numero: consultorio.numero_local,
                        ciudad: consultorio.ciudad
                    },

                    odontologo: {
                        id_odontologo: consultorio.id_odontologo,
                        numero_licencia: consultorio.numero_licencia,
                        nombre: consultorio.nombre_odontologo,
                        apellido: consultorio.apellido_odontologo,
                        especialidad: consultorio.especialidad,
                        correo: consultorio.correo,
                        telefono: consultorio.telefono
                    }
                });
            }
        );
    });


    // ============================================================
    // MÉTODO POST - CREAR CONSULTORIO
    // POST /servidor/consultorio
    // ============================================================

    ruta.post('/consultorio', (req, res) => {

        const {
            id_numero,
            id_local,
            id_odontologo
        } = req.body;

        // ------------------------------------------------------------
        // Validación
        // ------------------------------------------------------------

        if (
            id_numero === undefined ||
            id_numero === null ||
            !id_local ||
            !id_odontologo
        ) {

            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios: id_numero, id_local, id_odontologo'
            });
        }

        const datos = {
            id_numero,
            id_local,
            id_odontologo
        };

        const sql = `
            INSERT INTO consultorio
            SET ?
        `;

        conexion.query(
            sql,
            datos,
            (error, resultado) => {

                if (error) {

                    console.error(
                        'ERROR AL CREAR CONSULTORIO:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al crear el consultorio',
                        errorDetails: error.message
                    });
                }

                return res.status(201).json({
                    mensaje: 'Consultorio creado correctamente',
                    id_consultorio: resultado.insertId,
                    consultorio: datos
                });
            }
        );
    });


    // ============================================================
    // MÉTODO PUT - ACTUALIZAR CONSULTORIO
    // PUT /servidor/consultorio/:id
    // ============================================================

    ruta.put('/consultorio/:id', (req, res) => {

        const idConsultorio = req.params.id;

        const {
            id_numero,
            id_local,
            id_odontologo
        } = req.body;

        const campos = [];
        const valores = [];

        if (id_numero !== undefined) {
            campos.push('id_numero = ?');
            valores.push(id_numero);
        }

        if (id_local !== undefined) {
            campos.push('id_local = ?');
            valores.push(id_local);
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

        valores.push(idConsultorio);

        const sql = `
            UPDATE consultorio
            SET ${campos.join(', ')}
            WHERE id_consultorio = ?
        `;

        conexion.query(
            sql,
            valores,
            (error, resultado) => {

                if (error) {

                    console.error(
                        'ERROR AL ACTUALIZAR CONSULTORIO:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al actualizar el consultorio',
                        errorDetails: error.message
                    });
                }

                if (resultado.affectedRows === 0) {

                    return res.status(404).json({
                        mensaje: `No se encontró el consultorio con ID ${idConsultorio}`
                    });
                }

                return res.status(200).json({
                    mensaje: `Consultorio ${idConsultorio} actualizado correctamente`,
                    datosActualizados: req.body
                });
            }
        );
    });


    // ============================================================
    // MÉTODO DELETE - ELIMINAR CONSULTORIO
    // DELETE /servidor/consultorio/:id
    // ============================================================

    ruta.delete('/consultorio/:id', (req, res) => {

        const idConsultorio = req.params.id;

        const sql = `
            DELETE FROM consultorio
            WHERE id_consultorio = ?
        `;

        conexion.query(
            sql,
            [idConsultorio],
            (error, resultado) => {

                if (error) {

                    console.error(
                        'ERROR AL ELIMINAR CONSULTORIO:',
                        error
                    );

                    return res.status(500).json({
                        mensaje: 'Error al eliminar el consultorio',
                        errorDetails: error.message
                    });
                }

                if (resultado.affectedRows === 0) {

                    return res.status(404).json({
                        mensaje: `No se encontró el consultorio con ID ${idConsultorio}`
                    });
                }

                return res.status(200).json({
                    mensaje: `Consultorio ${idConsultorio} eliminado correctamente`
                });
            }
        );
    });


    return ruta;
};