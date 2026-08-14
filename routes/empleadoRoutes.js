const express = require('express');
const ruta = express.Router();

module.exports = (conexion) => {

    //===========================================
    // Método para mostrar todos los empleados
    //===========================================

    ruta.get('/empleado', (req, res) => {
        const sql = 'SELECT * FROM empleado';

        conexion.query(sql, (error, empleados) => {
            if (error) {
                console.error('Error al obtener empleados:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor'
                });
            }

            res.status(200).json({
                mensaje: 'Empleados obtenidos exitosamente',
                Total: empleados.length,
                empleados: empleados
            });
        });
    });

    //===============================================================
    // Método para obtener un empleado por ID
    //===============================================================

    ruta.get('/empleado/:id', (req, res) => {
        const empleadoId = req.params.id;
        const sql = 'SELECT * FROM empleado WHERE id_empleado = ?';

        conexion.query(sql, [empleadoId], (error, resultado) => {
            if (error) {
                console.error('Error al buscar empleado:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor al buscar empleado'
                });
            }

            if (resultado.length === 0) {
                return res.status(404).json({
                    message: `Empleado con ID ${empleadoId} no encontrado`
                });
            }

            res.status(200).json({
                mensaje: `Detalles del empleado ${empleadoId} obtenidos exitosamente`,
                empleado: resultado[0]
            });
        });
    });

    //===============================================================
// MÉTODO PARA OBTENER UN EMPLEADO POR DOCUMENTO
// GET /servidor/empleado/documento/:documento
//===============================================================

ruta.get('/empleado/documento/:documento', (req, res) => {

    const documento = req.params.documento;

    const sql = `
        SELECT *
        FROM empleado
        WHERE documento_identidad = ?
    `;

    conexion.query(sql, [documento], (error, resultado) => {

        if (error) {

            console.error(
                'Error al buscar empleado por documento:',
                error
            );

            return res.status(500).json({
                message: 'Error interno del servidor al buscar empleado'
            });
        }


        if (resultado.length === 0) {

            return res.status(404).json({
                message: `Empleado con documento ${documento} no encontrado`
            });
        }


        res.status(200).json({

            mensaje:
                `Empleado con documento ${documento} obtenido exitosamente`,

            empleado: resultado[0]

        });

    });

});

    //==============================================================
    // MÉTODO PARA CREAR UN EMPLEADO (POST /servidor/empleado)
    //==============================================================

    ruta.post('/empleado', (req, res) => {
        const body = req.body || {};
        const { nombre, apellido, cargo, correo, telefono } = body;

        if (!nombre || !apellido || !cargo || !correo || !telefono) {
            return res.status(400).json({
                message: 'Faltan campos requeridos: nombre, apellido, cargo, correo, telefono'
            });
        }

        const sql = 'INSERT INTO empleado (nombre, apellido, cargo, correo, telefono) VALUES (?, ?, ?, ?, ?)';
        const params = [nombre, apellido, cargo, correo, telefono];

        conexion.query(sql, params, (error, resultado) => {
            if (error) {
                console.error('Error al crear empleado:', error);
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        mensaje: 'El empleado ya existe'
                    });
                }
                return res.status(500).json({
                    mensaje: 'Error interno del servidor al crear empleado',
                    error: error.message
                });
            }

            res.status(201).json({
                mensaje: 'Empleado registrado exitosamente',
                idEmpleado: resultado.insertId,
                empleado: { nombre, apellido, cargo, correo, telefono }
            });
        });
    });

    //===============================================================
    // MÉTODO PARA ACTUALIZAR UN EMPLEADO (PUT /servidor/empleado/:id)
    //===============================================================

    ruta.put('/empleado/:id', (req, res) => {
        const empleadoId = req.params.id;
        const body = req.body || {};
        const { nombre, apellido, cargo, correo, telefono } = body;
        const updateCampos = [];
        const params = [];

        if (nombre !== undefined) { updateCampos.push('nombre = ?'); params.push(nombre); }
        if (apellido !== undefined) { updateCampos.push('apellido = ?'); params.push(apellido); }
        if (cargo !== undefined) { updateCampos.push('cargo = ?'); params.push(cargo); }
        if (correo !== undefined) { updateCampos.push('correo = ?'); params.push(correo); }
        if (telefono !== undefined) { updateCampos.push('telefono = ?'); params.push(telefono); }

        if (updateCampos.length === 0) {
            return res.status(400).json({ message: 'No hay campos válidos para actualizar' });
        }

        params.push(empleadoId);
        const sql = `UPDATE empleado SET ${updateCampos.join(', ')} WHERE id_empleado = ?`;

        conexion.query(sql, params, (error, resultado) => {
            if (error) {
                console.error('Error al actualizar empleado:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor al actualizar empleado',
                    error: error.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    message: `Empleado con ID ${empleadoId} no encontrado para actualizar`
                });
            }

            res.status(200).json({
                mensaje: `Empleado con ID ${empleadoId} actualizado exitosamente`,
                datosActualizados: body
            });
        });
    });

    //===============================================================
    // MÉTODO PARA ELIMINAR UN EMPLEADO (DELETE /servidor/empleado/:id)
    //===============================================================

    ruta.delete('/empleado/:id', (req, res) => {
        const empleadoId = req.params.id;
        const sql = 'DELETE FROM empleado WHERE id_empleado = ?';

        conexion.query(sql, [empleadoId], (error, result) => {
            if (error) {
                console.error('Error al eliminar empleado:', error);
                return res.status(500).json({
                    message: 'Error interno del servidor al eliminar empleado',
                    error: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: `Empleado con ID ${empleadoId} no encontrado para eliminar`
                });
            }

            res.status(200).json({
                mensaje: `Empleado con ID ${empleadoId} eliminado exitosamente`
            });
        });
    });

    return ruta;
};
