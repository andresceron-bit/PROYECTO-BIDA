const express = require('express');
const request = require('supertest');
const detalleTratamientoRoutes = require('../routes/detalle_tratamientoRoutes');

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

app.use(
    '/servidor',
    detalleTratamientoRoutes(conexionMock)
);

// ======================================================
// PRUEBA 1
// Obtener todos los detalles de tratamiento
// ======================================================

test('GET /servidor/detalle-tratamiento - debe obtener todos los detalles', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_detalle: 1,
                id_tratamiento: 1,
                id_cita: 1,
                costo_aplicado: 80000,
                observaciones: 'Tratamiento realizado correctamente',
                nombre_tratamiento: 'Limpieza dental',
                descripcion: 'Limpieza general',
                costo_base: 70000,
                fecha: '2026-08-15',
                hora: '10:00:00',
                estado: 'Completada',
                id_paciente: 1,
                nombre_paciente: 'Carlos',
                apellido_paciente: 'Cajas',
                id_odontologo: 1,
                nombre_odontologo: 'Juan',
                apellido_odontologo: 'Pérez'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/detalle-tratamiento');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toBe(
        'Detalles de tratamiento obtenidos correctamente'
    );
    expect(respuesta.body.total).toBe(1);
    expect(respuesta.body.detalles).toHaveLength(1);
    expect(respuesta.body.detalles[0].id_detalle).toBe(1);

});

// ======================================================
// PRUEBA 2
// Obtener un detalle por ID
// ======================================================

test('GET /servidor/detalle-tratamiento/1 - debe obtener un detalle', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_detalle: 1,
                id_tratamiento: 2,
                id_cita: 3,
                costo_aplicado: 120000,
                observaciones: 'Sin complicaciones',

                nombre_tratamiento: 'Ortodoncia',
                descripcion: 'Tratamiento de ortodoncia',
                costo_base: 100000,

                fecha: '2026-08-15',
                hora: '09:00:00',
                estado: 'Completada',

                id_paciente: 5,
                documento_identidad: '123456789',
                nombre_paciente: 'Carlos',
                apellido_paciente: 'Cajas',
                telefono: '3001234567',
                correo: 'carlos@gmail.com',

                id_odontologo: 2,
                numero_licencia: 'OD12345',
                nombre_odontologo: 'Juan',
                apellido_odontologo: 'Pérez',
                especialidad: 'Ortodoncia'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/detalle-tratamiento/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.id_detalle).toBe(1);

    expect(respuesta.body.tratamiento.id_tratamiento).toBe(2);
    expect(respuesta.body.tratamiento.nombre_tratamiento)
        .toBe('Ortodoncia');

    expect(respuesta.body.cita.id_cita).toBe(3);

    expect(respuesta.body.paciente.id_paciente).toBe(5);
    expect(respuesta.body.paciente.nombre).toBe('Carlos');

    expect(respuesta.body.odontologo.id_odontologo).toBe(2);
    expect(respuesta.body.odontologo.especialidad)
        .toBe('Ortodoncia');

    expect(respuesta.body.costo_aplicado).toBe(120000);

});

// ======================================================
// PRUEBA 3
// Detalle inexistente
// ======================================================

test('GET /servidor/detalle-tratamiento/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/detalle-tratamiento/99');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje)
        .toContain('No se encontró el detalle de tratamiento');

});

// ======================================================
// PRUEBA 4
// Error de BD al obtener todos los detalles
// ======================================================

test('GET /servidor/detalle-tratamiento - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/detalle-tratamiento');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toContain('Error al consultar los detalles de tratamiento');

});

// ======================================================
// PRUEBA 5
// No hay detalles de tratamiento
// ======================================================

test('GET /servidor/detalle-tratamiento - debe devolver 404 si no hay detalles', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/detalle-tratamiento');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje)
        .toBe('No se encontraron detalles de tratamiento');

});

// ======================================================
// PRUEBA 6
// Error de BD al obtener un detalle
// ======================================================

test('GET /servidor/detalle-tratamiento/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/detalle-tratamiento/1');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toContain('Error al consultar el detalle de tratamiento');

});

// ======================================================
// PRUEBA 7
// Crear detalle correctamente
// ======================================================

test('POST /servidor/detalle-tratamiento - debe crear un detalle correctamente', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            insertId: 10
        });

    });

    const nuevoDetalle = {
        id_tratamiento: 2,
        id_cita: 3,
        costo_aplicado: 150000,
        observaciones: 'Tratamiento realizado'
    };

    const respuesta = await request(app)
        .post('/servidor/detalle-tratamiento')
        .send(nuevoDetalle);

    expect(respuesta.status).toBe(201);

    expect(respuesta.body.mensaje)
        .toBe('Detalle de tratamiento creado correctamente');

    expect(respuesta.body.id_detalle).toBe(10);

    expect(respuesta.body.detalle.id_tratamiento)
        .toBe(2);

    expect(respuesta.body.detalle.id_cita)
        .toBe(3);

    expect(respuesta.body.detalle.costo_aplicado)
        .toBe(150000);

});

// ======================================================
// PRUEBA 8
// Crear detalle con datos incompletos
// ======================================================

test('POST /servidor/detalle-tratamiento - debe rechazar datos incompletos', async () => {

    const detalleIncompleto = {
        id_tratamiento: 2,
        id_cita: 3
    };

    const respuesta = await request(app)
        .post('/servidor/detalle-tratamiento')
        .send(detalleIncompleto);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje)
        .toBe('Faltan datos obligatorios');

});

// ======================================================
// PRUEBA 9
// Error de BD al crear detalle
// ======================================================

test('POST /servidor/detalle-tratamiento - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const nuevoDetalle = {
        id_tratamiento: 2,
        id_cita: 3,
        costo_aplicado: 150000,
        observaciones: 'Tratamiento'
    };

    const respuesta = await request(app)
        .post('/servidor/detalle-tratamiento')
        .send(nuevoDetalle);

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toContain('Error al crear el detalle de tratamiento');

});

// ======================================================
// PRUEBA 10
// Actualizar detalle
// ======================================================

test('PUT /servidor/detalle-tratamiento/1 - debe actualizar el detalle', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        costo_aplicado: 180000,
        observaciones: 'Costo actualizado'
    };

    const respuesta = await request(app)
        .put('/servidor/detalle-tratamiento/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje)
        .toContain('actualizado correctamente');

    expect(respuesta.body.datosActualizados.costo_aplicado)
        .toBe(180000);

});

// ======================================================
// PRUEBA 11
// Actualizar sin campos
// ======================================================

test('PUT /servidor/detalle-tratamiento/1 - debe rechazar actualización sin campos', async () => {

    const respuesta = await request(app)
        .put('/servidor/detalle-tratamiento/1')
        .send({});

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje)
        .toBe('No hay datos para actualizar');

});

// ======================================================
// PRUEBA 12
// Actualizar detalle inexistente
// ======================================================

test('PUT /servidor/detalle-tratamiento/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .put('/servidor/detalle-tratamiento/99')
        .send({
            costo_aplicado: 200000
        });

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje)
        .toContain('No se encontró el detalle');

});

// ======================================================
// PRUEBA 13
// Eliminar detalle
// ======================================================

test('DELETE /servidor/detalle-tratamiento/1 - debe eliminar el detalle', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/detalle-tratamiento/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje)
        .toContain('eliminado correctamente');

});

// ======================================================
// PRUEBA 14
// Eliminar detalle inexistente
// ======================================================

test('DELETE /servidor/detalle-tratamiento/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/detalle-tratamiento/99');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje)
        .toContain('No se encontró el detalle');

});

// ======================================================
// PRUEBA 15
// Error de BD al eliminar detalle
// ======================================================

test('DELETE /servidor/detalle-tratamiento/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .delete('/servidor/detalle-tratamiento/1');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toContain('Error al eliminar el detalle de tratamiento');

});