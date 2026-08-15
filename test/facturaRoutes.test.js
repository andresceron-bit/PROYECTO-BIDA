const express = require('express');
const request = require('supertest');
const facturaRoutes = require('../routes/facturaRoutes');

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

app.use('/servidor', facturaRoutes(conexionMock));

// ======================================================
// PRUEBA 1
// Registrar una factura correctamente
// ======================================================

test('POST /servidor/factura - debe registrar una factura correctamente', async () => {

    conexionMock.query
        .mockImplementationOnce((sql, datos, callback) => {

            callback(null, {
                insertId: 1
            });

        })
        .mockImplementationOnce((sql, datos, callback) => {

            callback(null, {
                insertId: 1
            });

        });

    const factura = {
        id_empleado: 1,
        id_paciente: 1,
        metodo_pago: 'Efectivo',
        id_cita: 1,

        tratamiento: [
            {
                id_tratamiento: 1,
                cantidad: 2,
                precioUnitario: 50000,
                observaciones: 'Tratamiento de prueba'
            }
        ]
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(factura);

    expect(respuesta.status).toBe(201);

    expect(respuesta.body.mensaje)
        .toBe('Factura registrada exitosamente');

    expect(respuesta.body.idFactura)
        .toBe(1);

    expect(respuesta.body.total)
        .toBe('100000.00');
});

// ======================================================
// PRUEBA 2
// Faltan datos obligatorios
// ======================================================

test('POST /servidor/factura - debe rechazar datos obligatorios faltantes', async () => {

    const facturaIncompleta = {
        id_paciente: 1,
        metodo_pago: 'Efectivo'
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(facturaIncompleta);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje)
        .toBe('Faltan datos obligatorios de la factura');
});

// ======================================================
// PRUEBA 3
// No se envían tratamientos
// ======================================================

test('POST /servidor/factura - debe rechazar una factura sin tratamientos', async () => {

    const facturaSinTratamientos = {
        id_empleado: 1,
        id_paciente: 1,
        metodo_pago: 'Efectivo',
        id_cita: 1,
        tratamiento: []
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(facturaSinTratamientos);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje)
        .toBe('Debe existir al menos un tratamiento');
});

// ======================================================
// PRUEBA 4
// Tratamiento con datos inválidos
// ======================================================

test('POST /servidor/factura - debe rechazar datos inválidos del tratamiento', async () => {

    const facturaInvalida = {
        id_empleado: 1,
        id_paciente: 1,
        metodo_pago: 'Efectivo',
        id_cita: 1,

        tratamiento: [
            {
                id_tratamiento: 1,
                cantidad: 0,
                precioUnitario: 50000
            }
        ]
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(facturaInvalida);

    expect(respuesta.status).toBe(400);

    expect(respuesta.body.mensaje)
        .toBe('Datos inválidos en el tratamiento');
});

// ======================================================
// PRUEBA 5
// Calcular correctamente el total de varios tratamientos
// ======================================================

test('POST /servidor/factura - debe calcular correctamente el total', async () => {

    conexionMock.query
        .mockImplementationOnce((sql, datos, callback) => {

            callback(null, {
                insertId: 2
            });

        })
        .mockImplementationOnce((sql, datos, callback) => {

            callback(null, {
                insertId: 2
            });

        })
        .mockImplementationOnce((sql, datos, callback) => {

            callback(null, {
                insertId: 3
            });

        });

    const factura = {
        id_empleado: 1,
        id_paciente: 1,
        metodo_pago: 'Tarjeta',
        id_cita: 1,

        tratamiento: [
            {
                id_tratamiento: 1,
                cantidad: 2,
                precioUnitario: 50000
            },
            {
                id_tratamiento: 2,
                cantidad: 1,
                precioUnitario: 75000
            }
        ]
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(factura);

    expect(respuesta.status).toBe(201);

    expect(respuesta.body.total)
        .toBe('175000.00');
});

// ======================================================
// PRUEBA 6
// Error al registrar la factura
// ======================================================

test('POST /servidor/factura - debe devolver 500 si ocurre un error en la BD', async () => {

    conexionMock.query.mockImplementationOnce((sql, datos, callback) => {

        callback({
            message: 'Error de conexión con la base de datos'
        }, null);

    });

    const factura = {
        id_empleado: 1,
        id_paciente: 1,
        metodo_pago: 'Efectivo',
        id_cita: 1,

        tratamiento: [
            {
                id_tratamiento: 1,
                cantidad: 1,
                precioUnitario: 50000
            }
        ]
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(factura);

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toBe('Error al registrar la factura');
});

// ======================================================
// PRUEBA 7
// Error al registrar el detalle
// ======================================================

test('POST /servidor/factura - debe devolver 500 si falla el detalle del tratamiento', async () => {

    conexionMock.query
        .mockImplementationOnce((sql, datos, callback) => {

            callback(null, {
                insertId: 3
            });

        })
        .mockImplementationOnce((sql, datos, callback) => {

            callback({
                message: 'Error al insertar detalle'
            }, null);

        });

    const factura = {
        id_empleado: 1,
        id_paciente: 1,
        metodo_pago: 'Efectivo',
        id_cita: 1,

        tratamiento: [
            {
                id_tratamiento: 1,
                cantidad: 1,
                precioUnitario: 50000
            }
        ]
    };

    const respuesta = await request(app)
        .post('/servidor/factura')
        .send(factura);

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toBe(
            'La factura fue creada, pero ocurrió un error al registrar el detalle del tratamiento'
        );

    expect(respuesta.body.idFactura)
        .toBe(3);
});

// ======================================================
// PRUEBA 8
// Consultar factura por ID
// ======================================================

test('GET /servidor/factura/1 - debe obtener la factura correctamente', async () => {

    conexionMock.query.mockImplementationOnce((sql, parametros, callback) => {

        callback(null, [
            {
                id_factura: 1,
                fecha_emision: '2026-08-15 10:00:00',
                total: '100000.00',
                metodo_pago: 'Efectivo',
                id_cita: 1,
                id_empleado: 1,
                id_paciente: 1,

                documento_identidad: '1061789456',
                nombre_paciente: 'Laura',
                apellido_paciente: 'Ramirez',
                telefono: '3104567890',
                correo: 'laura@bida.com',

                nombre_empleado: 'Carlos',
                apellido_empleado: 'Muñoz',
                cargo: 'Auxiliar Administrativo',

                fecha_cita: '2026-08-15',
                hora_cita: '10:00:00',
                estado_cita: 'Atendida',

                id_odontologo: 1,
                numero_licencia: 'OD12345',
                nombre_odontologo: 'Juan',
                apellido_odontologo: 'Perez',
                especialidad: 'Odontología General',

                id_detalle: 1,
                id_tratamiento: 1,
                costo_aplicado: 50000,
                observaciones: 'Tratamiento realizado',

                nombre_tratamiento: 'Limpieza dental',
                descripcion: 'Limpieza general',
                costo_base: 50000
            }
        ]);

    });

    const respuesta = await request(app)
        .get('/servidor/factura/1');

    expect(respuesta.status).toBe(200);

    expect(respuesta.body.id_factura)
        .toBe(1);

    expect(respuesta.body.total)
        .toBe('100000.00');

    expect(respuesta.body.paciente.nombre)
        .toBe('Laura');

    expect(respuesta.body.empleado.nombre)
        .toBe('Carlos');

    expect(respuesta.body.odontologo.nombre)
        .toBe('Juan');

    expect(respuesta.body.detalles)
        .toHaveLength(1);
});

// ======================================================
// PRUEBA 9
// Factura inexistente
// ======================================================

test('GET /servidor/factura/99 - debe devolver 404 si la factura no existe', async () => {

    conexionMock.query.mockImplementationOnce((sql, parametros, callback) => {

        callback(null, []);

    });

    const respuesta = await request(app)
        .get('/servidor/factura/99');

    expect(respuesta.status).toBe(404);

    expect(respuesta.body.mensaje)
        .toContain('No se encontró la factura');
});

// ======================================================
// PRUEBA 10
// Error al consultar factura
// ======================================================

test('GET /servidor/factura/1 - debe devolver 500 si ocurre un error de BD', async () => {

    conexionMock.query.mockImplementationOnce((sql, parametros, callback) => {

        callback({
            message: 'Error de conexión'
        }, null);

    });

    const respuesta = await request(app)
        .get('/servidor/factura/1');

    expect(respuesta.status).toBe(500);

    expect(respuesta.body.mensaje)
        .toBe('Error al consultar la factura');
});