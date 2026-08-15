const express = require('express');
const request = require('supertest');
const equipoRoutes = require('../routes/equipoRoutes');

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

app.use('/servidor', equipoRoutes(conexionMock));


// ======================================================
// PRUEBA 1
// Obtener todos los equipos
// ======================================================

test('GET /servidor/equipo - debe obtener todos los equipos', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_equipo: 1,
                tipo: 'Silla odontológica',
                id_numero: 'EQ-001',
                fecha_mantenimiento: '2026-01-15',
                id_local: 1,
                id_consultorio: 1
            },
            {
                id_equipo: 2,
                tipo: 'Compresor',
                id_numero: 'EQ-002',
                fecha_mantenimiento: '2026-02-20',
                id_local: 1,
                id_consultorio: 2
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/equipo');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.total).toBe(2);
    expect(respuesta.body.equipos).toHaveLength(2);

});


// ======================================================
// PRUEBA 2
// Obtener equipo por ID
// ======================================================

test('GET /servidor/equipo/1 - debe obtener un equipo', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_equipo: 1,
                tipo: 'Silla odontológica',
                id_numero: 'EQ-001',
                fecha_mantenimiento: '2026-01-15',
                id_local: 1,
                id_consultorio: 1
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/equipo/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.equipo.id_equipo).toBe(1);
    expect(respuesta.body.equipo.tipo).toBe('Silla odontológica');

});


// ======================================================
// PRUEBA 3
// Equipo inexistente
// ======================================================

test('GET /servidor/equipo/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/equipo/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toContain('no encontrado');

});


// ======================================================
// PRUEBA 4
// Error de BD al obtener equipos
// ======================================================

test('GET /servidor/equipo - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/equipo');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.mensaje).toContain(
        'Error interno del servidor'
    );

});


// ======================================================
// PRUEBA 5
// No hay equipos registrados
// ======================================================

test('GET /servidor/equipo - debe devolver 404 si no hay equipos', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/equipo');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toBe(
        'No se encontraron equipos'
    );

});


// ======================================================
// PRUEBA 6
// Crear equipo correctamente
// ======================================================

test('POST /servidor/equipo - debe crear un equipo correctamente', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevoEquipo = {
        tipo: 'Unidad odontológica',
        id_numero: 'EQ-003',
        fecha_mantenimiento: '2026-08-15',
        id_local: 1,
        id_consultorio: 1
    };

    const respuesta = await request(app)
        .post('/servidor/equipo')
        .send(nuevoEquipo);

    expect(respuesta.status).toBe(201);

    expect(respuesta.body.mensaje).toBe(
        'Equipo registrado exitosamente'
    );

    expect(respuesta.body.idEquipo).toBe(3);

});


// ======================================================
// PRUEBA 7
// Crear equipo con datos incompletos
// ======================================================

test('POST /servidor/equipo - debe rechazar datos incompletos', async () => {

    const equipoIncompleto = {
        tipo: 'Compresor',
        id_numero: 'EQ-004'
    };

    const respuesta = await request(app)
        .post('/servidor/equipo')
        .send(equipoIncompleto);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toContain(
        'Faltan campos requeridos'
    );

});


// ======================================================
// PRUEBA 8
// Error de BD al crear equipo
// ======================================================

test('POST /servidor/equipo - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const nuevoEquipo = {
        tipo: 'Unidad odontológica',
        id_numero: 'EQ-005',
        fecha_mantenimiento: '2026-08-15',
        id_local: 1,
        id_consultorio: 1
    };

    const respuesta = await request(app)
        .post('/servidor/equipo')
        .send(nuevoEquipo);

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error interno del servidor'
    );

});


// ======================================================
// PRUEBA 9
// Actualizar equipo
// ======================================================

test('PUT /servidor/equipo/1 - debe actualizar el equipo', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        tipo: 'Silla odontológica actualizada'
    };

    const respuesta = await request(app)
        .put('/servidor/equipo/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje).toContain(
        'actualizado exitosamente'
    );

});


// ======================================================
// PRUEBA 10
// Actualizar sin enviar campos
// ======================================================

test('PUT /servidor/equipo/1 - debe rechazar actualización sin campos', async () => {

    const respuesta = await request(app)
        .put('/servidor/equipo/1')
        .send({});

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toContain(
        'No se enviaron campos'
    );

});


// ======================================================
// PRUEBA 11
// Actualizar equipo inexistente
// ======================================================

test('PUT /servidor/equipo/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .put('/servidor/equipo/99')
        .send({
            tipo: 'Compresor'
        });

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje).toContain(
        'no encontrado'
    );

});


// ======================================================
// PRUEBA 12
// Eliminar equipo
// ======================================================

test('DELETE /servidor/equipo/1 - debe eliminar equipo', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/equipo/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje).toContain(
        'eliminado exitosamente'
    );

});


// ======================================================
// PRUEBA 13
// Eliminar equipo inexistente
// ======================================================

test('DELETE /servidor/equipo/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/equipo/99');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje).toContain(
        'no encontrado'
    );

});


// ======================================================
// PRUEBA 14
// Error de BD al eliminar equipo
// ======================================================

test('DELETE /servidor/equipo/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .delete('/servidor/equipo/1');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error interno del servidor'
    );

});