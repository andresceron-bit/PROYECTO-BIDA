const express = require('express');
const request = require('supertest');
const localRoutes = require('../routes/localRoutes');

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

app.use('/servidor', localRoutes(conexionMock));

// ======================================================
// PRUEBA 1
// Obtener todos los locales
// ======================================================

test('GET /servidor/local - debe obtener todos los locales', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_local: 1,
                calle: 'Carrera 5',
                numero: '10-25',
                ciudad: 'Popayán'
            },
            {
                id_local: 2,
                calle: 'Calle 10',
                numero: '20-15',
                ciudad: 'Cali'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/local');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.Total).toBe(2);
    expect(respuesta.body.locales).toHaveLength(2);

});

// ======================================================
// PRUEBA 2
// Obtener local por ID
// ======================================================

test('GET /servidor/local/1 - debe obtener un local', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_local: 1,
                calle: 'Carrera 5',
                numero: '10-25',
                ciudad: 'Popayán'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/local/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.local.id_local).toBe(1);
    expect(respuesta.body.local.calle).toBe('Carrera 5');

});

// ======================================================
// PRUEBA 3
// Local inexistente
// ======================================================

test('GET /servidor/local/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/local/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});

// ======================================================
// PRUEBA 4
// Error de BD al obtener locales
// ======================================================

test('GET /servidor/local - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/local');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.message).toContain('Error interno del servidor');

});

// ======================================================
// PRUEBA 5
// Crear local correctamente
// ======================================================

test('POST /servidor/local - debe crear un local correctamente', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevoLocal = {
        calle: 'Carrera 7',
        numero: '15-30',
        ciudad: 'Popayán'
    };

    const respuesta = await request(app)
        .post('/servidor/local')
        .send(nuevoLocal);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.mensaje).toBe('Local registrado exitosamente');
    expect(respuesta.body.idLocal).toBe(3);

});

// ======================================================
// PRUEBA 6
// Crear local con datos incompletos
// ======================================================

test('POST /servidor/local - debe rechazar datos incompletos', async () => {

    const localIncompleto = {
        calle: 'Carrera 5'
    };

    const respuesta = await request(app)
        .post('/servidor/local')
        .send(localIncompleto);

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('Faltan campos requeridos');

});

// ======================================================
// PRUEBA 7
// Error de BD al crear local
// ======================================================

test('POST /servidor/local - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const nuevoLocal = {
        calle: 'Carrera 7',
        numero: '15-30',
        ciudad: 'Popayán'
    };

    const respuesta = await request(app)
        .post('/servidor/local')
        .send(nuevoLocal);

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.message).toContain('Error interno del servidor');

});

// ======================================================
// PRUEBA 8
// Actualizar local
// ======================================================

test('PUT /servidor/local/1 - debe actualizar el local', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        ciudad: 'Cali'
    };

    const respuesta = await request(app)
        .put('/servidor/local/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toContain('actualizado exitosamente');

});

// ======================================================
// PRUEBA 9
// Actualizar sin enviar campos
// ======================================================

test('PUT /servidor/local/1 - debe rechazar actualización sin campos', async () => {

    const respuesta = await request(app)
        .put('/servidor/local/1')
        .send({});

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('No hay campos válidos');

});

// ======================================================
// PRUEBA 10
// Actualizar local inexistente
// ======================================================

test('PUT /servidor/local/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .put('/servidor/local/99')
        .send({
            ciudad: 'Bogotá'
        });

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});

// ======================================================
// PRUEBA 11
// Eliminar local
// ======================================================

test('DELETE /servidor/local/1 - debe eliminar local', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/local/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toContain('eliminado exitosamente');

});

// ======================================================
// PRUEBA 12
// Eliminar local inexistente
// ======================================================

test('DELETE /servidor/local/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/local/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});

// ======================================================
// PRUEBA 13
// Error de BD al eliminar local
// ======================================================

test('DELETE /servidor/local/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .delete('/servidor/local/1');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.message).toContain('Error interno del servidor');

});