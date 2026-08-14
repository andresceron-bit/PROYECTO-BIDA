// ============================================================
// BIDA - MÓDULO DE CITAS
// ============================================================

// Ruta principal de la API
const API_CITA = '/servidor/cita';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formCita = document.getElementById('formCita');
const tablaCitas = document.getElementById('tablaCitas');
const mensaje = document.getElementById('mensaje');

const buscarId = document.getElementById('buscarId');
const btnConsultar = document.getElementById('btnConsultar');
const btnActualizar = document.getElementById('btnActualizar');


// ============================================================
// MOSTRAR MENSAJES
// ============================================================

function mostrarMensaje(texto, tipo = 'normal') {

    mensaje.textContent = texto;

    if (tipo === 'exito') {

        mensaje.style.backgroundColor = '#d8f3dc';
        mensaje.style.color = '#1b5e20';

    } else if (tipo === 'error') {

        mensaje.style.backgroundColor = '#ffebee';
        mensaje.style.color = '#b71c1c';

    } else {

        mensaje.style.backgroundColor = '#eef6f8';
        mensaje.style.color = '#455a64';
    }
}


// ============================================================
// MÉTODO GET - MOSTRAR TODAS LAS CITAS
// GET /servidor/cita
// ============================================================

async function cargarCitas() {

    try {

        const respuesta = await fetch(API_CITA);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || 'Error al consultar las citas'
            );
        }

        tablaCitas.innerHTML = '';

        datos.citas.forEach(cita => {

            const fila = document.createElement('tr');

            fila.innerHTML = `

                <td>${cita.id_cita}</td>

                <td>${cita.fecha}</td>

                <td>${cita.hora}</td>

                <td>${cita.estado}</td>

                <td>${cita.id_paciente}</td>

                <td>${cita.id_odontologo}</td>

               <td>

    <button
        type="button"
        class="boton principal"
        onclick="consultarCita(${cita.id_cita})"
    >
        Ver
    </button>

    <button
        type="button"
        class="boton principal"
        onclick="actualizarCita(${cita.id_cita})"
    >
        Actualizar
    </button>

    <button
        type="button"
        class="boton secundario"
        onclick="eliminarCita(${cita.id_cita})"
    >
        Eliminar
    </button>

</td>
            `;

            tablaCitas.appendChild(fila);
        });

        mostrarMensaje(
            `Se cargaron ${datos.total} cita(s) correctamente.`,
            'exito'
        );

    } catch (error) {

        console.error('Error al cargar citas:', error);

        tablaCitas.innerHTML = `
            <tr>
                <td colspan="7">
                    No fue posible cargar las citas.
                </td>
            </tr>
        `;

        mostrarMensaje(
            error.message,
            'error'
        );
    }
}


// ============================================================
// MÉTODO GET - CONSULTAR UNA CITA POR ID
// GET /servidor/cita/:id
// ============================================================

async function consultarCita(id) {

    try {

        const respuesta = await fetch(
            `${API_CITA}/${id}`
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || 'No se encontró la cita'
            );
        }

        const cita = datos.cita || datos;

        mostrarMensaje(

            `Cita encontrada: ID ${cita.id_cita} | ` +
            `Fecha: ${cita.fecha} | ` +
            `Hora: ${cita.hora} | ` +
            `Estado: ${cita.estado} | ` +
            `Paciente: ${cita.id_paciente} | ` +
            `Odontólogo: ${cita.id_odontologo}`,

            'exito'
        );

    } catch (error) {

        console.error('Error al consultar cita:', error);

        mostrarMensaje(
            error.message,
            'error'
        );
    }
}


// ============================================================
// BOTÓN CONSULTAR POR ID
// ============================================================

btnConsultar.addEventListener('click', () => {

    const id = buscarId.value.trim();

    if (!id) {

        mostrarMensaje(
            'Ingrese el ID de la cita que desea consultar.',
            'error'
        );

        return;
    }

    consultarCita(id);
});


// ============================================================
// MÉTODO POST - REGISTRAR CITA
// POST /servidor/cita
// ============================================================

formCita.addEventListener('submit', async (evento) => {

    evento.preventDefault();

    const fecha =
        document.getElementById('fecha').value;

    const hora =
        document.getElementById('hora').value;

    const estado =
        document.getElementById('estado').value;

    const idPaciente =
        document.getElementById('id_paciente').value;

    const idOdontologo =
        document.getElementById('id_odontologo').value;


    // --------------------------------------------------------
    // VALIDACIÓN
    // --------------------------------------------------------

    if (
        !fecha ||
        !hora ||
        !estado ||
        !idPaciente ||
        !idOdontologo
    ) {

        mostrarMensaje(
            'Todos los campos son obligatorios.',
            'error'
        );

        return;
    }


    const datosCita = {

        fecha: fecha,

        hora: hora,

        estado: estado,

        id_paciente: Number(idPaciente),

        id_odontologo: Number(idOdontologo)
    };


    try {

        const respuesta = await fetch(API_CITA, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(datosCita)
        });


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'Error al registrar la cita'
            );
        }


        mostrarMensaje(

            datos.mensaje ||
            `Cita registrada correctamente. ID: ${datos.id_cita}`,

            'exito'
        );


        formCita.reset();


        // Actualizar automáticamente la tabla
        cargarCitas();


    } catch (error) {

        console.error('Error al registrar cita:', error);

        mostrarMensaje(
            error.message,
            'error'
        );
    }
});


// ============================================================
// MÉTODO PUT - ACTUALIZAR CITA
// PUT /servidor/cita/:id
// ============================================================

async function actualizarCita(id) {

    const fecha = prompt(
        'Ingrese la nueva fecha (AAAA-MM-DD):'
    );

    if (fecha === null) {
        return;
    }


    const hora = prompt(
        'Ingrese la nueva hora (HH:MM:SS):'
    );

    if (hora === null) {
        return;
    }


    const estado = prompt(
        'Ingrese el nuevo estado:'
    );

    if (estado === null) {
        return;
    }


    const idPaciente = prompt(
        'Ingrese el ID del paciente:'
    );

    if (idPaciente === null) {
        return;
    }


    const idOdontologo = prompt(
        'Ingrese el ID del odontólogo:'
    );

    if (idOdontologo === null) {
        return;
    }


    const datos = {

        fecha: fecha,

        hora: hora,

        estado: estado,

        id_paciente: Number(idPaciente),

        id_odontologo: Number(idOdontologo)
    };


    try {

        const respuesta = await fetch(
            `${API_CITA}/${id}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            }
        );


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                'Error al actualizar la cita'
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            `Cita ${id} actualizada correctamente.`,
            'exito'
        );


        cargarCitas();


    } catch (error) {

        console.error(
            'Error al actualizar cita:',
            error
        );

        mostrarMensaje(
            error.message,
            'error'
        );
    }
}


// ============================================================
// MÉTODO DELETE - ELIMINAR CITA
// DELETE /servidor/cita/:id
// ============================================================

async function eliminarCita(id) {

    const confirmar = confirm(
        `¿Está seguro de eliminar la cita ${id}?`
    );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta = await fetch(
            `${API_CITA}/${id}`,
            {
                method: 'DELETE'
            }
        );


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                'Error al eliminar la cita'
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            `Cita ${id} eliminada correctamente.`,
            'exito'
        );


        cargarCitas();


    } catch (error) {

        console.error(
            'Error al eliminar cita:',
            error
        );

        mostrarMensaje(
            error.message,
            'error'
        );
    }
}


// ============================================================
// CARGAR CITAS AL ABRIR LA PÁGINA
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarCitas();

    }
);


// ============================================================
// BOTÓN ACTUALIZAR LISTA
// ============================================================

btnActualizar.addEventListener(
    'click',
    () => {

        cargarCitas();

    }
);