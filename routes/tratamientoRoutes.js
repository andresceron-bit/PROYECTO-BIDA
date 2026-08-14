const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    //========================================================
    // MÉTODO PARA MOSTRAR TODOS LOS TRATAMIENTOS
    // GET /servidor/tratamiento
    //========================================================

    ruta.get('/tratamiento', (req, res) => {

        const sql = 'SELECT * FROM tratamiento';

        conexion.query(sql, (error, tratamientos) => {

            if (error) {
                console.error(`Error al obtener tratamientos:`, error);

                return res.status(500).json({
                    message: `Error interno del servidor al obtener tratamientos`,
                    error: error.message
                });
            }

            res.status(200).json({
                mensaje: `Tratamientos obtenidos exitosamente`,
                Total: tratamientos.length,
                tratamientos: tratamientos
            });
        });
    });


    //========================================================
    // MÉTODO PARA OBTENER UN TRATAMIENTO POR ID
    // GET /servidor/tratamiento/:id
    //========================================================

    ruta.get('/tratamiento/:id', (req, res) => {

        const tratamientoId = req.params.id;

        const sql = `
            SELECT *
            FROM tratamiento
            WHERE id_tratamiento = ?
        `;

        conexion.query(sql, [tratamientoId], (error, resultado) => {

            if (error) {
                console.error('Error al buscar tratamiento:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al buscar tratamiento`,
                    error: error.message
                });
            }

            if (resultado.length === 0) {

                return res.status(404).json({
                    message: `Tratamiento con ID ${tratamientoId} no encontrado`
                });

            }

            res.status(200).json({
                'mensaje': `Tratamiento con ID ${tratamientoId} obtenido exitosamente`,
                tratamiento: resultado[0]
            });
        });
    });


    //========================================================
    // MÉTODO PARA CREAR UN TRATAMIENTO
    // POST /servidor/tratamiento
    //========================================================

    ruta.post('/tratamiento', (req, res) => {

        const body = req.body || {};

        const {
            nombre_tratamiento,
            descripcion,
            costo_base
        } = body;


        if (!nombre_tratamiento || !descripcion || costo_base === undefined) {

            return res.status(400).json({
                message: `Faltan campos requeridos: nombre_tratamiento, descripcion, costo_base`
            });

        }


        const sql = `
            INSERT INTO tratamiento
            (nombre_tratamiento, descripcion, costo_base)
            VALUES (?, ?, ?)
        `;

        const params = [
            nombre_tratamiento,
            descripcion,
            costo_base
        ];


        conexion.query(sql, params, (error, resultado) => {

            if (error) {

                console.error('Error al crear tratamiento:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al crear tratamiento`,
                    error: error.message
                });

            }


            res.status(201).json({

                mensaje: `Tratamiento registrado exitosamente`,

                idTratamiento: resultado.insertId,

                tratamiento: {
                    nombre_tratamiento,
                    descripcion,
                    costo_base
                }

            });

        });

    });


    //========================================================
    // MÉTODO PARA ACTUALIZAR UN TRATAMIENTO
    // PUT /servidor/tratamiento/:id
    //========================================================

    ruta.put('/tratamiento/:id', (req, res) => {

        const tratamientoId = req.params.id;

        const body = req.body || {};

        const {
            nombre_tratamiento,
            descripcion,
            costo_base
        } = body;


        const updateCampos = [];
        const params = [];


        if (nombre_tratamiento !== undefined) {

            updateCampos.push('nombre_tratamiento = ?');
            params.push(nombre_tratamiento);

        }


        if (descripcion !== undefined) {

            updateCampos.push('descripcion = ?');
            params.push(descripcion);

        }


        if (costo_base !== undefined) {

            updateCampos.push('costo_base = ?');
            params.push(costo_base);

        }


        if (updateCampos.length === 0) {

            return res.status(400).json({
                message: `No hay campos válidos para actualizar`
            });

        }


        params.push(tratamientoId);


        const sql = `
            UPDATE tratamiento
            SET ${updateCampos.join(', ')}
            WHERE id_tratamiento = ?
        `;


        conexion.query(sql, params, (error, resultado) => {

            if (error) {

                console.error('Error al actualizar tratamiento:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al actualizar tratamiento`,
                    error: error.message
                });

            }


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    message: `Tratamiento con ID ${tratamientoId} no encontrado para actualizar`
                });

            }


            res.status(200).json({

                mensaje: `Tratamiento con ID ${tratamientoId} actualizado exitosamente`,

                datosActualizados: body

            });

        });

    });


    //========================================================
    // MÉTODO PARA ELIMINAR UN TRATAMIENTO
    // DELETE /servidor/tratamiento/:id
    //========================================================

    ruta.delete('/tratamiento/:id', (req, res) => {

        const tratamientoId = req.params.id;

        const sql = `
            DELETE FROM tratamiento
            WHERE id_tratamiento = ?
        `;


        conexion.query(sql, [tratamientoId], (error, resultado) => {

            if (error) {

                console.error('Error al eliminar tratamiento:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al eliminar tratamiento`,
                    error: error.message
                });

            }


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    message: `Tratamiento con ID ${tratamientoId} no encontrado para eliminar`
                });

            }


            res.status(200).json({

                mensaje: `Tratamiento con ID ${tratamientoId} eliminado exitosamente`

            });

        });

    });


    return ruta;
};