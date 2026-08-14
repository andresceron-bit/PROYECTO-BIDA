const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

//===========================================
//metodo para mostrar todos los odontologos
//========================================

    ruta.get('/odontologo', (req, res) => {
        const sql = 'SELECT * FROM odontologo';

        conexion.query(sql, (error, odontologos) => {

            if (error) {
                console.error('Error al obtener odontólogos:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor',
                });
            }

            res.status(200).json({
                message: 'Odontólogos obtenidos exitosamente',
                Total: odontologos.length,
                odontologos: odontologos
            })
        });

    })

//================================================================
//Metodo para obtener un odontologo (GET /servidor/odontologo/:id)
//=================================================================

ruta.get('/odontologo/:id', (req, res) => {
    const odontologoId = req.params.id;

    const sql = 'SELECT * FROM odontologo WHERE id_odontologo = ?';

    conexion.query(sql, [odontologoId], (error, resultado) => {
        if (error) {
            console.error('Error al buscar odontólogo:', error);
            return res.status(500).json({
                message: 'Error interno del servidor al buscar odontólogo',
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                message: `Odontólogo con ID ${odontologoId} no encontrado`
            });
        }

        res.status(200).json({
            message: `Detalles del Odontólogo ${odontologoId} obtenido exitosamente`,
            odontologo: resultado[0]
        });
    });
});

//================================================================
//METODO PARA CREAR UN ODONTOLOGO (POST /servidor/odontologo)
//=================================================================

    ruta.post('/odontologo', (req, res) => {

        //Obtenemos los datos del cuerpo de la peticion
        const { numero_licencia, nombre, apellido, especialidad, correo, telefono } = req.body;

        //Validamos que se hayan proporcionado todos los campos necesarios
        if (!numero_licencia || !nombre || !apellido || !especialidad || !correo || !telefono) {
            return res.status(400).json({
                message: 'Faltan campos requeridos: numero_licencia, nombre, apellido, especialidad, correo, telefono'
            });
        }

        const sql = 'INSERT INTO odontologo (numero_licencia, nombre, apellido, especialidad, correo, telefono) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [numero_licencia, nombre, apellido, especialidad, correo, telefono];

        conexion.query(sql, params, (error, resultado) => {
            //Manejamos los errores de la consulta
            if (error) {
                console.error('Error al crear odontólogo:', error);
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        mensaje: 'El usuario ya existe'
                    });

                }
                return res.status(500).json({
                    mensaje: 'Error interno del servidor al crear odontólogo',
                    error: error.message
                })
            }
            //Respuesta exitosa
            res.status(201).json({
                mensaje: 'Odontólogo registrado exitosamente',
                idOdontologo: resultado.insertId,
                odontologo: {numero_licencia, nombre, apellido, especialidad, correo, telefono}
            });

        });

    });

    //================================================================
    //METODO PARA ACTUALIZAR UN ODONTOLOGO (PUT /servidor/odontologo/:id)
    //=================================================================

    ruta.put('/odontologo/:id', (req, res) => {
        const odontologoId = req.params.id;
        const { numero_licencia, nombre, apellido, especialidad, correo, telefono } = req.body;
        const updateCampos = [];
        const params = [];

        if (numero_licencia !== undefined) { updateCampos.push('numero_licencia = ?'); params.push(numero_licencia); }
        if (nombre !== undefined) { updateCampos.push('nombre = ?'); params.push(nombre); }
        if (apellido !== undefined) { updateCampos.push('apellido = ?'); params.push(apellido); }
        if (especialidad !== undefined) { updateCampos.push('especialidad = ?'); params.push(especialidad); }
        if (correo !== undefined) { updateCampos.push('correo = ?'); params.push(correo); }
        if (telefono !== undefined) { updateCampos.push('telefono = ?'); params.push(telefono); }

        if (updateCampos.length === 0) {
            return res.status(400).json({ message: 'No hay campos válidos para actualizar' });
        }

        params.push(odontologoId);
        const sql = `UPDATE odontologo SET ${updateCampos.join(', ')} WHERE id_odontologo = ?`;

        conexion.query(sql, params, (error, resultado) => {
            if (error) {
                console.error('Error al actualizar odontólogo:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor al actualizar odontólogo',
                    error: error.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    message: `Odontólogo con ID ${odontologoId} no encontrado para actualizar`
                });
            }

            res.status(200).json({
                message: `Odontólogo con ID ${odontologoId} actualizado exitosamente`,
                datosActualizados: req.body
            });
        });
    });
    
//================================================================
//METODO PARA ELIMINAR UN ODONTOLOGO (DELETE /servidor/odontologo/:id)
//=================================================================
    ruta.delete('/odontologo/:id', (req, res) => {
        const odontologoId = req.params.id;
        const sql = 'DELETE FROM odontologo WHERE id_odontologo = ?';

        conexion.query(sql, [odontologoId], (error, result) => {
            if (error) {
                console.error('Error al eliminar odontólogo:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor al eliminar odontólogo',
                    error: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: `Odontólogo con ID ${odontologoId} no encontrado para eliminar`
                });
            }

            res.status(200).json({
                message: `Odontólogo con ID ${odontologoId} eliminado exitosamente`
            });
        });
    });






 return ruta;
};

