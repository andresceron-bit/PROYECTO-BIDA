const express = require ('express');
const mysql = require ('mysql2');
const cors = require ('cors');
const pacienteRoutes = require('./routes/pacienteRoutes');
const odontologoRoutes = require('./routes/odontologoRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const tratamientoRoutes = require('./routes/tratamientoRoutes');
const localRoutes = require('./routes/localRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const detalleTratamientoRoutes = require('./routes/detalle_tratamientoRoutes');
const consultorioRoutes = require('./routes/consultorioRoutes');
const citaRoutes = require('./routes/citaRoutes');

var servidor = express ();
servidor.use(express.static('public'));
servidor.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

servidor.use((req, res, next) => {
    const metodosConBody = ['POST', 'PUT', 'PATCH'];
    if (!metodosConBody.includes(req.method.toUpperCase())) {
        return next();
    }

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (!contentType) {
        req.body = {};
        return next();
    }

    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            if (contentType.includes('application/x-www-form-urlencoded')) {
                req.body = Object.fromEntries(new URLSearchParams(body));
            } else if (contentType.includes('application/json') || contentType.includes('text/plain')) {
                const texto = body.trim();
                if (!texto) {
                    req.body = {};
                } else {
                    const sinComillas = texto.startsWith('"') && texto.endsWith('"') ? texto.slice(1, -1) : texto;
                    req.body = JSON.parse(sinComillas);
                }
            } else {
                req.body = {};
            }
            next();
        } catch (error) {
            req.body = {};
            next();
        }
    });
});

//Asignamos el puerto 3040 a una variable
var puerto = 3040;

//probamos la conexion con servidor local
servidor.listen (puerto,function() {
    console.log('conexion con servidor ok en puerto'+
        puerto);
    });

//crear la primera ruta de acceso con el metodo get
 servidor.get('/servidor',function (req,res) {
    res.send('servidor funcionando');
 });

 //definimos los parametros de conexion con la BD
var conexion = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'',
    database:'bida',
    port:3309,
    timezone: '+00:00'
 });

//probamos la conexion 
conexion.connect(function(error) {
    if (error) {
        console.log('ERROR DE CONEXION:', error.code);
        console.log('Detalles:', error.message);
    } else {
        console.log('conexion exitosa con la BD')
    }
});

// conexion de rutas modularizadas
servidor.use('/servidor', pacienteRoutes(conexion));
servidor.use('/servidor', odontologoRoutes(conexion));
servidor.use('/servidor', empleadoRoutes(conexion));
servidor.use('/servidor', facturaRoutes(conexion));
servidor.use('/servidor', tratamientoRoutes(conexion));
servidor.use('/servidor', localRoutes(conexion));
servidor.use('/servidor', equipoRoutes(conexion));
servidor.use('/servidor', detalleTratamientoRoutes(conexion));
servidor.use('/servidor', consultorioRoutes(conexion));
servidor.use('/servidor', citaRoutes(conexion));