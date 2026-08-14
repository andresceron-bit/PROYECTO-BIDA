const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    //========================================================
    // MÉTODO PARA MOSTRAR TODOS LOS LOCALES
    // GET /servidor/local
    //========================================================

    ruta.get('/local', (req, res) => {

        const sql = 'SELECT * FROM local';

        conexion.query(sql, (error, locales) => {

            if (error) {
                console.error('Error al obtener locales:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al obtener locales`,
                    error: error.message
                });
            }

            res.status(200).json({
                mensaje: `Locales obtenidos exitosamente`,
                Total: locales.length,
                locales: locales
            });
        });
    });


    //========================================================
    // MÉTODO PARA OBTENER UN LOCAL POR ID
    // GET /servidor/local/:id
    //========================================================

    ruta.get('/local/:id', (req, res) => {

        const localId = req.params.id;

        const sql = `
            SELECT *
            FROM local
            WHERE id_local = ?
        `;

        conexion.query(sql, [localId], (error, resultado) => {

            if (error) {
                console.error('Error al buscar local:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al buscar local`,
                    error: error.message
                });
            }

            if (resultado.length === 0) {

                return res.status(404).json({
                    message: `Local con ID ${localId} no encontrado`
                });

            }

            res.status(200).json({
                mensaje: `Local con ID ${localId} obtenido exitosamente`,
                local: resultado[0]
            });
        });
    });


    //========================================================
    // MÉTODO PARA CREAR UN LOCAL
    // POST /servidor/local
    //========================================================

    ruta.post('/local', (req, res) => {

        const body = req.body || {};

        const {
            calle,
            numero,
            ciudad
        } = body;


        if (!calle || !numero || !ciudad) {

            return res.status(400).json({
                message: `Faltan campos requeridos: calle, numero, ciudad`
            });

        }


        const sql = `
            INSERT INTO local
            (calle, numero, ciudad)
            VALUES (?, ?, ?)
        `;

        const params = [
            calle,
            numero,
            ciudad
        ];


        conexion.query(sql, params, (error, resultado) => {

            if (error) {

                console.error('Error al crear local:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al crear local`,
                    error: error.message
                });

            }


            res.status(201).json({

                mensaje: `Local registrado exitosamente`,

                idLocal: resultado.insertId,

                local: {
                    calle,
                    numero,
                    ciudad
                }

            });

        });

    });


    //========================================================
    // MÉTODO PARA ACTUALIZAR UN LOCAL
    // PUT /servidor/local/:id
    //========================================================

    ruta.put('/local/:id', (req, res) => {

        const localId = req.params.id;

        const body = req.body || {};

        const {
            calle,
            numero,
            ciudad
        } = body;


        const updateCampos = [];
        const params = [];


        if (calle !== undefined) {

            updateCampos.push('calle = ?');
            params.push(calle);

        }


        if (numero !== undefined) {

            updateCampos.push('numero = ?');
            params.push(numero);

        }


        if (ciudad !== undefined) {

            updateCampos.push('ciudad = ?');
            params.push(ciudad);

        }


        if (updateCampos.length === 0) {

            return res.status(400).json({
                message: `No hay campos válidos para actualizar`
            });

        }


        params.push(localId);


        const sql = `
            UPDATE local
            SET ${updateCampos.join(', ')}
            WHERE id_local = ?
        `;


        conexion.query(sql, params, (error, resultado) => {

            if (error) {

                console.error('Error al actualizar local:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al actualizar local`,
                    error: error.message
                });

            }


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    message: `Local con ID ${localId} no encontrado para actualizar`
                });

            }


            res.status(200).json({

                mensaje: `Local con ID ${localId} actualizado exitosamente`,

                datosActualizados: body

            });

        });

    });


    //========================================================
    // MÉTODO PARA ELIMINAR UN LOCAL
    // DELETE /servidor/local/:id
    //========================================================

    ruta.delete('/local/:id', (req, res) => {

        const localId = req.params.id;

        const sql = `
            DELETE FROM local
            WHERE id_local = ?
        `;


        conexion.query(sql, [localId], (error, resultado) => {

            if (error) {

                console.error('Error al eliminar local:', error);

                return res.status(500).json({
                    message: `Error interno del servidor al eliminar local`,
                    error: error.message
                });

            }


            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    message: `Local con ID ${localId} no encontrado para eliminar`
                });

            }


            res.status(200).json({

                mensaje: `Local con ID ${localId} eliminado exitosamente`

            });

        });

    });


    return ruta;
};