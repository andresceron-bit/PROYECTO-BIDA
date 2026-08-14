const express = require('express');
const ruta = express.Router();

module.exports = function (conexion) {
//===========================================
//metodo para mostrar todos los pacientes
//========================================

ruta.get('/paciente', (req, res) =>{
    const sql = 'SELECT * FROM paciente';

    conexion.query(sql, (error, filas)=>{
        if (error) {
            console.error('Error al obtener los pacientes',
                 error)
             return res.status(500).send({
                message: 'Error al consultar los pacientes',
                detalleError: error.code
            });  
        }

        if (filas.length === 0) {
            return res.status(404).send({
                message: 'No se encontraron pacientes'
            });
        } else {
           return res.status(200).send(filas);
        }
     });
  });

//===========================================
//metodo para mostrar un paciente por su id
//===========================================

ruta.get('/paciente/:id_paciente', (req, res) => {

    const id = req.params.id_paciente;

    const sql = 'SELECT * FROM paciente WHERE id_paciente = ?';

    conexion.query(sql, [id], (error, filas) => {
        // 1. Manejo de Errores: Error de conexion a SQL (500 internal server Error)
        if (error) {
            console.log('ERROR:', error);
            return res.status(500).send('Error en la consulta');
        }

        if (filas.length === 0) {
            return res.send('Paciente no encontrado');
        }

        return res.status(200).send(filas[0]);
    });
});

//===========================================
//metodo para crear tabla del proyecto bida
//===========================================

ruta.post('/crear-tabla-paciente', (req, res) => {

    // ✅ CORRECCIÓN: Cambiar de GET a POST - Los datos en req.body solo se reciben en POST
    
    // Validar que existan los datos necesarios
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({
            message: `Error: No se enviaron datos`
        });
    }

    // Preparar los datos a insertar
    const datos = {
        id_paciente: req.body.id_paciente,
        documento_identidad: req.body.documento_identidad,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        fecha_nacimiento: req.body.fecha_nacimiento,
        genero: req.body.genero,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        correo: req.body.correo
    };

    // Query para insertar en la tabla paciente
    const sql = "INSERT INTO paciente SET ?";

    // Ejecutar la inserción
    conexion.query(sql, datos, function (error, resultado) {

        // Si hay error en la base de datos
        if (error) {
            console.error(' Error al insertar en BD:', error.message);
            return res.status(500).send({
                message: `Error al insertar datos en la tabla paciente`,
                error: error.code
            });
        }

        // Si se insertó correctamente
        console.log(' Paciente creado con ID:', resultado.insertId);
        res.status(201).send({
            message: `Paciente creado exitosamente`,
            id_paciente: resultado.insertId
        });
    });

});

//===========================================
//metodo para editar un paciente 
//===========================================

ruta.put('/paciente/:id_paciente', (req, res) => {
    const id_paciente = req.params.id_paciente;

    // Obtenemos los datos a actualizar del cuerpo de la solicitud
    // Usamos la destructuracion de req.body para mayor claridad
    const {
        documento_identidad,
        nombre,
        apellido,
        fecha_nacimiento,
        genero,
        direccion,
        telefono,
        correo
    } = req.body;
    // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
    const sql = 'UPDATE paciente SET documento_identidad = ?, nombre = ?, apellido = ?, fecha_nacimiento = ?, genero = ?, direccion = ?, telefono = ?, correo = ? WHERE id_paciente = ?';

    // Array de valores, asegurando el orden correcto de los datos
    const datos = [
        documento_identidad,
        nombre,
        apellido,
        fecha_nacimiento,
        genero,
        direccion,
        telefono,
        correo,
        id_paciente  // El ID es el ultimo valor del WHERE
    ];

    conexion.query(sql, datos, function (error, resultado){
        // Manejo de errores: Error de base de datos o conexion (500)
        if (error) {
            console.error('Error al actualizar paciente con ID ${id_paciente}:', error);
            res.status(500).send({
                message: `Error al intentar actualizar el paciente con ID ${id_paciente}`,
                detalleError: error.code
            });
            return;
        }

        // 2. validacion de Actualizacion
        if (resultado.affectedRows === 0) {
            res.status(404).send({
                message: `No se encontró el paciente con ID ${id_paciente} para actualizar`
            });
         } else {
            //Exito 200: El producto fue encontrado y actualizado correctamente.
            res.status(200).send({
                message: `Paciente con ID ${id_paciente} actualizado exitosamente`,
                affectedRows: resultado.affectedRows
            });
        }   
    });
});

//===========================================
//metodo para eliminar un paciente
//===========================================

ruta.delete('/paciente/:id_paciente', (req, res) => {

    const id_paciente = req.params.id_paciente;

    const sql = 'DELETE FROM paciente WHERE id_paciente = ?';

    conexion.query(sql, [id_paciente], function (error, resultado){

        // 1. Manejo de errores: Error de base de datos o conexion (500)
        if (error) {
            console.error('Error al eliminar paciente con ID ${id_paciente}:', error);
            res.status(500).send({
                message: 'Error al intentar eliminar el paciente con ID ${id_paciente}',
                detalleError: error.code
            });
            return;
        }

        // 2. validacion de Eliminacion
        if (resultado.affectedRows === 0) {
            // Error 404: Si no se afecto ninguna fila, el paciente no existe.
            res.status(404).send({
                message: 'No se encontró el paciente con ID ${id_paciente} para eliminar'
            });
        } else {
            // Exito 204: eliminacion exitosa. El codigo 204 (No Content)
            // es el estandar para operaciones DELETE exitosas que no devuelven cuerpo
            res.status(200).send({  //No se envia contenido en el cuerpo de la respuesta
                message: `Paciente con ID ${id_paciente} eliminado exitosamente`,
                affectedRows: resultado.affectedRows
            });
        }
    });
});

return ruta;

};