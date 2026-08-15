const express = require('express');
const request = require('supertest');
const tratamientoRoutes = require('../routes/tratamientoRoutes');

// ======================================================
// MOCK DE LA CONEXIÓN A MYSQL
// ======================================================

const conexionMock = {
query: jest.fn()
};

// ======================================================
// CONFIGURACIÓN DE EXPRESS
// ======================================================

const app = express();

app.use(express.json());

app.use('/servidor', tratamientoRoutes(conexionMock));

// ======================================================
// PRUEBA 1
// Obtener todos los tratamientos
// ======================================================

test('GET /servidor/tratamiento - debe obtener todos los tratamientos', async () => {

conexionMock.query.mockImplementation((sql, callback) => {

    callback(null, [
        {
            id_tratamiento: 1,
            nombre_tratamiento: 'Limpieza dental',
            descripcion: 'Limpieza y profilaxis dental',
            costo_base: 80000
        },
        {
            id_tratamiento: 2,
            nombre_tratamiento: 'Blanqueamiento dental',
            descripcion: 'Blanqueamiento profesional',
            costo_base: 250000
        }
    ]);

});

const respuesta = await request(app)
    .get('/servidor/tratamiento');

expect(respuesta.status).toBe(200);
expect(respuesta.body.Total).toBe(2);
expect(respuesta.body.tratamientos).toHaveLength(2);

});

// ======================================================
// PRUEBA 2
// Obtener tratamiento por ID
// ======================================================

test('GET /servidor/tratamiento/1 - debe obtener un tratamiento', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, [
        {
            id_tratamiento: 1,
            nombre_tratamiento: 'Limpieza dental',
            descripcion: 'Limpieza y profilaxis dental',
            costo_base: 80000
        }
    ]);

});

const respuesta = await request(app)
    .get('/servidor/tratamiento/1');

expect(respuesta.status).toBe(200);
expect(respuesta.body.tratamiento.nombre_tratamiento)
    .toBe('Limpieza dental');

expect(respuesta.body.tratamiento.id_tratamiento)
    .toBe(1);

});

// ======================================================
// PRUEBA 3
// Tratamiento inexistente
// ======================================================

test('GET /servidor/tratamiento/99 - debe devolver 404', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, []);

});

const respuesta = await request(app)
    .get('/servidor/tratamiento/99');

expect(respuesta.status).toBe(404);

expect(respuesta.body.message)
    .toContain('no encontrado');

});

// ======================================================
// PRUEBA 4
// Error de base de datos al obtener tratamientos
// ======================================================

test('GET /servidor/tratamiento - debe devolver 500 si ocurre un error de BD', async () => {

conexionMock.query.mockImplementation((sql, callback) => {

    callback({
        message: 'Error de conexión'
    }, null);

});

const respuesta = await request(app)
    .get('/servidor/tratamiento');

expect(respuesta.status).toBe(500);

expect(respuesta.body.message)
    .toContain('Error interno del servidor');

});

// ======================================================
// PRUEBA 5
// Crear tratamiento correctamente
// ======================================================

test('POST /servidor/tratamiento - debe crear un tratamiento correctamente', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, {
        insertId: 3
    });

});

const nuevoTratamiento = {

    nombre_tratamiento: 'Ortodoncia',

    descripcion: 'Tratamiento de ortodoncia',

    costo_base: 1500000

};

const respuesta = await request(app)

    .post('/servidor/tratamiento')

    .send(nuevoTratamiento);


expect(respuesta.status).toBe(201);

expect(respuesta.body.mensaje)
    .toBe('Tratamiento registrado exitosamente');

expect(respuesta.body.idTratamiento)
    .toBe(3);

});

// ======================================================
// PRUEBA 6
// Crear tratamiento con datos incompletos
// ======================================================

test('POST /servidor/tratamiento - debe rechazar datos incompletos', async () => {

const tratamientoIncompleto = {

    nombre_tratamiento: 'Limpieza dental'

};

const respuesta = await request(app)

    .post('/servidor/tratamiento')

    .send(tratamientoIncompleto);


expect(respuesta.status).toBe(400);

expect(respuesta.body.message)
    .toContain('Faltan campos requeridos');

});

// ======================================================
// PRUEBA 7
// Error de BD al crear tratamiento
// ======================================================

test('POST /servidor/tratamiento - debe devolver 500 si ocurre un error de BD', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback({
        message: 'Error de conexión'
    }, null);

});

const nuevoTratamiento = {

    nombre_tratamiento: 'Implante dental',

    descripcion: 'Implante dental completo',

    costo_base: 1200000

};

const respuesta = await request(app)

    .post('/servidor/tratamiento')

    .send(nuevoTratamiento);


expect(respuesta.status).toBe(500);

expect(respuesta.body.message)
    .toContain('Error interno del servidor');

});

// ======================================================
// PRUEBA 8
// Actualizar tratamiento
// ======================================================

test('PUT /servidor/tratamiento/1 - debe actualizar el tratamiento', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, {

        affectedRows: 1

    });

});

const datosActualizados = {

    costo_base: 95000

};

const respuesta = await request(app)

    .put('/servidor/tratamiento/1')

    .send(datosActualizados);


expect(respuesta.status).toBe(200);

expect(respuesta.body.mensaje)
    .toContain('actualizado exitosamente');

});

// ======================================================
// PRUEBA 9
// Actualizar tratamiento sin campos
// ======================================================

test('PUT /servidor/tratamiento/1 - debe rechazar actualización sin campos', async () => {

const respuesta = await request(app)

    .put('/servidor/tratamiento/1')

    .send({});


expect(respuesta.status).toBe(400);

expect(respuesta.body.message)
    .toContain('No hay campos válidos');

});

// ======================================================
// PRUEBA 10
// Actualizar tratamiento inexistente
// ======================================================

test('PUT /servidor/tratamiento/99 - debe devolver 404', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, {

        affectedRows: 0

    });

});

const respuesta = await request(app)

    .put('/servidor/tratamiento/99')

    .send({

        costo_base: 100000

    });


expect(respuesta.status).toBe(404);

expect(respuesta.body.message)
    .toContain('no encontrado');

});

// ======================================================
// PRUEBA 11
// Eliminar tratamiento
// ======================================================

test('DELETE /servidor/tratamiento/2 - debe eliminar tratamiento', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, {

        affectedRows: 1

    });

});

const respuesta = await request(app)

    .delete('/servidor/tratamiento/2');


expect(respuesta.status).toBe(200);

expect(respuesta.body.mensaje)
    .toContain('eliminado exitosamente');

});

// ======================================================
// PRUEBA 12
// Eliminar tratamiento inexistente
// ======================================================

test('DELETE /servidor/tratamiento/99 - debe devolver 404', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback(null, {

        affectedRows: 0

    });

});

const respuesta = await request(app)

    .delete('/servidor/tratamiento/99');


expect(respuesta.status).toBe(404);

expect(respuesta.body.message)
    .toContain('no encontrado');

});

// ======================================================
// PRUEBA 13
// Error de BD al eliminar tratamiento
// ======================================================

test('DELETE /servidor/tratamiento/1 - debe devolver 500 si ocurre un error de BD', async () => {

conexionMock.query.mockImplementation((sql, parametros, callback) => {

    callback({

        message: 'Error de conexión'

    }, null);

});

const respuesta = await request(app)

    .delete('/servidor/tratamiento/1');


expect(respuesta.status).toBe(500);

expect(respuesta.body.message)
    .toContain('Error interno del servidor');

});