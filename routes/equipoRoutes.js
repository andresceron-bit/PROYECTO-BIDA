const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    // ============================================================
    // GET - MOSTRAR TODOS LOS EQUIPOS
    // GET /servidor/equipo
    // ============================================================

    ruta.get('/equipo', (req, res) => {

        const sql = 'SELECT * FROM equipo';

        conexion.query(sql, (error, equipos) => {

            if (error) {

                console.error('Error al obtener equipos:', error);

                return res.status(500).json({
                    mensaje: 'Error interno del servidor al obtener equipos',
                    error: error.message
                });
            }

            if (equipos.length === 0) {

                return res.status(404).json({
                    mensaje: 'No se encontraron equipos'
                });
            }

            return res.status(200).json({
                mensaje: 'Equipos obtenidos exitosamente',
                total: equipos.length,
                equipos: equipos
            });
        });
    });


    // ============================================================
    // GET - OBTENER UN EQUIPO POR ID
    // GET /servidor/equipo/:id
    // ============================================================

    ruta.get('/equipo/:id', (req, res) => {

        const idEquipo = req.params.id;

        const sql = `
            SELECT *
            FROM equipo
            WHERE id_equipo = ?
        `;

        conexion.query(sql, [idEquipo], (error, resultado) => {

            if (error) {

                console.error('Error al buscar equipo:', error);

                return res.status(500).json({
                    mensaje: 'Error interno del servidor al buscar equipo',
                    error: error.message
                });
            }

            if (resultado.length === 0) {

                return res.status(404).json({
                    mensaje: `Equipo con ID ${idEquipo} no encontrado`
                });
            }

            return res.status(200).json({
                mensaje: 'Equipo obtenido exitosamente',
                equipo: resultado[0]
            });
        });
    });


    // ============================================================
    // POST - CREAR UN EQUIPO
    // POST /servidor/equipo
    // ============================================================

    ruta.post('/equipo', (req, res) => {

        const {
            tipo,
            id_numero,
            fecha_mantenimiento,
            id_local,
            id_consultorio
        } = req.body;

        if (
            !tipo ||
            !id_numero ||
            !fecha_mantenimiento ||
            !id_local ||
            !id_consultorio
        ) {

            return res.status(400).json({
                mensaje: 'Faltan campos requeridos: tipo, id_numero, fecha_mantenimiento, id_local, id_consultorio'
            });
        }

        const sql = `
            INSERT INTO equipo
            (tipo, id_numero, fecha_mantenimiento, id_local, id_consultorio)
            VALUES (?, ?, ?, ?, ?)
        `;

        const datos = [
            tipo,
            id_numero,
            fecha_mantenimiento,
            id_local,
            id_consultorio
        ];

        conexion.query(sql, datos, (error, resultado) => {

            if (error) {

                console.error('Error al crear equipo:', error);

                return res.status(500).json({
                    mensaje: 'Error interno del servidor al crear equipo',
                    error: error.message
                });
            }

            return res.status(201).json({
                mensaje: 'Equipo registrado exitosamente',
                idEquipo: resultado.insertId
            });
        });
    });


    // ============================================================
    // PUT - ACTUALIZAR UN EQUIPO
    // PUT /servidor/equipo/:id
    // ============================================================

    ruta.put('/equipo/:id', (req, res) => {

        const idEquipo = req.params.id;

        const {
            tipo,
            id_numero,
            fecha_mantenimiento,
            id_local,
            id_consultorio
        } = req.body;

        const campos = [];
        const datos = [];

        if (tipo !== undefined) {
            campos.push('tipo = ?');
            datos.push(tipo);
        }

        if (id_numero !== undefined) {
            campos.push('id_numero = ?');
            datos.push(id_numero);
        }

        if (fecha_mantenimiento !== undefined) {
            campos.push('fecha_mantenimiento = ?');
            datos.push(fecha_mantenimiento);
        }

        if (id_local !== undefined) {
            campos.push('id_local = ?');
            datos.push(id_local);
        }

        if (id_consultorio !== undefined) {
            campos.push('id_consultorio = ?');
            datos.push(id_consultorio);
        }

        if (campos.length === 0) {

            return res.status(400).json({
                mensaje: 'No se enviaron campos para actualizar'
            });
        }

        datos.push(idEquipo);

        const sql = `
            UPDATE equipo
            SET ${campos.join(', ')}
            WHERE id_equipo = ?
        `;

        conexion.query(sql, datos, (error, resultado) => {

            if (error) {

                console.error('Error al actualizar equipo:', error);

                return res.status(500).json({
                    mensaje: 'Error interno del servidor al actualizar equipo',
                    error: error.message
                });
            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: `Equipo con ID ${idEquipo} no encontrado`
                });
            }

            return res.status(200).json({
                mensaje: `Equipo con ID ${idEquipo} actualizado exitosamente`
            });
        });
    });


    // ============================================================
    // DELETE - ELIMINAR UN EQUIPO
    // DELETE /servidor/equipo/:id
    // ============================================================

    ruta.delete('/equipo/:id', (req, res) => {

        const idEquipo = req.params.id;

        const sql = `
            DELETE FROM equipo
            WHERE id_equipo = ?
        `;

        conexion.query(sql, [idEquipo], (error, resultado) => {

            if (error) {

                console.error('Error al eliminar equipo:', error);

                return res.status(500).json({
                    mensaje: 'Error interno del servidor al eliminar equipo',
                    error: error.message
                });
            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: `Equipo con ID ${idEquipo} no encontrado`
                });
            }

            return res.status(200).json({
                mensaje: `Equipo con ID ${idEquipo} eliminado exitosamente`
            });
        });
    });


    return ruta;
};