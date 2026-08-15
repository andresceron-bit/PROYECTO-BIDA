const express = require('express');
const request = require('supertest');
const consultorioRoutes = require('../routes/consultorioRoutes');

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

app.use('/servidor', consultorioRoutes(conexionMock));

// ======================================================
// PRUEBA 1
// Obtener todos los consultorios
// ======================================================

test('GET /servidor/consultorio - debe obtener todos los consultorios', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_consultorio: 1,
                id_numero: 101,
                id_local: 1,
                id_odontologo: 1,
                calle: 'Carrera 5',
                numero_local: '10-25',
                ciudad: 'Popayán',
                numero_licencia: 'LIC001',
                nombre_odontologo: 'Carlos',
                apellido_odontologo: 'Pérez',
                especialidad: 'Ortodoncia'
            },
            {
                id_consultorio: 2,
                id_numero: 102,
                id_local: 2,
                id_odontologo: 2,
                calle: 'Calle 10',
                numero_local: '20-15',
                ciudad: 'Cali',
                numero_licencia: 'LIC002',
                nombre_odontologo: 'Ana',
                apellido_odontologo: 'Gómez',
                especialidad: 'Endodoncia'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/consultorio');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toBe(
        'Consultorios obtenidos correctamente'
    );
    expect(respuesta.body.total).toBe(2);
    expect(respuesta.body.consultorios).toHaveLength(2);

});

// ======================================================
// PRUEBA 2
// Obtener consultorio por ID
// ======================================================

test('GET /servidor/consultorio/1 - debe obtener un consultorio', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_consultorio: 1,
                id_numero: 101,
                id_local: 1,
                id_odontologo: 1,
                calle: 'Carrera 5',
                numero_local: '10-25',
                ciudad: 'Popayán',
                numero_licencia: 'LIC001',
                nombre_odontologo: 'Carlos',
                apellido_odontologo: 'Pérez',
                especialidad: 'Ortodoncia',
                correo: 'carlos@bida.com',
                telefono: '3001234567'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/consultorio/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.id_consultorio).toBe(1);
    expect(respuesta.body.id_numero).toBe(101);

    expect(respuesta.body.local.id_local).toBe(1);
    expect(respuesta.body.local.calle).toBe('Carrera 5');
    expect(respuesta.body.local.ciudad).toBe('Popayán');

    expect(respuesta.body.odontologo.id_odontologo).toBe(1);
    expect(respuesta.body.odontologo.nombre).toBe('Carlos');
    expect(respuesta.body.odontologo.especialidad).toBe('Ortodoncia');

});

// ======================================================
// PRUEBA 3
// Consultorio inexistente
// ======================================================

test('GET /servidor/consultorio/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/consultorio/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toContain('No se encontró el consultorio');

});

// ======================================================
// PRUEBA 4
// Error de BD al obtener consultorios
// ======================================================

test('GET /servidor/consultorio - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/consultorio');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.mensaje).toContain(
        'Error al consultar los consultorios'
    );

});

// ======================================================
// PRUEBA 5
// No existen consultorios
// ======================================================

test('GET /servidor/consultorio - debe devolver 404 si no hay consultorios', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/consultorio');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toBe(
        'No se encontraron consultorios'
    );

});

// ======================================================
// PRUEBA 6
// Error de BD al obtener un consultorio por ID
// ======================================================

test('GET /servidor/consultorio/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/consultorio/1');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.mensaje).toContain(
        'Error al consultar el consultorio'
    );

});

// ======================================================
// PRUEBA 7
// Crear consultorio correctamente
// ======================================================

test('POST /servidor/consultorio - debe crear un consultorio correctamente', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevoConsultorio = {
        id_numero: 103,
        id_local: 1,
        id_odontologo: 2
    };

    const respuesta = await request(app)
        .post('/servidor/consultorio')
        .send(nuevoConsultorio);

    expect(respuesta.status).toBe(201);

    expect(respuesta.body.mensaje).toBe(
        'Consultorio creado correctamente'
    );

    expect(respuesta.body.id_consultorio).toBe(3);

    expect(respuesta.body.consultorio).toEqual(nuevoConsultorio);

});

// ======================================================
// PRUEBA 8
// Crear consultorio con datos incompletos
// ======================================================

test('POST /servidor/consultorio - debe rechazar datos incompletos', async () => {

    const consultorioIncompleto = {
        id_numero: 103,
        id_local: 1
    };

    const respuesta = await request(app)
        .post('/servidor/consultorio')
        .send(consultorioIncompleto);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toContain(
        'Faltan datos obligatorios'
    );

});

// ======================================================
// PRUEBA 9
// Crear consultorio sin id_numero
// ======================================================

test('POST /servidor/consultorio - debe rechazar consultorio sin id_numero', async () => {

    const consultorioIncompleto = {
        id_local: 1,
        id_odontologo: 2
    };

    const respuesta = await request(app)
        .post('/servidor/consultorio')
        .send(consultorioIncompleto);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toContain(
        'Faltan datos obligatorios'
    );

});

// ======================================================
// PRUEBA 10
// Error de BD al crear consultorio
// ======================================================

test('POST /servidor/consultorio - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const nuevoConsultorio = {
        id_numero: 103,
        id_local: 1,
        id_odontologo: 2
    };

    const respuesta = await request(app)
        .post('/servidor/consultorio')
        .send(nuevoConsultorio);

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error al crear el consultorio'
    );

});

// ======================================================
// PRUEBA 11
// Actualizar consultorio
// ======================================================

test('PUT /servidor/consultorio/1 - debe actualizar el consultorio', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        id_odontologo: 2
    };

    const respuesta = await request(app)
        .put('/servidor/consultorio/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje).toContain(
        'actualizado correctamente'
    );

    expect(respuesta.body.datosActualizados).toEqual(
        datosActualizados
    );

});

// ======================================================
// PRUEBA 12
// Actualizar sin enviar campos
// ======================================================

test('PUT /servidor/consultorio/1 - debe rechazar actualización sin campos', async () => {

    const respuesta = await request(app)
        .put('/servidor/consultorio/1')
        .send({});

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toContain(
        'No hay datos para actualizar'
    );

});

// ======================================================
// PRUEBA 13
// Actualizar consultorio inexistente
// ======================================================

test('PUT /servidor/consultorio/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .put('/servidor/consultorio/99')
        .send({
            id_odontologo: 2
        });

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje).toContain(
        'No se encontró el consultorio'
    );

});

// ======================================================
// PRUEBA 14
// Eliminar consultorio
// ======================================================

test('DELETE /servidor/consultorio/1 - debe eliminar el consultorio', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/consultorio/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje).toContain(
        'eliminado correctamente'
    );

});

// ======================================================
// PRUEBA 15
// Eliminar consultorio inexistente
// ======================================================

test('DELETE /servidor/consultorio/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/consultorio/99');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje).toContain(
        'No se encontró el consultorio'
    );

});

// ======================================================
// PRUEBA 16
// Error de BD al eliminar consultorio
// ======================================================

test('DELETE /servidor/consultorio/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .delete('/servidor/consultorio/1');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error al eliminar el consultorio'
    );

});