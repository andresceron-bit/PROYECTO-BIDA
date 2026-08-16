// ============================================================
// JAVASCRIPT - MÓDULO PACIENTE
// BIDA Odontología Especializada
// ============================================================


// URL BASE DEL SERVIDOR
const URL_BASE =
    window.location.port === '3040'
        ? '/servidor'
        : 'http://localhost:3040/servidor';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formulario = document.getElementById('formPaciente');
const mensaje = document.getElementById('mensaje');
const tablaPacientes = document.getElementById('tablaPacientes');

const buscarId = document.getElementById('buscarId');

const botonConsultar = document.querySelector('.consultar');
const botonActualizar = document.querySelector('.actualizar');


// ============================================================
// MOSTRAR MENSAJES
// ============================================================

function mostrarMensaje(texto, tipo = 'normal') {

    mensaje.textContent = texto;

    if (tipo === 'exito') {
        mensaje.style.backgroundColor = '#d3f9d8';
        mensaje.style.color = '#2b8a3e';
    }

    else if (tipo === 'error') {
        mensaje.style.backgroundColor = '#ffe3e3';
        mensaje.style.color = '#c92a2a';
    }

    else {
        mensaje.style.backgroundColor = '#f1f3f5';
        mensaje.style.color = '#37474f';
    }
}


// ============================================================
// CARGAR TODOS LOS PACIENTES
// GET /servidor/paciente
// ============================================================

async function cargarPacientes() {

    try {

        tablaPacientes.innerHTML = `
            <tr>
                <td colspan="10">
                    Cargando pacientes...
                </td>
            </tr>
        `;

        const respuesta = await fetch(`${URL_BASE}/paciente`);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            if (respuesta.status === 404) {

                tablaPacientes.innerHTML = `
                    <tr>
                        <td colspan="10">
                            No se encontraron pacientes registrados.
                        </td>
                    </tr>
                `;

                return;
            }

            throw new Error(
                datos.message || datos.mensaje || 'Error al consultar pacientes'
            );
        }


        // El módulo paciente devuelve directamente un arreglo
        const pacientes = Array.isArray(datos)
            ? datos
            : datos.pacientes || [];


        if (pacientes.length === 0) {

            tablaPacientes.innerHTML = `
                <tr>
                    <td colspan="10">
                        No hay pacientes registrados.
                    </td>
                </tr>
            `;

            return;
        }


        // Limpiar tabla
        tablaPacientes.innerHTML = '';


        // Crear filas
        pacientes.forEach(paciente => {

            const fila = document.createElement('tr');

            fila.innerHTML = `

                <td>${paciente.id_paciente ?? ''}</td>

                <td>${paciente.documento_identidad ?? ''}</td>

                <td>${paciente.nombre ?? ''}</td>

                <td>${paciente.apellido ?? ''}</td>

                <td>${paciente.fecha_nacimiento ?? ''}</td>

                <td>${paciente.genero ?? ''}</td>

                <td>${paciente.direccion ?? ''}</td>

                <td>${paciente.telefono ?? ''}</td>

                <td>${paciente.correo ?? ''}</td>

               <td>

    <button
        type="button"
        class="btn consultar-fila"
        data-id="${paciente.id_paciente}">
        Consultar
    </button>

    <button
        type="button"
        class="btn eliminar-fila"
        data-id="${paciente.id_paciente}">
        Eliminar
    </button>

</td>
            `;

            tablaPacientes.appendChild(fila);

        });


        // Activar botones de consultar de cada fila

        document.querySelectorAll('.consultar-fila')
            .forEach(boton => {

                boton.addEventListener('click', () => {

                    const id = boton.dataset.id;

                    buscarId.value = id;

                    consultarPaciente(id);

                });

            });


        // Activar botones de eliminar de cada fila

        document.querySelectorAll('.eliminar-fila')
            .forEach(boton => {

                boton.addEventListener('click', () => {

                    const id = boton.dataset.id;

                    eliminarPaciente(id);

                });

            });


    } catch (error) {

        console.error('Error al cargar pacientes:', error);

        tablaPacientes.innerHTML = `
            <tr>
                <td colspan="10">
                    Error al cargar los pacientes.
                </td>
            </tr>
        `;

        mostrarMensaje(
            'No fue posible cargar los pacientes.',
            'error'
        );
    }
}


// ============================================================
// CONSULTAR PACIENTE POR ID
// GET /servidor/paciente/:id_paciente
// ============================================================

async function consultarPaciente(id) {

    if (!id) {

        mostrarMensaje(
            'Ingrese el ID del paciente.',
            'error'
        );

        return;
    }


    try {

        mostrarMensaje(
            'Consultando paciente...',
            'normal'
        );


        const respuesta = await fetch(
            `${URL_BASE}/paciente/${id}`
        );


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                typeof datos === 'string'
                    ? datos
                    : datos.message || 'Paciente no encontrado'
            );
        }


        // Cargar los datos encontrados en el formulario

        document.getElementById('id_paciente').value =
            datos.id_paciente ?? '';

        document.getElementById('documento_identidad').value =
            datos.documento_identidad ?? '';

        document.getElementById('nombre').value =
            datos.nombre ?? '';

        document.getElementById('apellido').value =
            datos.apellido ?? '';

        document.getElementById('fecha_nacimiento').value =
            datos.fecha_nacimiento
                ? String(datos.fecha_nacimiento).substring(0, 10)
                : '';

        document.getElementById('genero').value =
            datos.genero ?? '';

        document.getElementById('direccion').value =
            datos.direccion ?? '';

        document.getElementById('telefono').value =
            datos.telefono ?? '';

        document.getElementById('correo').value =
            datos.correo ?? '';


        mostrarMensaje(
            `Paciente con ID ${id} encontrado correctamente.`,
            'exito'
        );


    } catch (error) {

        console.error(
            'Error al consultar paciente:',
            error
        );

        mostrarMensaje(
            error.message || 'Paciente no encontrado.',
            'error'
        );
    }
}

// ============================================================
// ELIMINAR PACIENTE
// DELETE /servidor/paciente/:id_paciente
// ============================================================

async function eliminarPaciente(id) {

    const confirmar = confirm(
        `¿Está seguro de eliminar al paciente con ID ${id}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        mostrarMensaje(
            'Eliminando paciente...',
            'normal'
        );

        const respuesta = await fetch(
            `${URL_BASE}/paciente/${id}`,
            {
                method: 'DELETE'
            }
        );

        let datos = {};

        if (respuesta.status !== 204) {
            datos = await respuesta.json();
        }

        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'No fue posible eliminar el paciente.'
            );
        }

        mostrarMensaje(
            `Paciente con ID ${id} eliminado correctamente.`,
            'exito'
        );

        cargarPacientes();

    } catch (error) {

        console.error(
            'Error al eliminar paciente:',
            error
        );

        mostrarMensaje(
            error.message ||
            'No fue posible eliminar el paciente.',
            'error'
        );
    }
}

// ============================================================
// GUARDAR PACIENTE
// POST /servidor/crear-tabla-paciente
// ============================================================

formulario.addEventListener('submit', async function (evento) {

    evento.preventDefault();


    const datosPaciente = {

        documento_identidad:
            document.getElementById('documento_identidad').value,

        nombre:
            document.getElementById('nombre').value,

        apellido:
            document.getElementById('apellido').value,

        fecha_nacimiento:
            document.getElementById('fecha_nacimiento').value,

        genero:
            document.getElementById('genero').value,

        direccion:
            document.getElementById('direccion').value,

        telefono:
            document.getElementById('telefono').value,

        correo:
            document.getElementById('correo').value
    };


    // Validación básica

    if (
        !datosPaciente.documento_identidad ||
        !datosPaciente.nombre ||
        !datosPaciente.apellido ||
        !datosPaciente.fecha_nacimiento ||
        !datosPaciente.genero ||
        !datosPaciente.direccion ||
        !datosPaciente.telefono ||
        !datosPaciente.correo
    ) {

        mostrarMensaje(
            'Complete todos los campos del paciente.',
            'error'
        );

        return;
    }


    try {

        mostrarMensaje(
            'Guardando paciente...',
            'normal'
        );


        const respuesta = await fetch(
            `${URL_BASE}/crear-tabla-paciente`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datosPaciente)
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'Error al guardar el paciente'
            );
        }


        mostrarMensaje(
            datos.message ||
            'Paciente creado exitosamente.',
            'exito'
        );


        // Limpiar formulario

        formulario.reset();


        // Actualizar tabla

        cargarPacientes();


    } catch (error) {

        console.error(
            'Error al guardar paciente:',
            error
        );

        mostrarMensaje(
            error.message ||
            'No fue posible guardar el paciente.',
            'error'
        );
    }

});


// ============================================================
// CONSULTAR CON EL BOTÓN
// ============================================================

botonConsultar.addEventListener('click', function () {

    const id = buscarId.value.trim();

    consultarPaciente(id);

});


// ============================================================
// ACTUALIZAR LISTA
// ============================================================

botonActualizar.addEventListener('click', function () {

    cargarPacientes();

    mostrarMensaje(
        'Lista de pacientes actualizada.',
        'exito'
    );

});


// ============================================================
// INICIO DEL MÓDULO
// ============================================================

// Cargar automáticamente los pacientes
// cuando se abre paciente.html.

cargarPacientes();