// ============================================================
// JAVASCRIPT - MÓDULO TRATAMIENTO
// BIDA Odontología Especializada
// ============================================================


// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL =
    window.location.port === '3040'
        ? '/servidor/tratamiento'
        : 'http://localhost:3040/servidor/tratamiento';


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const tablaTratamientos =
    document.getElementById('tablaTratamientos');

const idTratamiento =
    document.getElementById('idTratamiento');

const nombreTratamiento =
    document.getElementById('nombreTratamiento');

const descripcion =
    document.getElementById('descripcion');

const costoBase =
    document.getElementById('costoBase');

const idActualizar =
    document.getElementById('idActualizar');

const nombreActualizar =
    document.getElementById('nombreActualizar');

const descripcionActualizar =
    document.getElementById('descripcionActualizar');

const costoActualizar =
    document.getElementById('costoActualizar');

const idEliminar =
    document.getElementById('idEliminar');

const btnConsultar =
    document.getElementById('btnConsultar');

const btnRegistrar =
    document.getElementById('btnRegistrar');

const btnActualizar =
    document.getElementById('btnActualizar');

const btnEliminar =
    document.getElementById('btnEliminar');


// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensaje(texto, tipo = 'normal') {

    let mensaje = document.getElementById('mensajeTratamiento');

    if (!mensaje) {

        mensaje = document.createElement('p');

        mensaje.id = 'mensajeTratamiento';

        mensaje.style.marginTop = '20px';
        mensaje.style.padding = '12px';
        mensaje.style.borderRadius = '7px';
        mensaje.style.fontWeight = 'bold';

        document.querySelector('main').prepend(mensaje);
    }


    mensaje.textContent = texto;


    if (tipo === 'exito') {

        mensaje.style.backgroundColor = '#d3f9d8';
        mensaje.style.color = '#2b8a3e';

    } else if (tipo === 'error') {

        mensaje.style.backgroundColor = '#ffe3e3';
        mensaje.style.color = '#c92a2a';

    } else {

        mensaje.style.backgroundColor = '#f1f3f5';
        mensaje.style.color = '#37474f';
    }
}


// ============================================================
// CARGAR TODOS LOS TRATAMIENTOS
// GET /servidor/tratamiento
// ============================================================

async function cargarTratamientos() {

    try {

        tablaTratamientos.innerHTML = `
            <tr>
                <td colspan="4">
                    Cargando tratamientos...
                </td>
            </tr>
        `;


        const respuesta = await fetch(API_URL);


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'No fue posible obtener los tratamientos'
            );
        }


        const tratamientos =
            datos.tratamientos || [];


        if (tratamientos.length === 0) {

            tablaTratamientos.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay tratamientos registrados.
                    </td>
                </tr>
            `;

            return;
        }


        tablaTratamientos.innerHTML = '';


        tratamientos.forEach(tratamiento => {

            const fila =
                document.createElement('tr');


            fila.innerHTML = `

                <td>
                    ${tratamiento.id_tratamiento ?? ''}
                </td>

                <td>
                    ${tratamiento.nombre_tratamiento ?? ''}
                </td>

                <td>
                    ${tratamiento.descripcion ?? ''}
                </td>

                <td>
                    $ ${Number(
                        tratamiento.costo_base
                    ).toLocaleString('es-CO')}
                </td>

            `;


            tablaTratamientos.appendChild(fila);

        });


        console.log(
            'Tratamientos cargados:',
            tratamientos
        );


    } catch (error) {

        console.error(
            'Error al cargar tratamientos:',
            error
        );


        tablaTratamientos.innerHTML = `
            <tr>
                <td colspan="4">
                    Error al cargar los tratamientos.
                </td>
            </tr>
        `;


        mostrarMensaje(
            error.message ||
            'No fue posible cargar los tratamientos.',
            'error'
        );
    }
}


// ============================================================
// CONSULTAR TRATAMIENTO POR ID
// GET /servidor/tratamiento/:id
// ============================================================

async function consultarTratamiento() {

    const id = idTratamiento.value.trim();


    if (!id) {

        mostrarMensaje(
            'Ingrese el ID del tratamiento.',
            'error'
        );

        return;
    }


    try {

        mostrarMensaje(
            'Consultando tratamiento...',
            'normal'
        );


        const respuesta =
            await fetch(`${API_URL}/${id}`);


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                datos.mensaje ||
                'Tratamiento no encontrado'
            );
        }


        const tratamiento =
            datos.tratamiento;


        // Mostrar información también
        // en el formulario de actualización

        idActualizar.value =
            tratamiento.id_tratamiento ?? '';

        nombreActualizar.value =
            tratamiento.nombre_tratamiento ?? '';

        descripcionActualizar.value =
            tratamiento.descripcion ?? '';

        costoActualizar.value =
            tratamiento.costo_base ?? '';


        mostrarMensaje(
            `Tratamiento con ID ${id} encontrado correctamente.`,
            'exito'
        );


        console.log(
            'Tratamiento encontrado:',
            tratamiento
        );


    } catch (error) {

        console.error(
            'Error al consultar tratamiento:',
            error
        );


        mostrarMensaje(
            error.message ||
            'No fue posible consultar el tratamiento.',
            'error'
        );
    }
}


// ============================================================
// REGISTRAR TRATAMIENTO
// POST /servidor/tratamiento
// ============================================================

async function registrarTratamiento() {

    const nombre =
        nombreTratamiento.value.trim();

    const descripcionValor =
        descripcion.value.trim();

    const costo =
        costoBase.value.trim();


    if (
        !nombre ||
        !descripcionValor ||
        !costo
    ) {

        mostrarMensaje(
            'Complete todos los campos del tratamiento.',
            'error'
        );

        return;
    }


    if (Number(costo) < 0) {

        mostrarMensaje(
            'El costo no puede ser negativo.',
            'error'
        );

        return;
    }


    const datos = {

        nombre_tratamiento: nombre,

        descripcion: descripcionValor,

        costo_base: Number(costo)
    };


    try {

        mostrarMensaje(
            'Registrando tratamiento...',
            'normal'
        );


        const respuesta =
            await fetch(API_URL, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            });


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                resultado.mensaje ||
                'No fue posible registrar el tratamiento.'
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            'Tratamiento registrado exitosamente.',
            'exito'
        );


        nombreTratamiento.value = '';
        descripcion.value = '';
        costoBase.value = '';


        cargarTratamientos();


    } catch (error) {

        console.error(
            'Error al registrar tratamiento:',
            error
        );


        mostrarMensaje(
            error.message ||
            'Error al registrar tratamiento.',
            'error'
        );
    }
}


// ============================================================
// ACTUALIZAR TRATAMIENTO
// PUT /servidor/tratamiento/:id
// ============================================================

async function actualizarTratamiento() {

    const id =
        idActualizar.value.trim();

    const nombre =
        nombreActualizar.value.trim();

    const descripcionValor =
        descripcionActualizar.value.trim();

    const costo =
        costoActualizar.value.trim();


    if (!id) {

        mostrarMensaje(
            'Ingrese el ID del tratamiento que desea actualizar.',
            'error'
        );

        return;
    }


    if (
        !nombre &&
        !descripcionValor &&
        !costo
    ) {

        mostrarMensaje(
            'Ingrese al menos un dato para actualizar.',
            'error'
        );

        return;
    }


    if (costo !== '' && Number(costo) < 0) {

        mostrarMensaje(
            'El costo no puede ser negativo.',
            'error'
        );

        return;
    }


    const datos = {};


    if (nombre) {
        datos.nombre_tratamiento = nombre;
    }


    if (descripcionValor) {
        datos.descripcion = descripcionValor;
    }


    if (costo !== '') {
        datos.costo_base = Number(costo);
    }


    try {

        mostrarMensaje(
            'Actualizando tratamiento...',
            'normal'
        );


        const respuesta =
            await fetch(`${API_URL}/${id}`, {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            });


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                resultado.mensaje ||
                'No fue posible actualizar el tratamiento.'
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            'Tratamiento actualizado correctamente.',
            'exito'
        );


        cargarTratamientos();


    } catch (error) {

        console.error(
            'Error al actualizar tratamiento:',
            error
        );


        mostrarMensaje(
            error.message ||
            'Error al actualizar tratamiento.',
            'error'
        );
    }
}


// ============================================================
// ELIMINAR TRATAMIENTO
// DELETE /servidor/tratamiento/:id
// ============================================================

async function eliminarTratamiento() {

    const id =
        idEliminar.value.trim();


    if (!id) {

        mostrarMensaje(
            'Ingrese el ID del tratamiento que desea eliminar.',
            'error'
        );

        return;
    }


    const confirmar =
        confirm(
            `¿Está seguro de eliminar el tratamiento con ID ${id}?`
        );


    if (!confirmar) {

        return;
    }


    try {

        mostrarMensaje(
            'Eliminando tratamiento...',
            'normal'
        );


        const respuesta =
            await fetch(`${API_URL}/${id}`, {

                method: 'DELETE'
            });


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                resultado.mensaje ||
                'No fue posible eliminar el tratamiento.'
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            'Tratamiento eliminado correctamente.',
            'exito'
        );


        idEliminar.value = '';


        cargarTratamientos();


    } catch (error) {

        console.error(
            'Error al eliminar tratamiento:',
            error
        );


        mostrarMensaje(
            error.message ||
            'Error al eliminar tratamiento.',
            'error'
        );
    }
}


// ============================================================
// EVENTOS DE LOS BOTONES
// ============================================================

btnConsultar.addEventListener(
    'click',
    consultarTratamiento
);


btnRegistrar.addEventListener(
    'click',
    registrarTratamiento
);


btnActualizar.addEventListener(
    'click',
    actualizarTratamiento
);


btnEliminar.addEventListener(
    'click',
    eliminarTratamiento
);


// ============================================================
// CARGAR TRATAMIENTOS AL ABRIR LA PÁGINA
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarTratamientos();

    }
);