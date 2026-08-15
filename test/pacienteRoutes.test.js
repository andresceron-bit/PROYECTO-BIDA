const express = require('express');
const request = require('supertest');
const pacienteRoutes = require('../routes/pacienteRoutes');

// ======================================================
// MOCK DE LA CONEXIÓN A MYSQL
// ======================================================

const conexionMock = {
    query: jest.fn()
};

// ======================================================
// CONFIGURACIÓN DE EXPRESS PARA LAS PRUEBAS
// ======================================================

const app = express();

app.use(express.json());

app.use('/servidor', pacienteRoutes(conexionMock));


// ======================================================
// PRUEBA 1
// Obtener todos los pacientes
// ======================================================

test('GET /servidor/paciente - debe obtener todos los pacientes', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_paciente: 1,
                documento_identidad: '1061789456',
                nombre: 'Andres',
                apellido: 'Ceron',
                fecha_nacimiento: '2001-05-10',
                genero: 'Masculino',
                direccion: 'Popayan',
                telefono: '3001234567',
                correo: 'andres@bida.com'
            },
            {
                id_paciente: 2,
                documento_identidad: '1062547893',
                nombre: 'Maria',
                apellido: 'Lopez',
                fecha_nacimiento: '1999-08-20',
                genero: 'Femenino',
                direccion: 'Popayan',
                telefono: '3115678901',
                correo: 'maria@bida.com'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/paciente');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
    expect(respuesta.body[0].nombre).toBe('Andres');
    expect(respuesta.body[1].nombre).toBe('Maria');

});


// ======================================================
// PRUEBA 2
// Obtener un paciente por ID
// ======================================================

test('GET /servidor/paciente/1 - debe obtener al paciente', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_paciente: 1,
                documento_identidad: '1061789456',
                nombre: 'Andres',
                apellido: 'Ceron',
                fecha_nacimiento: '2001-05-10',
                genero: 'Masculino',
                direccion: 'Popayan',
                telefono: '3001234567',
                correo: 'andres@bida.com'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/paciente/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.nombre).toBe('Andres');
    expect(respuesta.body.id_paciente).toBe(1);

});


// ======================================================
// PRUEBA 3
// Paciente inexistente
// ======================================================

test('GET /servidor/paciente/99 - debe indicar que no existe', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/paciente/99');

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain('Paciente no encontrado');

});


// ======================================================
// PRUEBA 4
// Crear paciente correctamente
// ======================================================

test('POST /servidor/crear-tabla-paciente - debe crear un paciente correctamente', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevoPaciente = {
        id_paciente: 3,
        documento_identidad: '1098765432',
        nombre: 'Carlos',
        apellido: 'Perez',
        fecha_nacimiento: '2000-01-15',
        genero: 'Masculino',
        direccion: 'Popayan',
        telefono: '3009876543',
        correo: 'carlos.perez@bida.com'
    };

    const respuesta = await request(app)
        .post('/servidor/crear-tabla-paciente')
        .send(nuevoPaciente);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.message).toBe('Paciente creado exitosamente');
    expect(respuesta.body.id_paciente).toBe(3);

});


// ======================================================
// PRUEBA 5
// Crear paciente sin datos
// ======================================================

test('POST /servidor/crear-tabla-paciente - debe rechazar datos vacios', async () => {

    const respuesta = await request(app)
        .post('/servidor/crear-tabla-paciente')
        .send({});

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('No se enviaron datos');

});


// ======================================================
// PRUEBA 6
// Error al crear paciente
// ======================================================

test('POST /servidor/crear-tabla-paciente - debe devolver 500 si hay error en BD', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        const error = {
            code: 'ER_DUP_ENTRY',
            message: 'Registro duplicado'
        };

        callback(error, null);

    });

    const nuevoPaciente = {
        id_paciente: 4,
        documento_identidad: '1111111111',
        nombre: 'Pedro',
        apellido: 'Prueba',
        fecha_nacimiento: '2000-01-01',
        genero: 'Masculino',
        direccion: 'Popayan',
        telefono: '3000000000',
        correo: 'pedro@bida.com'
    };

    const respuesta = await request(app)
        .post('/servidor/crear-tabla-paciente')
        .send(nuevoPaciente);

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.message).toContain('Error al insertar datos');

});


// ======================================================
// PRUEBA 7
// Actualizar paciente
// ======================================================

test('PUT /servidor/paciente/1 - debe actualizar al paciente', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        documento_identidad: '1061789456',
        nombre: 'Andres',
        apellido: 'Ceron',
        fecha_nacimiento: '2001-05-10',
        genero: 'Masculino',
        direccion: 'Popayan',
        telefono: '3009999999',
        correo: 'andres.actualizado@bida.com'
    };

    const respuesta = await request(app)
        .put('/servidor/paciente/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toContain('actualizado exitosamente');
    expect(respuesta.body.affectedRows).toBe(1);

});


// ======================================================
// PRUEBA 8
// Actualizar paciente inexistente
// ======================================================

test('PUT /servidor/paciente/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const datosActualizados = {
        documento_identidad: '9999999999',
        nombre: 'Paciente',
        apellido: 'Inexistente',
        fecha_nacimiento: '2000-01-01',
        genero: 'Masculino',
        direccion: 'Popayan',
        telefono: '3000000000',
        correo: 'inexistente@bida.com'
    };

    const respuesta = await request(app)
        .put('/servidor/paciente/99')
        .send(datosActualizados);

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('No se encontró el paciente');

});


// ======================================================
// PRUEBA 9
// Eliminar paciente
// ======================================================

test('DELETE /servidor/paciente/2 - debe eliminar paciente', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/paciente/2');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toContain('eliminado exitosamente');
    expect(respuesta.body.affectedRows).toBe(1);

});


// ======================================================
// PRUEBA 10
// Eliminar paciente inexistente
// ======================================================

test('DELETE /servidor/paciente/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/paciente/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('No se encontró el paciente');

});