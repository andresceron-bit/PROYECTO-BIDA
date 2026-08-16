// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL =
    window.location.port === '3040'
        ? '/servidor/odontologo'
        : 'http://localhost:3040/servidor/odontologo';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formulario = document.getElementById('formOdontologo');
const tabla = document.getElementById('tablaOdontologos');
const mensaje = document.getElementById('mensaje');


// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensaje(texto, tipo = '') {

    if (!mensaje) return;

    mensaje.textContent = texto;
    mensaje.className = tipo;
}


// ============================================================
// CARGAR TODOS LOS ODONTÓLOGOS
// GET /servidor/odontologo
// ============================================================

async function cargarOdontologos() {

    try {

        const respuesta = await fetch(API_URL);

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.message ||
                datos.mensaje ||
                'No fue posible obtener los odontólogos'
            );
        }

        console.log('Odontólogos recibidos:', datos);

        const odontologos = datos.odontologos || [];

        if (!tabla) return;

        tabla.innerHTML = '';

        if (odontologos.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="8">
                        No hay odontólogos registrados.
                    </td>
                </tr>
            `;

            return;
        }

        odontologos.forEach(odontologo => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${odontologo.id_odontologo}</td>
                <td>${odontologo.numero_licencia}</td>
                <td>${odontologo.nombre}</td>
                <td>${odontologo.apellido}</td>
                <td>${odontologo.especialidad}</td>
                <td>${odontologo.correo}</td>
                <td>${odontologo.telefono}</td>

                <td>
                    <button
                        type="button"
                        onclick="buscarOdontologo(${odontologo.id_odontologo})">
                        Consultar
                    </button>

                    <button
                        type="button"
                        onclick="eliminarOdontologo(${odontologo.id_odontologo})">
                        Eliminar
                    </button>
                </td>
            `;

            tabla.appendChild(fila);
        });

    } catch (error) {

        console.error(
            'Error al cargar odontólogos:',
            error
        );

        mostrarMensaje(
            'No fue posible cargar los odontólogos.',
            'error'
        );
    }
}


// ============================================================
// CONSULTAR ODONTÓLOGO POR ID
// GET /servidor/odontologo/:id
// ============================================================

async function buscarOdontologo(id) {

    try {

        const respuesta = await fetch(`${API_URL}/${id}`);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            mostrarMensaje(
                datos.message ||
                datos.mensaje ||
                'Odontólogo no encontrado',
                'error'
            );

            return;
        }

        console.log(
            'Odontólogo encontrado:',
            datos
        );

        const odontologo = datos.odontologo;

        document.getElementById('numero_licencia').value =
            odontologo.numero_licencia || '';

        document.getElementById('nombre').value =
            odontologo.nombre || '';

        document.getElementById('apellido').value =
            odontologo.apellido || '';

        document.getElementById('especialidad').value =
            odontologo.especialidad || '';

        document.getElementById('correo').value =
            odontologo.correo || '';

        document.getElementById('telefono').value =
            odontologo.telefono || '';

        mostrarMensaje(
            `Odontólogo ${odontologo.nombre} ${odontologo.apellido} encontrado correctamente.`,
            'exito'
        );

    } catch (error) {

        console.error(
            'Error al consultar odontólogo:',
            error
        );

        mostrarMensaje(
            'Error al consultar el odontólogo.',
            'error'
        );
    }
}


// ============================================================
// CONSULTAR DESDE EL CAMPO DE BÚSQUEDA
// ============================================================

const btnBuscar = document.getElementById('btnBuscar');

if (btnBuscar) {

    btnBuscar.addEventListener('click', () => {

        const campo = document.getElementById('idBuscar');

        const id = campo.value.trim();

        if (!id) {

            mostrarMensaje(
                'Ingrese el ID del odontólogo.',
                'error'
            );

            return;
        }

        buscarOdontologo(id);
    });
}


// ============================================================
// CREAR ODONTÓLOGO
// POST /servidor/odontologo
// ============================================================

if (formulario) {

    formulario.addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const datos = {

            numero_licencia:
                document.getElementById('numero_licencia').value.trim(),

            nombre:
                document.getElementById('nombre').value.trim(),

            apellido:
                document.getElementById('apellido').value.trim(),

            especialidad:
                document.getElementById('especialidad').value.trim(),

            correo:
                document.getElementById('correo').value.trim(),

            telefono:
                document.getElementById('telefono').value.trim()
        };


        if (
            !datos.numero_licencia ||
            !datos.nombre ||
            !datos.apellido ||
            !datos.especialidad ||
            !datos.correo ||
            !datos.telefono
        ) {

            mostrarMensaje(
                'Debe completar todos los campos.',
                'error'
            );

            return;
        }


        try {

            const respuesta = await fetch(API_URL, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            });


            const resultado = await respuesta.json();


            if (!respuesta.ok) {

                mostrarMensaje(
                    resultado.message ||
                    resultado.mensaje ||
                    'Error al registrar odontólogo.',
                    'error'
                );

                return;
            }


            mostrarMensaje(
                `Odontólogo registrado correctamente. ID: ${resultado.idOdontologo}`,
                'exito'
            );


            formulario.reset();

            cargarOdontologos();

        } catch (error) {

            console.error(
                'Error al registrar odontólogo:',
                error
            );

            mostrarMensaje(
                'No fue posible comunicarse con el servidor.',
                'error'
            );
        }
    });
}


// ============================================================
// ELIMINAR ODONTÓLOGO
// DELETE /servidor/odontologo/:id
// ============================================================

async function eliminarOdontologo(id) {

    const confirmar = confirm(
        `¿Está seguro de eliminar el odontólogo con ID ${id}?`
    );

    if (!confirmar) {
        return;
    }


    try {

        const respuesta = await fetch(`${API_URL}/${id}`, {

            method: 'DELETE'
        });


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            mostrarMensaje(
                resultado.message ||
                resultado.mensaje ||
                'No fue posible eliminar el odontólogo.',
                'error'
            );

            return;
        }


        mostrarMensaje(
            `Odontólogo con ID ${id} eliminado correctamente.`,
            'exito'
        );


        cargarOdontologos();

    } catch (error) {

        console.error(
            'Error al eliminar odontólogo:',
            error
        );

        mostrarMensaje(
            'Error de comunicación con el servidor.',
            'error'
        );
    }
}


// ============================================================
// BOTÓN ACTUALIZAR LISTA
// ============================================================

const btnCargar = document.getElementById('btnCargar');

if (btnCargar) {

    btnCargar.addEventListener(
        'click',
        cargarOdontologos
    );
}


// ============================================================
// CARGAR ODONTÓLOGOS AL ABRIR LA PÁGINA
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    cargarOdontologos
);