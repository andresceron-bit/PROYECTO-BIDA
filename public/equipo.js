// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = '/servidor/equipo';


// ============================================================
// EJECUTAR CUANDO CARGUE LA PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    crearPanelOperaciones();

    cargarEquipos();

});


// ============================================================
// CREAR PANEL DE OPERACIONES
// ============================================================

function crearPanelOperaciones() {

    const tablaSeccion = document.querySelector('.tabla-seccion');

    if (!tablaSeccion) {
        console.error('No se encontró .tabla-seccion');
        return;
    }

    const panel = document.createElement('section');

    panel.className = 'tabla-seccion';

    panel.innerHTML = `

        <h2>Gestión de equipos</h2>

        <div class="tarjeta" style="
            background:white;
            padding:30px;
            border-radius:12px;
            border:1px solid #e0e6ea;
            box-shadow:0 4px 12px rgba(0,0,0,0.08);
            margin-bottom:25px;
        ">

            <h3 style="color:#0b7285; margin-bottom:20px;">
                Registrar equipo
            </h3>

            <form id="formEquipo">

                <div style="
                    display:grid;
                    grid-template-columns:
                    repeat(auto-fit, minmax(220px, 1fr));
                    gap:20px;
                ">

                    <div>
                        <label><strong>Tipo de equipo</strong></label>

                        <input
                            type="text"
                            id="tipo"
                            placeholder="Ej: Sillón odontológico"
                            required
                            style="
                                width:100%;
                                padding:12px;
                                margin-top:8px;
                                border:1px solid #cfd8dc;
                                border-radius:7px;
                            "
                        >
                    </div>

                    <div>
                        <label><strong>Número de equipo</strong></label>

                        <input
                            type="text"
                            id="id_numero"
                            placeholder="Ej: EQ-001"
                            required
                            style="
                                width:100%;
                                padding:12px;
                                margin-top:8px;
                                border:1px solid #cfd8dc;
                                border-radius:7px;
                            "
                        >
                    </div>

                    <div>
                        <label><strong>Fecha de mantenimiento</strong></label>

                        <input
                            type="date"
                            id="fecha_mantenimiento"
                            required
                            style="
                                width:100%;
                                padding:12px;
                                margin-top:8px;
                                border:1px solid #cfd8dc;
                                border-radius:7px;
                            "
                        >
                    </div>

                    <div>
                        <label><strong>ID Local</strong></label>

                        <input
                            type="number"
                            id="id_local"
                            placeholder="Ingrese ID del local"
                            required
                            min="1"
                            style="
                                width:100%;
                                padding:12px;
                                margin-top:8px;
                                border:1px solid #cfd8dc;
                                border-radius:7px;
                            "
                        >
                    </div>

                    <div>
                        <label><strong>ID Consultorio</strong></label>

                        <input
                            type="number"
                            id="id_consultorio"
                            placeholder="Ingrese ID del consultorio"
                            required
                            min="1"
                            style="
                                width:100%;
                                padding:12px;
                                margin-top:8px;
                                border:1px solid #cfd8dc;
                                border-radius:7px;
                            "
                        >
                    </div>

                </div>

                <div style="margin-top:25px;">

                    <button
                        type="submit"
                        class="btn-principal"
                    >
                        Guardar equipo
                    </button>

                    <button
                        type="reset"
                        class="btn-secundario"
                    >
                        Limpiar
                    </button>

                </div>

            </form>

            <div
                id="mensajeEquipo"
                style="
                    margin-top:20px;
                    font-weight:bold;
                "
            ></div>

        </div>


        <div class="tarjeta" style="
            background:white;
            padding:30px;
            border-radius:12px;
            border:1px solid #e0e6ea;
            box-shadow:0 4px 12px rgba(0,0,0,0.08);
        ">

            <h3 style="color:#0b7285; margin-bottom:20px;">
                Consultar equipo por ID
            </h3>

            <div style="
                display:flex;
                gap:12px;
                flex-wrap:wrap;
            ">

                <input
                    type="number"
                    id="buscarEquipoId"
                    placeholder="Ingrese el ID del equipo"
                    min="1"
                    style="
                        flex:1;
                        min-width:220px;
                        padding:12px;
                        border:1px solid #cfd8dc;
                        border-radius:7px;
                    "
                >

                <button
                    type="button"
                    id="btnBuscarEquipo"
                    class="btn-principal"
                >
                    Consultar
                </button>

            </div>

            <div
                id="resultadoEquipo"
                style="margin-top:20px;"
            ></div>

        </div>

    `;

    tablaSeccion.parentNode.insertBefore(panel, tablaSeccion);


    // Evento del formulario

    document
        .getElementById('formEquipo')
        .addEventListener('submit', registrarEquipo);


    // Evento buscar

    document
        .getElementById('btnBuscarEquipo')
        .addEventListener('click', buscarEquipo);

}


// ============================================================
// CARGAR TODOS LOS EQUIPOS
// ============================================================

async function cargarEquipos() {

    const tbody = document.querySelector('tbody');

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                Cargando equipos...
            </td>
        </tr>
    `;

    try {

        const respuesta = await fetch(API_URL);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || 'Error al obtener equipos'
            );
        }

        tbody.innerHTML = '';

        datos.equipos.forEach(equipo => {

            const fila = document.createElement('tr');

            fila.innerHTML = `

                <td>${equipo.id_equipo}</td>

                <td>${equipo.tipo}</td>

                <td>${equipo.id_numero}</td>

                <td>${formatearFecha(equipo.fecha_mantenimiento)}</td>

                <td>${equipo.id_local}</td>

                <td>${equipo.id_consultorio}</td>

                <td>

                    <button
                        class="btn-principal"
                        onclick="mostrarEquipoParaEditar(${equipo.id_equipo})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-secundario"
                        onclick="eliminarEquipo(${equipo.id_equipo})"
                    >
                        Eliminar
                    </button>

                </td>

            `;

            tbody.appendChild(fila);

        });

    } catch (error) {

        console.error('Error:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los equipos:
                    ${error.message}
                </td>
            </tr>
        `;
    }
}


// ============================================================
// REGISTRAR EQUIPO
// ============================================================

async function registrarEquipo(evento) {

    evento.preventDefault();

    const tipo =
        document.getElementById('tipo').value.trim();

    const id_numero =
        document.getElementById('id_numero').value.trim();

    const fecha_mantenimiento =
        document.getElementById('fecha_mantenimiento').value;

    const id_local =
        document.getElementById('id_local').value;

    const id_consultorio =
        document.getElementById('id_consultorio').value;


    if (
        !tipo ||
        !id_numero ||
        !fecha_mantenimiento ||
        !id_local ||
        !id_consultorio
    ) {

        mostrarMensaje(
            'Complete todos los campos obligatorios.',
            true
        );

        return;
    }


    const equipo = {

        tipo,
        id_numero,
        fecha_mantenimiento,
        id_local,
        id_consultorio

    };


    try {

        const respuesta = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(equipo)

        });


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'No fue posible registrar el equipo'
            );
        }


        mostrarMensaje(
            `Equipo registrado exitosamente. ID: ${datos.idEquipo}`,
            false
        );


        document
            .getElementById('formEquipo')
            .reset();


        cargarEquipos();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            true
        );
    }
}


// ============================================================
// BUSCAR EQUIPO POR ID
// ============================================================

async function buscarEquipo() {

    const id =
        document
            .getElementById('buscarEquipoId')
            .value;


    if (!id) {

        document
            .getElementById('resultadoEquipo')
            .innerHTML = `
                <p>
                    Debe ingresar un ID.
                </p>
            `;

        return;
    }


    try {

        const respuesta =
            await fetch(`${API_URL}/${id}`);


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'Equipo no encontrado'
            );
        }


        const equipo = datos.equipo;


        document
            .getElementById('resultadoEquipo')
            .innerHTML = `

                <div style="
                    background:#f4f8fb;
                    padding:20px;
                    border-radius:10px;
                    border-left:4px solid #0b7285;
                ">

                    <h4 style="color:#0b7285;">
                        Equipo encontrado
                    </h4>

                    <p>
                        <strong>ID:</strong>
                        ${equipo.id_equipo}
                    </p>

                    <p>
                        <strong>Tipo:</strong>
                        ${equipo.tipo}
                    </p>

                    <p>
                        <strong>Número:</strong>
                        ${equipo.id_numero}
                    </p>

                    <p>
                        <strong>Fecha de mantenimiento:</strong>
                        ${formatearFecha(equipo.fecha_mantenimiento)}
                    </p>

                    <p>
                        <strong>ID Local:</strong>
                        ${equipo.id_local}
                    </p>

                    <p>
                        <strong>ID Consultorio:</strong>
                        ${equipo.id_consultorio}
                    </p>

                </div>

            `;


    } catch (error) {

        document
            .getElementById('resultadoEquipo')
            .innerHTML = `

                <p style="color:#c62828;">
                    ${error.message}
                </p>

            `;
    }
}


// ============================================================
// MOSTRAR EQUIPO PARA EDITAR
// ============================================================

async function mostrarEquipoParaEditar(id) {

    try {

        const respuesta =
            await fetch(`${API_URL}/${id}`);


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'No se pudo obtener el equipo'
            );
        }


        const equipo = datos.equipo;


        document.getElementById('tipo').value =
            equipo.tipo;

        document.getElementById('id_numero').value =
            equipo.id_numero;

        document.getElementById('fecha_mantenimiento').value =
            formatearFechaInput(equipo.fecha_mantenimiento);

        document.getElementById('id_local').value =
            equipo.id_local;

        document.getElementById('id_consultorio').value =
            equipo.id_consultorio;


        const form =
            document.getElementById('formEquipo');


        form.dataset.editando = id;


        const boton =
            form.querySelector('button[type="submit"]');


        boton.textContent =
            'Actualizar equipo';


        form.scrollIntoView({
            behavior: 'smooth'
        });


        form.onsubmit = function(evento) {

            evento.preventDefault();

            actualizarEquipo(id);

        };


    } catch (error) {

        mostrarMensaje(
            error.message,
            true
        );
    }
}


// ============================================================
// ACTUALIZAR EQUIPO
// ============================================================

async function actualizarEquipo(id) {

    const equipo = {

        tipo:
            document.getElementById('tipo').value.trim(),

        id_numero:
            document.getElementById('id_numero').value.trim(),

        fecha_mantenimiento:
            document.getElementById('fecha_mantenimiento').value,

        id_local:
            document.getElementById('id_local').value,

        id_consultorio:
            document.getElementById('id_consultorio').value

    };


    if (
        !equipo.tipo ||
        !equipo.id_numero ||
        !equipo.fecha_mantenimiento ||
        !equipo.id_local ||
        !equipo.id_consultorio
    ) {

        mostrarMensaje(
            'Complete todos los campos.',
            true
        );

        return;
    }


    try {

        const respuesta = await fetch(
            `${API_URL}/${id}`,
            {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(equipo)

            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'No se pudo actualizar el equipo'
            );
        }


        mostrarMensaje(
            `Equipo ${id} actualizado exitosamente.`,
            false
        );


        const form =
            document.getElementById('formEquipo');


        form.reset();


        delete form.dataset.editando;


        const boton =
            form.querySelector('button[type="submit"]');


        boton.textContent =
            'Guardar equipo';


        form.onsubmit = registrarEquipo;


        cargarEquipos();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            true
        );
    }
}


// ============================================================
// ELIMINAR EQUIPO
// ============================================================

async function eliminarEquipo(id) {

    const confirmar = confirm(
        `¿Está seguro de eliminar el equipo con ID ${id}?`
    );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                'No se pudo eliminar el equipo'
            );
        }


        alert(
            `Equipo ${id} eliminado exitosamente.`
        );


        cargarEquipos();


    } catch (error) {

        console.error(error);

        alert(
            `Error: ${error.message}`
        );
    }
}


// ============================================================
// MOSTRAR MENSAJES
// ============================================================

function mostrarMensaje(mensaje, error = false) {

    const elemento =
        document.getElementById('mensajeEquipo');


    if (!elemento) {
        return;
    }


    elemento.textContent = mensaje;


    elemento.style.color =
        error ? '#c62828' : '#2e7d32';
}


// ============================================================
// FORMATEAR FECHA PARA MOSTRAR
// ============================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return '';
    }


    const fechaTexto =
        String(fecha).substring(0, 10);


    const partes =
        fechaTexto.split('-');


    if (partes.length !== 3) {
        return fechaTexto;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ============================================================
// FORMATEAR FECHA PARA INPUT DATE
// ============================================================

function formatearFechaInput(fecha) {

    if (!fecha) {
        return '';
    }


    return String(fecha).substring(0, 10);
}