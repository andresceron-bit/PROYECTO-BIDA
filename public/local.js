// ============================================================
// JAVASCRIPT - MÓDULO LOCAL
// BIDA Odontología Especializada
// ============================================================


// ============================================================
// URL BASE DEL SERVIDOR
// ============================================================

// URL BASE DEL SERVIDOR
const URL_BASE =
    window.location.port === '3040'
        ? '/servidor'
        : 'http://localhost:3040/servidor';

const URL_API = `${URL_BASE}/local`;


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formulario = document.getElementById('formLocal');

const formActualizar =
    document.getElementById('formActualizar');

const mensaje =
    document.getElementById('mensaje');

const tablaLocales =
    document.getElementById('tablaLocales');

const buscarId =
    document.getElementById('buscarId');

const botonConsultar =
    document.getElementById('botonConsultar');

const botonEliminar =
    document.getElementById('botonEliminar');

const botonActualizarLista =
    document.getElementById('botonActualizarLista');


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
// CARGAR TODOS LOS LOCALES
// GET /servidor/local
// ============================================================

async function cargarLocales() {

    try {

        tablaLocales.innerHTML = `
            <tr>
                <td colspan="5">
                    Cargando locales...
                </td>
            </tr>
        `;


        const respuesta =
            await fetch(`${URL_BASE}/local`);


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                'Error al consultar los locales'
            );

        }


        const locales =
            Array.isArray(datos)
                ? datos
                : datos.locales || [];


        if (locales.length === 0) {

            tablaLocales.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay locales registrados.
                    </td>
                </tr>
            `;

            return;
        }


        tablaLocales.innerHTML = '';


        locales.forEach(local => {

            const fila =
                document.createElement('tr');


            fila.innerHTML = `

                <td>
                    ${local.id_local ?? ''}
                </td>

                <td>
                    ${local.calle ?? ''}
                </td>

                <td>
                    ${local.numero ?? ''}
                </td>

                <td>
                    ${local.ciudad ?? ''}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn consultar-fila"
                        data-id="${local.id_local}">

                        Consultar

                    </button>

                    <button
                        type="button"
                        class="btn eliminar-fila"
                        data-id="${local.id_local}">

                        Eliminar

                    </button>

                </td>

            `;


            tablaLocales.appendChild(fila);

        });


        // ====================================================
        // BOTONES CONSULTAR DE LA TABLA
        // ====================================================

        document
            .querySelectorAll('.consultar-fila')
            .forEach(boton => {

                boton.addEventListener(
                    'click',
                    function () {

                        const id =
                            this.dataset.id;

                        buscarId.value = id;

                        consultarLocal(id);

                    }
                );

            });


        // ====================================================
        // BOTONES ELIMINAR DE LA TABLA
        // ====================================================

        document
            .querySelectorAll('.eliminar-fila')
            .forEach(boton => {

                boton.addEventListener(
                    'click',
                    function () {

                        const id =
                            this.dataset.id;

                        eliminarLocal(id);

                    }
                );

            });


    } catch (error) {

        console.error(
            'Error al cargar locales:',
            error
        );


        tablaLocales.innerHTML = `
            <tr>
                <td colspan="5">
                    Error al cargar los locales.
                </td>
            </tr>
        `;


        mostrarMensaje(
            'No fue posible cargar los locales.',
            'error'
        );

    }

}


// ============================================================
// CONSULTAR LOCAL POR ID
// GET /servidor/local/:id
// ============================================================

async function consultarLocal(id) {

    if (!id) {

        mostrarMensaje(
            'Ingrese el ID del local.',
            'error'
        );

        return;
    }


    try {

        mostrarMensaje(
            'Consultando local...',
            'normal'
        );


        const respuesta =
            await fetch(
                `${URL_BASE}/local/${id}`
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                'Local no encontrado'
            );

        }


        const local =
            datos.local || datos;


        // ====================================================
        // CARGAR DATOS EN FORMULARIO DE ACTUALIZACIÓN
        // ====================================================

        document.getElementById(
            'idActualizar'
        ).value =
            local.id_local ?? '';


        document.getElementById(
            'calleActualizar'
        ).value =
            local.calle ?? '';


        document.getElementById(
            'numeroActualizar'
        ).value =
            local.numero ?? '';


        document.getElementById(
            'ciudadActualizar'
        ).value =
            local.ciudad ?? '';


        mostrarMensaje(
            `Local con ID ${id} encontrado correctamente.`,
            'exito'
        );


    } catch (error) {

        console.error(
            'Error al consultar local:',
            error
        );


        mostrarMensaje(
            error.message ||
            'Local no encontrado.',
            'error'
        );

    }

}


// ============================================================
// REGISTRAR LOCAL
// POST /servidor/local
// ============================================================

formulario.addEventListener(
    'submit',
    async function (evento) {

        evento.preventDefault();


        const datosLocal = {

            calle:
                document.getElementById('calle').value.trim(),

            numero:
                document.getElementById('numero').value.trim(),

            ciudad:
                document.getElementById('ciudad').value.trim()

        };


        // ====================================================
        // VALIDACIÓN
        // ====================================================

        if (
            !datosLocal.calle ||
            !datosLocal.numero ||
            !datosLocal.ciudad
        ) {

            mostrarMensaje(
                'Complete todos los campos del local.',
                'error'
            );

            return;
        }


        try {

            mostrarMensaje(
                'Registrando local...',
                'normal'
            );


            const respuesta =
                await fetch(
                    `${URL_BASE}/local`,
                    {

                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(datosLocal)

                    }
                );


            const datos =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.message ||
                    'Error al registrar local'
                );

            }


            mostrarMensaje(
                datos.mensaje ||
                'Local registrado exitosamente.',
                'exito'
            );


            formulario.reset();


            cargarLocales();


        } catch (error) {

            console.error(
                'Error al registrar local:',
                error
            );


            mostrarMensaje(
                error.message ||
                'No fue posible registrar el local.',
                'error'
            );

        }

    }
);


// ============================================================
// CONSULTAR CON BOTÓN
// ============================================================

botonConsultar.addEventListener(
    'click',
    function () {

        const id =
            buscarId.value.trim();

        consultarLocal(id);

    }
);


// ============================================================
// ACTUALIZAR LOCAL
// PUT /servidor/local/:id
// ============================================================

formActualizar.addEventListener(
    'submit',
    async function (evento) {

        evento.preventDefault();


        const id =
            document.getElementById(
                'idActualizar'
            ).value.trim();


        const datosLocal = {

            calle:
                document.getElementById(
                    'calleActualizar'
                ).value.trim(),

            numero:
                document.getElementById(
                    'numeroActualizar'
                ).value.trim(),

            ciudad:
                document.getElementById(
                    'ciudadActualizar'
                ).value.trim()

        };


        if (!id) {

            mostrarMensaje(
                'Ingrese el ID del local que desea actualizar.',
                'error'
            );

            return;
        }


        if (
            !datosLocal.calle ||
            !datosLocal.numero ||
            !datosLocal.ciudad
        ) {

            mostrarMensaje(
                'Complete todos los datos del local.',
                'error'
            );

            return;
        }


        try {

            mostrarMensaje(
                'Actualizando local...',
                'normal'
            );


            const respuesta =
                await fetch(
                    `${URL_BASE}/local/${id}`,
                    {

                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(datosLocal)

                    }
                );


            const datos =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.message ||
                    'Error al actualizar local'
                );

            }


            mostrarMensaje(
                datos.mensaje ||
                'Local actualizado exitosamente.',
                'exito'
            );


            cargarLocales();


        } catch (error) {

            console.error(
                'Error al actualizar local:',
                error
            );


            mostrarMensaje(
                error.message ||
                'No fue posible actualizar el local.',
                'error'
            );

        }

    }
);


// ============================================================
// ELIMINAR LOCAL
// DELETE /servidor/local/:id
// ============================================================

botonEliminar.addEventListener(
    'click',
    function () {

        const id =
            document.getElementById(
                'idEliminar'
            ).value.trim();


        eliminarLocal(id);

    }
);


// ============================================================
// FUNCIÓN ELIMINAR LOCAL
// ============================================================

async function eliminarLocal(id) {

    if (!id) {

        mostrarMensaje(
            'Ingrese el ID del local que desea eliminar.',
            'error'
        );

        return;
    }


    const confirmar =
        confirm(
            `¿Está seguro de eliminar el local con ID ${id}?`
        );


    if (!confirmar) {

        return;

    }


    try {

        mostrarMensaje(
            'Eliminando local...',
            'normal'
        );


        const respuesta =
            await fetch(
                `${URL_BASE}/local/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.message ||
                'Error al eliminar local'
            );

        }


        mostrarMensaje(
            datos.mensaje ||
            'Local eliminado exitosamente.',
            'exito'
        );


        document.getElementById(
            'idEliminar'
        ).value = '';


        cargarLocales();


    } catch (error) {

        console.error(
            'Error al eliminar local:',
            error
        );


        mostrarMensaje(
            error.message ||
            'No fue posible eliminar el local.',
            'error'
        );

    }

}


// ============================================================
// ACTUALIZAR LISTA
// ============================================================

botonActualizarLista.addEventListener(
    'click',
    function () {

        cargarLocales();

        mostrarMensaje(
            'Lista de locales actualizada.',
            'exito'
        );

    }
);


// ============================================================
// INICIO DEL MÓDULO
// ============================================================

cargarLocales();