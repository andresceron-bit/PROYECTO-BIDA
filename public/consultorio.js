// ============================================================
// CONFIGURACIÓN
// ============================================================

// URL BASE DEL SERVIDOR
const URL_BASE =
    window.location.port === '3040'
        ? '/servidor'
        : 'http://localhost:3040/servidor';

const URL_API = `${URL_BASE}/consultorio`;


// ============================================================
// MOSTRAR TODOS LOS CONSULTORIOS
// GET /servidor/consultorio
// ============================================================

async function cargarConsultorios() {

    const tabla = document.getElementById('tablaConsultorios');

    try {

        const respuesta = await fetch(URL_API);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="7">
                        ${datos.mensaje || 'No se pudieron cargar los consultorios'}
                    </td>
                </tr>
            `;

            return;
        }


        tabla.innerHTML = '';


        datos.consultorios.forEach(consultorio => {

            const fila = document.createElement('tr');

            fila.innerHTML = `

                <td>${consultorio.id_consultorio}</td>

                <td>${consultorio.id_numero}</td>

                <td>
                    ${consultorio.id_local ?? 'No asignado'}
                </td>

                <td>
                    ${consultorio.calle ?? ''}
                    ${consultorio.numero_local ?? ''}
                </td>

                <td>
                    ${consultorio.ciudad ?? ''}
                </td>

                <td>
                    ${consultorio.nombre_odontologo ?? ''}
                    ${consultorio.apellido_odontologo ?? ''}
                </td>

                <td>
                    ${consultorio.especialidad ?? ''}
                </td>

            `;

            tabla.appendChild(fila);

        });


    } catch (error) {

        console.error('Error:', error);

        tabla.innerHTML = `
            <tr>
                <td colspan="7">
                    Error al conectar con el servidor.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// CONSULTAR UN CONSULTORIO POR ID
// GET /servidor/consultorio/:id
// ============================================================

async function consultarConsultorio() {

    const id = document.getElementById('buscarId').value;

    const resultado = document.getElementById('resultadoConsulta');


    if (!id) {

        resultado.textContent =
            'Ingrese el ID del consultorio.';

        return;
    }


    try {

        const respuesta =
            await fetch(`${URL_API}/${id}`);

        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            resultado.textContent =
                datos.mensaje || 'Consultorio no encontrado.';

            return;
        }


        resultado.innerHTML = `

            <strong>Consultorio encontrado</strong><br><br>

            ID: ${datos.id_consultorio}<br>

            Número:
            ${datos.id_numero}<br>

            Local:
            ${datos.local.id_local}<br>

            Dirección:
            ${datos.local.calle}
            ${datos.local.numero}<br>

            Ciudad:
            ${datos.local.ciudad}<br>

            Odontólogo:
            ${datos.odontologo.nombre}
            ${datos.odontologo.apellido}<br>

            Especialidad:
            ${datos.odontologo.especialidad}

        `;


    } catch (error) {

        console.error('Error:', error);

        resultado.textContent =
            'Error al conectar con el servidor.';
    }
}


// ============================================================
// CREAR CONSULTORIO
// POST /servidor/consultorio
// ============================================================

async function crearConsultorio(event) {

    event.preventDefault();


    const id_numero =
        document.getElementById('id_numero').value;

    const id_local =
        document.getElementById('id_local').value;

    const id_odontologo =
        document.getElementById('id_odontologo').value;

    const mensaje =
        document.getElementById('mensaje');


    const datos = {

        id_numero: Number(id_numero),

        id_local: Number(id_local),

        id_odontologo: Number(id_odontologo)

    };


    try {

        const respuesta = await fetch(URL_API, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(datos)

        });


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            mensaje.textContent =
                resultado.mensaje ||
                'No se pudo registrar el consultorio.';

            return;
        }


        mensaje.textContent =
            `Consultorio registrado correctamente. ID: ${resultado.id_consultorio}`;


        document.getElementById('formConsultorio').reset();


        cargarConsultorios();


    } catch (error) {

        console.error('Error:', error);

        mensaje.textContent =
            'Error al conectar con el servidor.';
    }
}


// ============================================================
// ACTUALIZAR CONSULTORIO
// PUT /servidor/consultorio/:id
// ============================================================

async function actualizarConsultorio(event) {

    event.preventDefault();


    const id =
        document.getElementById('actualizarId').value;


    const numero =
        document.getElementById('nuevoNumero').value;

    const local =
        document.getElementById('nuevoLocal').value;

    const odontologo =
        document.getElementById('nuevoOdontologo').value;


    if (!id) {

        document.getElementById('mensajeActualizar').textContent =
            'Ingrese el ID del consultorio.';

        return;
    }


    const datos = {};


    if (numero !== '') {

        datos.id_numero =
            Number(numero);

    }


    if (local !== '') {

        datos.id_local =
            Number(local);

    }


    if (odontologo !== '') {

        datos.id_odontologo =
            Number(odontologo);

    }


    if (Object.keys(datos).length === 0) {

        document.getElementById('mensajeActualizar').textContent =
            'Ingrese al menos un dato para actualizar.';

        return;
    }


    try {

        const respuesta = await fetch(
            `${URL_API}/${id}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            }
        );


        const resultado =
            await respuesta.json();


        document.getElementById('mensajeActualizar').textContent =
            resultado.mensaje ||
            'Operación realizada.';


        if (respuesta.ok) {

            document.getElementById('formActualizar').reset();

            cargarConsultorios();

        }


    } catch (error) {

        console.error('Error:', error);

        document.getElementById('mensajeActualizar').textContent =
            'Error al conectar con el servidor.';
    }
}


// ============================================================
// ELIMINAR CONSULTORIO
// DELETE /servidor/consultorio/:id
// ============================================================

async function eliminarConsultorio() {

    const id =
        document.getElementById('eliminarId').value;

    const mensaje =
        document.getElementById('mensajeEliminar');


    if (!id) {

        mensaje.textContent =
            'Ingrese el ID del consultorio.';

        return;
    }


    const confirmar =
        confirm(
            `¿Está seguro de eliminar el consultorio ${id}?`
        );


    if (!confirmar) {

        return;
    }


    try {

        const respuesta = await fetch(
            `${URL_API}/${id}`,
            {
                method: 'DELETE'
            }
        );


        const resultado =
            await respuesta.json();


        mensaje.textContent =
            resultado.mensaje ||
            'Operación realizada.';


        if (respuesta.ok) {

            document.getElementById('eliminarId').value = '';

            cargarConsultorios();

        }


    } catch (error) {

        console.error('Error:', error);

        mensaje.textContent =
            'Error al conectar con el servidor.';
    }
}


// ============================================================
// EVENTOS
// ============================================================

document
    .getElementById('formConsultorio')
    .addEventListener(
        'submit',
        crearConsultorio
    );


document
    .getElementById('btnConsultar')
    .addEventListener(
        'click',
        consultarConsultorio
    );


document
    .getElementById('btnActualizar')
    .addEventListener(
        'click',
        cargarConsultorios
    );


document
    .getElementById('formActualizar')
    .addEventListener(
        'submit',
        actualizarConsultorio
    );


document
    .getElementById('btnEliminar')
    .addEventListener(
        'click',
        eliminarConsultorio
    );


// ============================================================
// CARGAR INFORMACIÓN AL ABRIR LA PÁGINA
// ============================================================

cargarConsultorios();