const express = require('express');
const request = require('supertest');
const odontologoRoutes = require('../routes/odontologoRoutes');

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

app.use('/servidor', odontologoRoutes(conexionMock));


// ======================================================
// PRUEBA 1
// Obtener todos los odontólogos
// ======================================================

test('GET /servidor/odontologo - debe obtener todos los odontólogos', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_odontologo: 1,
                numero_licencia: 'OD-001',
                nombre: 'Juan',
                apellido: 'Perez',
                especialidad: 'Ortodoncia',
                correo: 'juan@bida.com',
                telefono: '3001234567'
            },
            {
                id_odontologo: 2,
                numero_licencia: 'OD-002',
                nombre: 'Maria',
                apellido: 'Gomez',
                especialidad: 'Endodoncia',
                correo: 'maria@bida.com',
                telefono: '3115678901'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/odontologo');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.Total).toBe(2);
    expect(respuesta.body.odontologos).toHaveLength(2);
    expect(respuesta.body.odontologos[0].nombre).toBe('Juan');
    expect(respuesta.body.odontologos[1].nombre).toBe('Maria');

});


// ======================================================
// PRUEBA 2
// Obtener odontólogo por ID
// ======================================================

test('GET /servidor/odontologo/1 - debe obtener al odontólogo', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_odontologo: 1,
                numero_licencia: 'OD-001',
                nombre: 'Juan',
                apellido: 'Perez',
                especialidad: 'Ortodoncia',
                correo: 'juan@bida.com',
                telefono: '3001234567'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/odontologo/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.odontologo.nombre).toBe('Juan');
    expect(respuesta.body.odontologo.id_odontologo).toBe(1);

});


// ======================================================
// PRUEBA 3
// Odontólogo inexistente
// ======================================================

test('GET /servidor/odontologo/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/odontologo/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});


// ======================================================
// PRUEBA 4
// Error de base de datos al consultar odontólogos
// ======================================================

test('GET /servidor/odontologo - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        const error = {
            code: 'ER_CONNECTION_ERROR'
        };

        callback(error, null);

    });

    const respuesta = await request(app)
        .get('/servidor/odontologo');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.message).toBe('Error interno del servidor');

});


// ======================================================
// PRUEBA 5
// Crear odontólogo correctamente
// ======================================================

test('POST /servidor/odontologo - debe crear un odontólogo correctamente', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevoOdontologo = {
        numero_licencia: 'OD-003',
        nombre: 'Carlos',
        apellido: 'Rodriguez',
        especialidad: 'Periodoncia',
        correo: 'carlos@bida.com',
        telefono: '3009876543'
    };

    const respuesta = await request(app)
        .post('/servidor/odontologo')
        .send(nuevoOdontologo);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.mensaje).toBe('Odontólogo registrado exitosamente');
    expect(respuesta.body.idOdontologo).toBe(3);
    expect(respuesta.body.odontologo.nombre).toBe('Carlos');

});


// ======================================================
// PRUEBA 6
// Crear odontólogo sin campos obligatorios
// ======================================================

test('POST /servidor/odontologo - debe rechazar datos incompletos', async () => {

    const odontologoIncompleto = {
        nombre: 'Pedro'
    };

    const respuesta = await request(app)
        .post('/servidor/odontologo')
        .send(odontologoIncompleto);

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('Faltan campos requeridos');

});


// ======================================================
// PRUEBA 7
// Odontólogo duplicado
// ======================================================

test('POST /servidor/odontologo - debe devolver 409 si ya existe', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        const error = {
            code: 'ER_DUP_ENTRY',
            message: 'Registro duplicado'
        };

        callback(error, null);

    });

    const odontologoDuplicado = {
        numero_licencia: 'OD-001',
        nombre: 'Juan',
        apellido: 'Perez',
        especialidad: 'Ortodoncia',
        correo: 'juan@bida.com',
        telefono: '3001234567'
    };

    const respuesta = await request(app)
        .post('/servidor/odontologo')
        .send(odontologoDuplicado);

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe('El usuario ya existe');

});


// ======================================================
// PRUEBA 8
// Actualizar odontólogo
// ======================================================

test('PUT /servidor/odontologo/1 - debe actualizar al odontólogo', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        especialidad: 'Cirugía Oral',
        telefono: '3009999999'
    };

    const respuesta = await request(app)
        .put('/servidor/odontologo/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toContain('actualizado exitosamente');
    expect(respuesta.body.datosActualizados.especialidad).toBe('Cirugía Oral');

});


// ======================================================
// PRUEBA 9
// Actualizar sin campos válidos
// ======================================================

test('PUT /servidor/odontologo/1 - debe rechazar actualización sin campos', async () => {

    const respuesta = await request(app)
        .put('/servidor/odontologo/1')
        .send({});

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe('No hay campos válidos para actualizar');

});


// ======================================================
// PRUEBA 10
// Actualizar odontólogo inexistente
// ======================================================

test('PUT /servidor/odontologo/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const datosActualizados = {
        especialidad: 'Ortodoncia'
    };

    const respuesta = await request(app)
        .put('/servidor/odontologo/99')
        .send(datosActualizados);

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});


// ======================================================
// PRUEBA 11
// Eliminar odontólogo
// ======================================================

test('DELETE /servidor/odontologo/2 - debe eliminar odontólogo', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/odontologo/2');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.message).toContain('eliminado exitosamente');

});


// ======================================================
// PRUEBA 12
// Eliminar odontólogo inexistente
// ======================================================

test('DELETE /servidor/odontologo/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/odontologo/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});


// ======================================================
// PRUEBA 13
// Error de base de datos al eliminar odontólogo
// ======================================================

test('DELETE /servidor/odontologo/1 - debe devolver 500 si ocurre un error', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        const error = {
            code: 'ER_CONNECTION_ERROR',
            message: 'Error de conexión'
        };

        callback(error, null);

    });

    const respuesta = await request(app)
        .delete('/servidor/odontologo/1');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.message).toBe('Error interno del servidor al eliminar odontólogo');

});