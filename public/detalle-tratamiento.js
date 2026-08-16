// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL =
    window.location.port === '3040'
        ? '/servidor/detalle-tratamiento'
        : 'http://localhost:3040/servidor/detalle-tratamiento';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formDetalle = document.getElementById('formDetalle');
const tablaDetalles = document.getElementById('tablaDetalles');
const mensaje = document.getElementById('mensaje');

const buscarId = document.getElementById('buscarId');
const btnConsultar = document.getElementById('btnConsultar');
const btnActualizar = document.getElementById('btnActualizar');


// ============================================================
// MOSTRAR MENSAJES
// ============================================================

function mostrarMensaje(texto) {

    if (mensaje) {
        mensaje.textContent = texto;
    }

}


// ============================================================
// MÉTODO GET
// MOSTRAR TODOS LOS DETALLES
// ============================================================

async function cargarDetalles() {

    try {

        const respuesta = await fetch(API_URL);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || 'Error al consultar detalles'
            );

        }


        tablaDetalles.innerHTML = '';


        datos.detalles.forEach(detalle => {

            const fila = document.createElement('tr');


            fila.innerHTML = `

                <td>
                    ${detalle.id_detalle}
                </td>

                <td>
                    ${detalle.nombre_tratamiento || 'No disponible'}
                </td>

                <td>
                    ${detalle.id_cita}
                </td>

                <td>
                    ${
                        detalle.nombre_paciente
                        ? detalle.nombre_paciente + ' ' + detalle.apellido_paciente
                        : 'No disponible'
                    }
                </td>

                <td>
                    ${
                        detalle.nombre_odontologo
                        ? detalle.nombre_odontologo + ' ' + detalle.apellido_odontologo
                        : 'No disponible'
                    }
                </td>

                <td>
                    $${detalle.costo_aplicado}
                </td>

                <td>
                    ${detalle.observaciones || 'Sin observaciones'}
                </td>

                <td>

                    <button
                        class="boton principal"
                        onclick="consultarDetalle(${detalle.id_detalle})">
                        Ver
                    </button>

                    <button
                        class="boton secundario"
                        onclick="eliminarDetalle(${detalle.id_detalle})">
                        Eliminar
                    </button>

                </td>

            `;


            tablaDetalles.appendChild(fila);

        });


        mostrarMensaje(
            `Se encontraron ${datos.total} detalles de tratamiento.`
        );


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            'Error al cargar los detalles: ' + error.message
        );

    }

}


// ============================================================
// MÉTODO GET
// CONSULTAR UN DETALLE POR ID
// ============================================================

async function consultarDetalle(id) {

    try {

        const respuesta = await fetch(`${API_URL}/${id}`);

        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || 'Detalle no encontrado'
            );

        }


        console.log('Detalle consultado:', datos);


        mostrarMensaje(
            `Detalle ${datos.id_detalle} encontrado. ` +
            `Tratamiento: ${datos.tratamiento.nombre_tratamiento}. ` +
            `Cita: ${datos.cita.id_cita}. ` +
            `Paciente: ${datos.paciente.nombre} ${datos.paciente.apellido}. ` +
            `Odontólogo: ${datos.odontologo.nombre} ${datos.odontologo.apellido}.`
        );


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            'Error al consultar: ' + error.message
        );

    }

}


// ============================================================
// EVENTO CONSULTAR POR ID
// ============================================================

if (btnConsultar) {

    btnConsultar.addEventListener('click', () => {

        const id = buscarId.value.trim();


        if (!id) {

            mostrarMensaje(
                'Ingrese el ID del detalle que desea consultar.'
            );

            return;
        }


        consultarDetalle(id);

    });

}


// ============================================================
// MÉTODO POST
// CREAR DETALLE
// ============================================================

if (formDetalle) {

    formDetalle.addEventListener('submit', async (evento) => {

        evento.preventDefault();


        const datos = {

            id_tratamiento:
                Number(
                    document.getElementById('id_tratamiento').value
                ),

            id_cita:
                Number(
                    document.getElementById('id_cita').value
                ),

            costo_aplicado:
                Number(
                    document.getElementById('costo_aplicado').value
                ),

            observaciones:
                document.getElementById('observaciones').value.trim()

        };


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

                throw new Error(
                    resultado.mensaje ||
                    'Error al registrar detalle'
                );

            }


            mostrarMensaje(
                `Detalle registrado correctamente. ID: ${resultado.id_detalle}`
            );


            formDetalle.reset();


            cargarDetalles();


        } catch (error) {

            console.error(error);

            mostrarMensaje(
                'Error al registrar: ' + error.message
            );

        }

    });

}


// ============================================================
// MÉTODO DELETE
// ELIMINAR DETALLE
// ============================================================

async function eliminarDetalle(id) {

    const confirmar = confirm(
        `¿Está seguro de eliminar el detalle ${id}?`
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

            throw new Error(
                resultado.mensaje ||
                'Error al eliminar detalle'
            );

        }


        mostrarMensaje(
            resultado.mensaje
        );


        cargarDetalles();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            'Error al eliminar: ' + error.message
        );

    }

}


// ============================================================
// BOTÓN ACTUALIZAR LISTA
// ============================================================

if (btnActualizar) {

    btnActualizar.addEventListener(
        'click',
        cargarDetalles
    );

}


// ============================================================
// CARGAR INFORMACIÓN AL ABRIR LA PÁGINA
// ============================================================

cargarDetalles();