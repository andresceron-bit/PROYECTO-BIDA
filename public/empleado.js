// ============================================================
// BIDA - MÓDULO DE EMPLEADOS
// empleado.js
// ============================================================

const API_URL =
    window.location.port === '3040'
        ? '/servidor/empleado'
        : 'http://localhost:3040/servidor/empleado';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formEmpleado = document.getElementById('formEmpleado');
const mensaje = document.getElementById('mensaje');

const buscarId = document.getElementById('buscarId');
const btnBuscar = document.getElementById('btnBuscar');
const resultadoBusqueda = document.getElementById('resultadoBusqueda');

const btnCargar = document.getElementById('btnCargar');
const tablaEmpleados = document.getElementById('tablaEmpleados');


// ============================================================
// MOSTRAR MENSAJES
// ============================================================

function mostrarMensaje(texto, tipo = 'normal') {

    mensaje.textContent = texto;

    if (tipo === 'error') {
        mensaje.style.color = '#b71c1c';
        mensaje.style.backgroundColor = '#ffebee';
    } else {
        mensaje.style.color = '#00695c';
        mensaje.style.backgroundColor = '#e0f2f1';
    }
}


// ============================================================
// 1. CONSULTAR TODOS LOS EMPLEADOS
// GET /servidor/empleado
// ============================================================

async function cargarEmpleados() {

    try {

        tablaEmpleados.innerHTML = `
            <tr>
                <td colspan="7">
                    Cargando empleados...
                </td>
            </tr>
        `;

        const respuesta = await fetch(API_URL);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.message || datos.mensaje || 'Error al consultar empleados'
            );
        }

        const empleados = datos.empleados || [];

        if (empleados.length === 0) {

            tablaEmpleados.innerHTML = `
                <tr>
                    <td colspan="7">
                        No hay empleados registrados.
                    </td>
                </tr>
            `;

            return;
        }

        tablaEmpleados.innerHTML = '';

        empleados.forEach(empleado => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${empleado.id_empleado}</td>
                <td>${empleado.nombre}</td>
                <td>${empleado.apellido}</td>
                <td>${empleado.cargo}</td>
                <td>${empleado.correo}</td>
                <td>${empleado.telefono}</td>
                <td></td>
            `;

            // Crear botón Editar
            const botonEditar = document.createElement('button');

            botonEditar.textContent = 'Editar';
            botonEditar.className = 'btn-principal';

            botonEditar.addEventListener('click', () => {

                editarEmpleado(empleado);
            });


            // Crear botón Eliminar
            const botonEliminar = document.createElement('button');

            botonEliminar.textContent = 'Eliminar';
            botonEliminar.className = 'btn-secundario';

            botonEliminar.addEventListener('click', () => {

                eliminarEmpleado(empleado.id_empleado);
            });


            const celdaAcciones = fila.lastElementChild;

            celdaAcciones.appendChild(botonEditar);

            celdaAcciones.appendChild(botonEliminar);

            tablaEmpleados.appendChild(fila);
        });

    } catch (error) {

        console.error('Error al cargar empleados:', error);

        tablaEmpleados.innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los empleados.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// 2. CONSULTAR EMPLEADO POR ID
// GET /servidor/empleado/:id
// ============================================================

async function consultarEmpleado() {

    const id = buscarId.value.trim();

    if (!id) {

        resultadoBusqueda.textContent =
            'Ingrese el ID del empleado.';

        return;
    }

    try {

        resultadoBusqueda.textContent =
            'Consultando empleado...';

        const respuesta = await fetch(`${API_URL}/${id}`);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'Empleado no encontrado'
            );
        }

        const empleado = datos.empleado;

        resultadoBusqueda.innerHTML = `
            <div style="
                background-color:#f4f8fb;
                padding:20px;
                border-radius:8px;
                border-left:4px solid #0b7285;
            ">

                <strong>Empleado encontrado</strong>

                <p><b>ID:</b> ${empleado.id_empleado}</p>

                <p><b>Nombre:</b>
                    ${empleado.nombre}
                    ${empleado.apellido}
                </p>

                <p><b>Cargo:</b>
                    ${empleado.cargo}
                </p>

                <p><b>Correo:</b>
                    ${empleado.correo}
                </p>

                <p><b>Teléfono:</b>
                    ${empleado.telefono}
                </p>

            </div>
        `;

    } catch (error) {

        console.error('Error al consultar empleado:', error);

        resultadoBusqueda.innerHTML = `
            <p style="color:#b71c1c;">
                ${error.message}
            </p>
        `;
    }
}


// ============================================================
// 3. REGISTRAR EMPLEADO
// POST /servidor/empleado
// ============================================================

formEmpleado.addEventListener('submit', async (evento) => {

    evento.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();


    // Validación
    if (!nombre || !apellido || !cargo || !correo || !telefono) {

        mostrarMensaje(
            'Debe completar todos los campos.',
            'error'
        );

        return;
    }


    const empleado = {
        nombre,
        apellido,
        cargo,
        correo,
        telefono
    };


    try {

        const respuesta = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(empleado)
        });


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'Error al registrar empleado'
            );
        }


        mostrarMensaje(
            `Empleado registrado correctamente. ID: ${datos.idEmpleado}`
        );


        formEmpleado.reset();

        cargarEmpleados();


    } catch (error) {

        console.error('Error al registrar empleado:', error);

        mostrarMensaje(
            error.message,
            'error'
        );
    }

});


// ============================================================
// 4. EDITAR EMPLEADO
// PUT /servidor/empleado/:id
// ============================================================

async function editarEmpleado(empleado) {

    const nombre = prompt(
        'Ingrese el nuevo nombre:',
        empleado.nombre
    );

    if (nombre === null) return;


    const apellido = prompt(
        'Ingrese el nuevo apellido:',
        empleado.apellido
    );

    if (apellido === null) return;


    const cargo = prompt(
        'Ingrese el nuevo cargo:',
        empleado.cargo
    );

    if (cargo === null) return;


    const correo = prompt(
        'Ingrese el nuevo correo:',
        empleado.correo
    );

    if (correo === null) return;


    const telefono = prompt(
        'Ingrese el nuevo teléfono:',
        empleado.telefono
    );

    if (telefono === null) return;


    const datosActualizados = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cargo: cargo.trim(),
        correo: correo.trim(),
        telefono: telefono.trim()
    };


    try {

        const respuesta = await fetch(
            `${API_URL}/${empleado.id_empleado}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datosActualizados)
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'Error al actualizar empleado'
            );
        }


        mostrarMensaje(
            `Empleado ${empleado.id_empleado} actualizado correctamente.`
        );


        cargarEmpleados();


    } catch (error) {

        console.error(
            'Error al actualizar empleado:',
            error
        );

        mostrarMensaje(
            error.message,
            'error'
        );
    }
}


// ============================================================
// 5. ELIMINAR EMPLEADO
// DELETE /servidor/empleado/:id
// ============================================================

async function eliminarEmpleado(id) {

    const confirmar = confirm(
        `¿Está seguro de eliminar el empleado con ID ${id}?`
    );

    if (!confirmar) return;


    try {

        const respuesta = await fetch(
            `${API_URL}/${id}`,
            {
                method: 'DELETE'
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'Error al eliminar empleado'
            );
        }


        mostrarMensaje(
            `Empleado ${id} eliminado correctamente.`
        );


        cargarEmpleados();


    } catch (error) {

        console.error(
            'Error al eliminar empleado:',
            error
        );

        mostrarMensaje(
            error.message,
            'error'
        );
    }
}


// ============================================================
// 6. BOTÓN CONSULTAR POR ID
// ============================================================

btnBuscar.addEventListener(
    'click',
    consultarEmpleado
);


// ============================================================
// 7. BOTÓN ACTUALIZAR LISTA
// ============================================================

btnCargar.addEventListener(
    'click',
    cargarEmpleados
);


// ============================================================
// 8. CARGAR EMPLEADOS AL ABRIR LA PÁGINA
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    cargarEmpleados
);