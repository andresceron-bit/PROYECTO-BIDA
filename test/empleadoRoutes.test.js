const express = require('express');
const request = require('supertest');
const empleadoRoutes = require('../routes/empleadoRoutes');

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

app.use('/servidor', empleadoRoutes(conexionMock));

// ======================================================
// PRUEBA 1
// Obtener todos los empleados
// ======================================================

test('GET /servidor/empleado - debe obtener todos los empleados', async () => {

    conexionMock.query.mockImplementation((sql, callback) => {

        callback(null, [
            {
                id_empleado: 1,
                documento_identidad: '1061789456',
                nombre: 'Laura',
                apellido: 'Ramirez',
                cargo: 'Recepcionista',
                correo: 'laura@bida.com',
                telefono: '3104567890'
            },
            {
                id_empleado: 2,
                documento_identidad: '1062547893',
                nombre: 'Carlos',
                apellido: 'Muñoz',
                cargo: 'Auxiliar Administrativo',
                correo: 'carlos@bida.com',
                telefono: '3115678901'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/empleado');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.Total).toBe(2);
    expect(respuesta.body.empleados).toHaveLength(2);

});

// ======================================================
// PRUEBA 2
// Obtener empleado por ID
// ======================================================

test('GET /servidor/empleado/1 - debe obtener a Laura', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_empleado: 1,
                documento_identidad: '1061789456',
                nombre: 'Laura',
                apellido: 'Ramirez',
                cargo: 'Recepcionista',
                correo: 'laura@bida.com',
                telefono: '3104567890'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/empleado/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.empleado.nombre).toBe('Laura');
    expect(respuesta.body.empleado.id_empleado).toBe(1);

});

// ======================================================
// PRUEBA 3
// ID de empleado inexistente
// ======================================================

test('GET /servidor/empleado/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/empleado/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});

// ======================================================
// PRUEBA 4
// Buscar empleado por documento
// ======================================================

test('GET /servidor/empleado/documento/1061789456 - debe encontrar a Laura', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, [
            {
                id_empleado: 1,
                documento_identidad: '1061789456',
                nombre: 'Laura',
                apellido: 'Ramirez',
                cargo: 'Recepcionista',
                correo: 'laura@bida.com',
                telefono: '3104567890'
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/empleado/documento/1061789456');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.empleado.nombre).toBe('Laura');

});

// ======================================================
// PRUEBA 5
// Documento inexistente
// ======================================================

test('GET /servidor/empleado/documento/9999999999 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/empleado/documento/9999999999');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});

// ======================================================
// PRUEBA 6
// Crear empleado correctamente
// ======================================================

test('POST /servidor/empleado - debe crear un empleado correctamente', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            insertId: 3
        });

    });

    const nuevoEmpleado = {
        nombre: 'Andres',
        apellido: 'Prueba',
        cargo: 'Auxiliar',
        correo: 'andres.prueba@bida.com',
        telefono: '3001234567'
    };

    const respuesta = await request(app)
        .post('/servidor/empleado')
        .send(nuevoEmpleado);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.mensaje).toBe('Empleado registrado exitosamente');
    expect(respuesta.body.idEmpleado).toBe(3);

});

// ======================================================
// PRUEBA 7
// Crear empleado sin campos obligatorios
// ======================================================

test('POST /servidor/empleado - debe rechazar datos incompletos', async () => {

    const empleadoIncompleto = {
        nombre: 'Pedro'
    };

    const respuesta = await request(app)
        .post('/servidor/empleado')
        .send(empleadoIncompleto);

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toContain('Faltan campos requeridos');

});

// ======================================================
// PRUEBA 8
// Empleado duplicado
// ======================================================

test('POST /servidor/empleado - debe devolver 409 si el empleado ya existe', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        const error = {
            code: 'ER_DUP_ENTRY'
        };

        callback(error, null);

    });

    const empleadoDuplicado = {
        nombre: 'Laura',
        apellido: 'Ramirez',
        cargo: 'Recepcionista',
        correo: 'laura@bida.com',
        telefono: '3104567890'
    };

    const respuesta = await request(app)
        .post('/servidor/empleado')
        .send(empleadoDuplicado);

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.mensaje).toBe('El empleado ya existe');

});

// ======================================================
// PRUEBA 9
// Actualizar empleado
// ======================================================

test('PUT /servidor/empleado/1 - debe actualizar a Laura', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const datosActualizados = {
        cargo: 'Administradora',
        telefono: '3009876543'
    };

    const respuesta = await request(app)
        .put('/servidor/empleado/1')
        .send(datosActualizados);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toContain('actualizado exitosamente');

});

// ======================================================
// PRUEBA 10
// Actualizar empleado inexistente
// ======================================================

test('PUT /servidor/empleado/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .put('/servidor/empleado/99')
        .send({
            cargo: 'Administrador'
        });

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});

// ======================================================
// PRUEBA 11
// Eliminar empleado
// ======================================================

test('DELETE /servidor/empleado/2 - debe eliminar empleado', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 1
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/empleado/2');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toContain('eliminado exitosamente');

});

// ======================================================
// PRUEBA 12
// Eliminar empleado inexistente
// ======================================================

test('DELETE /servidor/empleado/99 - debe devolver 404', async () => {

    conexionMock.query.mockImplementation((sql, parametros, callback) => {

        callback(null, {
            affectedRows: 0
        });

    });

    const respuesta = await request(app)
        .delete('/servidor/empleado/99');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.message).toContain('no encontrado');

});