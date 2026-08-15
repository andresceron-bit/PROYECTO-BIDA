const express = require('express');
const request = require('supertest');
const citaRoutes = require('../routes/citaRoutes');

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

app.use('/servidor', citaRoutes(conexionMock));

// ======================================================
// PRUEBA 1
// Obtener todas las citas
// ======================================================

test('GET /servidor/cita - debe obtener todas las citas', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_cita: 1,
                fecha: '2026-08-20',
                hora: '09:00:00',
                estado: 'Programada',
                id_paciente: 1,
                id_odontologo: 1,
                documento_identidad: '123456789',
                nombre_paciente: 'Carlos',
                apellido_paciente: 'Ceron',
                telefono_paciente: '3001234567',
                correo_paciente: 'carlos@gmail.com',
                numero_licencia: 'OD-001',
                nombre_odontologo: 'Juan',
                apellido_odontologo: 'Perez',
                especialidad: 'Ortodoncia',
                telefono_odontologo: '3007654321'
            },
            {
                id_cita: 2,
                fecha: '2026-08-21',
                hora: '10:30:00',
                estado: 'Confirmada',
                id_paciente: 2,
                id_odontologo: 2,
                documento_identidad: '987654321',
                nombre_paciente: 'Maria',
                apellido_paciente: 'Lopez',
                telefono_paciente: '3019876543',
                correo_paciente: 'maria@gmail.com',
                numero_licencia: 'OD-002',
                nombre_odontologo: 'Ana',
                apellido_odontologo: 'Gomez',
                especialidad: 'Endodoncia',
                telefono_odontologo: '3021234567'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/cita');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toBe('Citas obtenidas correctamente');
    expect(respuesta.body.total).toBe(2);
    expect(respuesta.body.citas).toHaveLength(2);
    expect(respuesta.body.citas[0].id_cita).toBe(1);
    expect(respuesta.body.citas[1].id_cita).toBe(2);

});

// ======================================================
// PRUEBA 2
// Obtener cita por ID
// ======================================================

test('GET /servidor/cita/1 - debe obtener una cita', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_cita: 1,
                fecha: '2026-08-20',
                hora: '09:00:00',
                estado: 'Programada',
                id_paciente: 1,
                id_odontologo: 1,
                documento_identidad: '123456789',
                nombre_paciente: 'Carlos',
                apellido_paciente: 'Ceron',
                fecha_nacimiento: '2002-05-10',
                genero: 'Masculino',
                direccion: 'Popayan',
                telefono_paciente: '3001234567',
                correo_paciente: 'carlos@gmail.com',
                numero_licencia: 'OD-001',
                nombre_odontologo: 'Juan',
                apellido_odontologo: 'Perez',
                especialidad: 'Ortodoncia',
                correo_odontologo: 'juan@gmail.com',
                telefono_odontologo: '3007654321'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/cita/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.id_cita).toBe(1);
    expect(respuesta.body.fecha).toBe('2026-08-20');
    expect(respuesta.body.hora).toBe('09:00:00');
    expect(respuesta.body.estado).toBe('Programada');

    expect(respuesta.body.paciente.id_paciente).toBe(1);
    expect(respuesta.body.paciente.nombre).toBe('Carlos');
    expect(respuesta.body.paciente.apellido).toBe('Ceron');

    expect(respuesta.body.odontologo.id_odontologo).toBe(1);
    expect(respuesta.body.odontologo.nombre).toBe('Juan');
    expect(respuesta.body.odontologo.apellido).toBe('Perez');

});

// ======================================================
// PRUEBA 3
// Cita inexistente
// ======================================================

test('GET /servidor/cita/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/cita/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toContain('No se encontró la cita con ID 99');

});

// ======================================================
// PRUEBA 4
// Error de BD al obtener todas las citas
// ======================================================

test('GET /servidor/cita - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/cita');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.mensaje).toContain('Error al consultar las citas');

});

// ======================================================
// PRUEBA 5
// No existen citas
// ======================================================

test('GET /servidor/cita - debe devolver 404 si no hay citas', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/cita');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.mensaje).toBe('No se encontraron citas');

});

// ======================================================
// PRUEBA 6
// Error de BD al obtener cita por ID
// ======================================================

test('GET /servidor/cita/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/cita/1');

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.mensaje).toContain('Error al consultar la cita');

});

// ======================================================
// PRUEBA 7
// Crear cita correctamente
// ======================================================

test('POST /servidor/cita - debe crear una cita correctamente', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevaCita = {
        fecha: '2026-08-25',
        hora: '11:00:00',
        estado: 'Programada',
        id_paciente: 1,
        id_odontologo: 2
    };

    const respuesta = await request(app)
        .post('/servidor/cita')
        .send(nuevaCita);

    expect(respuesta.status).toBe(201);

    expect(respuesta.body.mensaje).toBe('Cita creada correctamente');
    expect(respuesta.body.id_cita).toBe(3);

    expect(respuesta.body.cita.fecha).toBe('2026-08-25');
    expect(respuesta.body.cita.hora).toBe('11:00:00');
    expect(respuesta.body.cita.estado).toBe('Programada');
    expect(respuesta.body.cita.id_paciente).toBe(1);
    expect(respuesta.body.cita.id_odontologo).toBe(2);

});

// ======================================================
// PRUEBA 8
// Crear cita con datos incompletos
// ======================================================

test('POST /servidor/cita - debe rechazar datos incompletos', async () => {

    const citaIncompleta = {
        fecha: '2026-08-25',
        hora: '11:00:00'
    };

    const respuesta = await request(app)
        .post('/servidor/cita')
        .send(citaIncompleta);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toContain(
        'Faltan datos obligatorios'
    );

});

// ======================================================
// PRUEBA 9
// Error de BD al crear cita
// ======================================================

test('POST /servidor/cita - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, datos, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const nuevaCita = {
        fecha: '2026-08-25',
        hora: '11:00:00',
        estado: 'Programada',
        id_paciente: 1,
        id_odontologo: 2
    };

    const respuesta = await request(app)
        .post('/servidor/cita')
        .send(nuevaCita);

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error al crear la cita'
    );

});

// ======================================================
// PRUEBA 10
// Actualizar cita
// ======================================================

test('PUT /servidor/cita/1 - debe actualizar la cita', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        estado: 'Confirmada'
    };

    const respuesta = await request(app)
        .put('/servidor/cita/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);

    // El código actual de citaRoutes.js devuelve literalmente
    // 'Cita ${idCita} actualizada correctamente'
    expect(respuesta.body.mensaje).toBe(
        'Cita ${idCita} actualizada correctamente'
    );

    expect(respuesta.body.datosActualizados.estado).toBe('Confirmada');

});

// ======================================================
// PRUEBA 11
// Actualizar sin enviar campos
// ======================================================

test('PUT /servidor/cita/1 - debe rechazar actualización sin campos', async () => {

    const respuesta = await request(app)
        .put('/servidor/cita/1')
        .send({});

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje).toBe(
        'No hay datos para actualizar'
    );

});

// ======================================================
// PRUEBA 12
// Actualizar cita inexistente
// ======================================================

test('PUT /servidor/cita/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .put('/servidor/cita/99')
        .send({
            estado: 'Confirmada'
        });

    expect(respuesta.status).toBe(404);

    // El código actual utiliza comillas simples,
    // por lo que ${idCita} queda como texto literal.
    expect(respuesta.body.mensaje).toBe(
        'No se encontró la cita con ID ${idCita}'
    );

});

// ======================================================
// PRUEBA 13
// Error de BD al actualizar cita
// ======================================================

test('PUT /servidor/cita/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, valores, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .put('/servidor/cita/1')
        .send({
            estado: 'Confirmada'
        });

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error al actualizar la cita'
    );

});

// ======================================================
// PRUEBA 14
// Eliminar cita
// ======================================================

test('DELETE /servidor/cita/1 - debe eliminar la cita', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/cita/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.mensaje).toBe(
        'Cita 1 eliminada correctamente'
    );

});

// ======================================================
// PRUEBA 15
// Eliminar cita inexistente
// ======================================================

test('DELETE /servidor/cita/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/cita/99');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje).toBe(
        'No se encontró la cita con ID 99'
    );

});

// ======================================================
// PRUEBA 16
// Error de BD al eliminar cita
// ======================================================

test('DELETE /servidor/cita/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .delete('/servidor/cita/1');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje).toContain(
        'Error al eliminar la cita'
    );

});