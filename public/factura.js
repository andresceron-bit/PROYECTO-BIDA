// ============================================================
// factura.js
// Módulo frontend de facturas - BIDA
// ============================================================

const API_URL =
    window.location.port === '3040'
        ? '/servidor/factura'
        : 'http://localhost:3040/servidor/factura';


// ============================================================
// FORMATEAR DINERO
// ============================================================

function formatoDinero(valor) {

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return '$ 0';
    }

    return numero.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    });
}


// ============================================================
// EVITAR INSERTAR HTML NO DESEADO
// ============================================================

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


// ============================================================
// MOSTRAR MENSAJES
// ============================================================

function mostrarMensajeFactura(texto, tipo = 'info') {

    let mensaje = document.getElementById('mensajeFactura');

    if (!mensaje) {

        mensaje = document.createElement('div');

        mensaje.id = 'mensajeFactura';

        const seccion =
            document.querySelector('.prueba-servidor');

        if (seccion) {
            seccion.prepend(mensaje);
        }
    }

    mensaje.textContent = texto;

    mensaje.style.padding = '12px';
    mensaje.style.marginBottom = '15px';
    mensaje.style.borderRadius = '7px';
    mensaje.style.fontWeight = 'bold';

    if (tipo === 'error') {

        mensaje.style.backgroundColor = '#ffebee';
        mensaje.style.color = '#c62828';

    } else if (tipo === 'exito') {

        mensaje.style.backgroundColor = '#e8f5e9';
        mensaje.style.color = '#2e7d32';

    } else {

        mensaje.style.backgroundColor = '#e3f2fd';
        mensaje.style.color = '#1565c0';
    }
}


// ============================================================
// CREAR PANEL DE PRUEBAS
// ============================================================

function crearPanelFactura() {

    const seccion =
        document.querySelector('.prueba-servidor');

    if (!seccion) {

        console.error(
            'No se encontró la sección prueba-servidor'
        );

        return;
    }


    const panel = document.createElement('div');

    panel.id = 'panelFactura';


    panel.innerHTML = `

        <hr style="
            margin:30px 0;
            border:0;
            border-top:1px solid #e0e6ea;
        ">


        <!-- ==========================================
             REGISTRAR FACTURA
        =========================================== -->

        <h3 style="
            color:#0b7285;
            margin-bottom:20px;
        ">
            Registrar factura
        </h3>


        <form id="formFactura">


            <div style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(200px,1fr));
                gap:15px;
                margin-bottom:20px;
            ">


                <input
                    type="number"
                    id="idEmpleado"
                    placeholder="ID empleado"
                    min="1"
                    required
                >


                <input
                    type="number"
                    id="idPaciente"
                    placeholder="ID paciente"
                    min="1"
                    required
                >


                <input
                    type="number"
                    id="idCita"
                    placeholder="ID cita"
                    min="1"
                    required
                >


                <select
                    id="metodoPago"
                    required
                >

                    <option value="">
                        Método de pago
                    </option>

                    <option value="Efectivo">
                        Efectivo
                    </option>

                    <option value="Tarjeta">
                        Tarjeta
                    </option>

                    <option value="Transferencia">
                        Transferencia
                    </option>

                </select>


            </div>


            <h4 style="
                color:#546e7a;
                margin-bottom:15px;
            ">
                Tratamientos
            </h4>


            <div id="listaTratamientos"></div>


            <button
                type="button"
                id="btnAgregarTratamiento"
                class="btn-principal"
                style="margin:10px 0 20px;"
            >
                + Agregar tratamiento
            </button>


            <br>


            <button
                type="submit"
                class="btn-principal"
            >
                Registrar factura
            </button>


            <button
                type="reset"
                id="btnLimpiarFactura"
                class="btn-secundario"
                style="margin-left:10px;"
            >
                Limpiar
            </button>


        </form>


        <hr style="
            margin:30px 0;
            border:0;
            border-top:1px solid #e0e6ea;
        ">


        <!-- ==========================================
             CONSULTAR FACTURA
        =========================================== -->

        <h3 style="
            color:#0b7285;
            margin-bottom:15px;
        ">
            Consultar factura por ID
        </h3>


        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
        ">


            <input
                type="number"
                id="buscarFacturaId"
                placeholder="Ingrese el ID de la factura"
                min="1"
            >


            <button
                type="button"
                id="btnConsultarFactura"
                class="btn-principal"
            >
                Consultar
            </button>


        </div>


        <div
            id="resultadoFactura"
            style="margin-top:20px;"
        ></div>

    `;


    seccion.appendChild(panel);


    // Agregar primer tratamiento

    agregarTratamiento();


    // Eventos

    document
        .getElementById('btnAgregarTratamiento')
        .addEventListener(
            'click',
            agregarTratamiento
        );


    document
        .getElementById('formFactura')
        .addEventListener(
            'submit',
            registrarFactura
        );


    document
        .getElementById('btnConsultarFactura')
        .addEventListener(
            'click',
            consultarFactura
        );


    document
        .getElementById('btnLimpiarFactura')
        .addEventListener(
            'click',
            () => {

                setTimeout(() => {

                    const lista =
                        document.getElementById(
                            'listaTratamientos'
                        );

                    lista.innerHTML = '';

                    agregarTratamiento();

                    document
                        .getElementById(
                            'resultadoFactura'
                        )
                        .innerHTML = '';

                }, 0);
            }
        );
}


// ============================================================
// AGREGAR TRATAMIENTO
// ============================================================

function agregarTratamiento() {

    const lista =
        document.getElementById(
            'listaTratamientos'
        );

    if (!lista) {
        return;
    }


    const fila =
        document.createElement('div');


    fila.className =
        'fila-tratamiento';


    fila.style.display = 'grid';

    fila.style.gridTemplateColumns =
        'repeat(auto-fit,minmax(160px,1fr))';

    fila.style.gap = '10px';

    fila.style.marginBottom = '10px';

    fila.style.padding = '15px';

    fila.style.backgroundColor =
        '#f4f8fb';

    fila.style.borderRadius = '8px';


    fila.innerHTML = `

        <input
            type="number"
            class="idTratamiento"
            placeholder="ID tratamiento"
            min="1"
            required
        >


        <input
            type="number"
            class="cantidad"
            placeholder="Cantidad"
            min="1"
            value="1"
            required
        >


        <input
            type="number"
            class="precioUnitario"
            placeholder="Precio unitario"
            min="0"
            step="0.01"
            required
        >


        <input
            type="text"
            class="observaciones"
            placeholder="Observaciones"
        >


        <button
            type="button"
            class="btn-secundario btnEliminarTratamiento"
        >
            Eliminar
        </button>

    `;


    fila
        .querySelector(
            '.btnEliminarTratamiento'
        )
        .addEventListener(
            'click',
            () => {

                const filas =
                    document.querySelectorAll(
                        '.fila-tratamiento'
                    );


                if (filas.length === 1) {

                    mostrarMensajeFactura(
                        'Debe existir al menos un tratamiento.',
                        'error'
                    );

                    return;
                }


                fila.remove();
            }
        );


    lista.appendChild(fila);
}


// ============================================================
// REGISTRAR FACTURA
// ============================================================

async function registrarFactura(evento) {

    evento.preventDefault();


    const idEmpleado =
        Number(
            document.getElementById(
                'idEmpleado'
            ).value
        );


    const idPaciente =
        Number(
            document.getElementById(
                'idPaciente'
            ).value
        );


    const idCita =
        Number(
            document.getElementById(
                'idCita'
            ).value
        );


    const metodoPago =
        document.getElementById(
            'metodoPago'
        ).value;


    const filas =
        document.querySelectorAll(
            '.fila-tratamiento'
        );


    const tratamientos = [];


    for (const fila of filas) {

        const idTratamiento =
            Number(
                fila.querySelector(
                    '.idTratamiento'
                ).value
            );


        const cantidad =
            Number(
                fila.querySelector(
                    '.cantidad'
                ).value
            );


        const precioUnitario =
            Number(
                fila.querySelector(
                    '.precioUnitario'
                ).value
            );


        const observaciones =
            fila.querySelector(
                '.observaciones'
            ).value.trim();


        if (
            !idTratamiento ||
            !cantidad ||
            cantidad <= 0 ||
            Number.isNaN(precioUnitario) ||
            precioUnitario < 0
        ) {

            mostrarMensajeFactura(
                'Revisa los datos de los tratamientos.',
                'error'
            );

            return;
        }


        tratamientos.push({

            id_tratamiento:
                idTratamiento,

            cantidad:
                cantidad,

            precio_unitario:
                precioUnitario,

            id_cita:
                idCita,

            observaciones:
                observaciones || null
        });
    }


    const datos = {

        id_empleado:
            idEmpleado,

        id_paciente:
            idPaciente,

        metodo_pago:
            metodoPago,

        id_cita:
            idCita,

        tratamiento:
            tratamientos
    };


    try {

        mostrarMensajeFactura(
            'Registrando factura...',
            'info'
        );


        const respuesta =
            await fetch(
                API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(datos)
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.message ||
                'No fue posible registrar la factura.'
            );
        }


        mostrarMensajeFactura(
            `Factura ${resultado.idFactura} registrada correctamente. Total: ${formatoDinero(resultado.total)}`,
            'exito'
        );


        document
            .getElementById(
                'formFactura'
            )
            .reset();


        const lista =
            document.getElementById(
                'listaTratamientos'
            );


        lista.innerHTML = '';


        agregarTratamiento();


    } catch (error) {

        console.error(
            'Error al registrar factura:',
            error
        );


        mostrarMensajeFactura(
            error.message,
            'error'
        );
    }
}


// ============================================================
// CONSULTAR FACTURA POR ID
// ============================================================

async function consultarFactura() {

    const id =
        Number(
            document.getElementById(
                'buscarFacturaId'
            ).value
        );


    const resultado =
        document.getElementById(
            'resultadoFactura'
        );


    if (!id || id <= 0) {

        mostrarMensajeFactura(
            'Ingresa un ID de factura válido.',
            'error'
        );

        return;
    }


    try {

        resultado.innerHTML =
            '<p>Consultando factura...</p>';


        const respuesta =
            await fetch(
                `${API_URL}/${id}`
            );


        const factura =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                factura.mensaje ||
                factura.message ||
                'No se encontró la factura.'
            );
        }


        mostrarFactura(factura);


        mostrarMensajeFactura(
            `Factura ${factura.id_factura} encontrada correctamente.`,
            'exito'
        );


    } catch (error) {

        console.error(
            'Error al consultar factura:',
            error
        );


        resultado.innerHTML = '';


        mostrarMensajeFactura(
            error.message,
            'error'
        );
    }
}


// ============================================================
// MOSTRAR FACTURA
// ============================================================

function mostrarFactura(factura) {

    const resultado =
        document.getElementById(
            'resultadoFactura'
        );


    const paciente =
        factura.paciente || {};


    const empleado =
        factura.empleado || {};


    const cita =
        factura.cita || {};


    const odontologo =
        factura.odontologo || {};


    const detalles =
        factura.detalles || [];


    let filas = '';


    if (detalles.length === 0) {

        filas = `
            <tr>
                <td colspan="5">
                    No hay tratamientos asociados.
                </td>
            </tr>
        `;

    } else {

        filas =
            detalles.map(
                detalle => `

                    <tr>

                        <td>
                            ${escaparHTML(
                                detalle.id_detalle
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                detalle.nombre_tratamiento
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                detalle.descripcion ||
                                'Sin descripción'
                            )}
                        </td>

                        <td>
                            ${formatoDinero(
                                detalle.costo_aplicado
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                detalle.observaciones ||
                                'Sin observaciones'
                            )}
                        </td>

                    </tr>

                `
            ).join('');
    }


    resultado.innerHTML = `

        <div style="
            background:white;
            padding:25px;
            border-radius:10px;
            border:1px solid #e0e6ea;
            box-shadow:0 4px 12px rgba(0,0,0,.08);
        ">


            <h3 style="
                color:#0b7285;
                margin-bottom:20px;
            ">
                Factura #${escaparHTML(
                    factura.id_factura
                )}
            </h3>


            <p>
                <strong>
                    Fecha de emisión:
                </strong>

                ${escaparHTML(
                    factura.fecha_emision
                )}
            </p>


            <p>
                <strong>
                    Método de pago:
                </strong>

                ${escaparHTML(
                    factura.metodo_pago
                )}
            </p>


            <p>
                <strong>
                    Total:
                </strong>

                ${formatoDinero(
                    factura.total
                )}
            </p>


            <h4 style="
                color:#0b7285;
                margin:20px 0 10px;
            ">
                Paciente
            </h4>


            <p>
                <strong>
                    Nombre:
                </strong>

                ${escaparHTML(
                    paciente.nombre
                )}

                ${escaparHTML(
                    paciente.apellido
                )}
            </p>


            <p>
                <strong>
                    Documento:
                </strong>

                ${escaparHTML(
                    paciente.documento_identidad
                )}
            </p>


            <p>
                <strong>
                    Teléfono:
                </strong>

                ${escaparHTML(
                    paciente.telefono
                )}
            </p>


            <p>
                <strong>
                    Correo:
                </strong>

                ${escaparHTML(
                    paciente.correo
                )}
            </p>


            <h4 style="
                color:#0b7285;
                margin:20px 0 10px;
            ">
                Empleado
            </h4>


            <p>
                <strong>
                    Nombre:
                </strong>

                ${escaparHTML(
                    empleado.nombre
                )}

                ${escaparHTML(
                    empleado.apellido
                )}
            </p>


            <p>
                <strong>
                    Cargo:
                </strong>

                ${escaparHTML(
                    empleado.cargo
                )}
            </p>


            <h4 style="
                color:#0b7285;
                margin:20px 0 10px;
            ">
                Cita
            </h4>


            <p>
                <strong>
                    Fecha:
                </strong>

                ${escaparHTML(
                    cita.fecha
                )}
            </p>


            <p>
                <strong>
                    Hora:
                </strong>

                ${escaparHTML(
                    cita.hora
                )}
            </p>


            <p>
                <strong>
                    Estado:
                </strong>

                ${escaparHTML(
                    cita.estado
                )}
            </p>


            <h4 style="
                color:#0b7285;
                margin:20px 0 10px;
            ">
                Odontólogo
            </h4>


            <p>
                <strong>
                    Nombre:
                </strong>

                ${escaparHTML(
                    odontologo.nombre
                )}

                ${escaparHTML(
                    odontologo.apellido
                )}
            </p>


            <p>
                <strong>
                    Especialidad:
                </strong>

                ${escaparHTML(
                    odontologo.especialidad
                )}
            </p>


            <p>
                <strong>
                    Licencia:
                </strong>

                ${escaparHTML(
                    odontologo.numero_licencia
                )}
            </p>


            <h4 style="
                color:#0b7285;
                margin:25px 0 12px;
            ">
                Detalles de tratamiento
            </h4>


            <div style="
                overflow-x:auto;
            ">

                <table>

                    <thead>

                        <tr>

                            <th>
                                ID Detalle
                            </th>

                            <th>
                                Tratamiento
                            </th>

                            <th>
                                Descripción
                            </th>

                            <th>
                                Costo aplicado
                            </th>

                            <th>
                                Observaciones
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${filas}

                    </tbody>

                </table>

            </div>


            <div style="
                text-align:right;
                margin-top:20px;
                font-size:22px;
                font-weight:bold;
                color:#0b7285;
            ">

                Total a pagar:
                ${formatoDinero(
                    factura.total
                )}

            </div>


        </div>
    `;


    actualizarFacturaPrincipal(factura);
}


// ============================================================
// ACTUALIZAR LA FACTURA VISUAL DEL HTML
// ============================================================

function actualizarFacturaPrincipal(factura) {

    const contenedor =
        document.querySelector(
            '.factura-contenedor'
        );


    if (!contenedor) {
        return;
    }


    const paciente =
        factura.paciente || {};


    const empleado =
        factura.empleado || {};


    const cita =
        factura.cita || {};


    const odontologo =
        factura.odontologo || {};


    const detalles =
        factura.detalles || [];


    const filas =
        detalles.length
            ? detalles.map(
                detalle => `

                    <tr>

                        <td>
                            ${escaparHTML(
                                detalle.id_detalle
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                detalle.nombre_tratamiento
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                detalle.descripcion ||
                                'Sin descripción'
                            )}
                        </td>

                        <td>
                            ${formatoDinero(
                                detalle.costo_aplicado
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                detalle.observaciones ||
                                'Sin observaciones'
                            )}
                        </td>

                    </tr>

                `
            ).join('')

            : `
                <tr>
                    <td colspan="5">
                        No hay tratamientos registrados.
                    </td>
                </tr>
            `;


    contenedor.innerHTML = `

        <div class="factura-seccion">

            <h3>
                Datos de la factura
            </h3>

            <div class="datos-grid">

                <div>
                    <span>
                        ID Factura
                    </span>

                    <strong>
                        ${escaparHTML(
                            factura.id_factura
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Fecha de emisión
                    </span>

                    <strong>
                        ${escaparHTML(
                            factura.fecha_emision
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Método de pago
                    </span>

                    <strong>
                        ${escaparHTML(
                            factura.metodo_pago
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatoDinero(
                            factura.total
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="factura-seccion">

            <h3>
                Datos del paciente
            </h3>

            <div class="datos-grid">

                <div>
                    <span>
                        Documento
                    </span>

                    <strong>
                        ${escaparHTML(
                            paciente.documento_identidad
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Nombre
                    </span>

                    <strong>
                        ${escaparHTML(
                            paciente.nombre
                        )}

                        ${escaparHTML(
                            paciente.apellido
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Teléfono
                    </span>

                    <strong>
                        ${escaparHTML(
                            paciente.telefono
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Correo
                    </span>

                    <strong>
                        ${escaparHTML(
                            paciente.correo
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="factura-seccion">

            <h3>
                Datos del empleado
            </h3>

            <div class="datos-grid">

                <div>
                    <span>
                        Empleado
                    </span>

                    <strong>
                        ${escaparHTML(
                            empleado.nombre
                        )}

                        ${escaparHTML(
                            empleado.apellido
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Cargo
                    </span>

                    <strong>
                        ${escaparHTML(
                            empleado.cargo
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="factura-seccion">

            <h3>
                Datos de la cita
            </h3>

            <div class="datos-grid">

                <div>
                    <span>
                        Fecha
                    </span>

                    <strong>
                        ${escaparHTML(
                            cita.fecha
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Hora
                    </span>

                    <strong>
                        ${escaparHTML(
                            cita.hora
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Estado
                    </span>

                    <strong>
                        ${escaparHTML(
                            cita.estado
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="factura-seccion">

            <h3>
                Odontólogo
            </h3>

            <div class="datos-grid">

                <div>
                    <span>
                        Nombre
                    </span>

                    <strong>
                        ${escaparHTML(
                            odontologo.nombre
                        )}

                        ${escaparHTML(
                            odontologo.apellido
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Especialidad
                    </span>

                    <strong>
                        ${escaparHTML(
                            odontologo.especialidad
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Número de licencia
                    </span>

                    <strong>
                        ${escaparHTML(
                            odontologo.numero_licencia
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="factura-seccion">

            <h3>
                Detalle de tratamientos
            </h3>

            <div class="tabla-contenedor">

                <table>

                    <thead>

                        <tr>

                            <th>
                                ID Detalle
                            </th>

                            <th>
                                Tratamiento
                            </th>

                            <th>
                                Descripción
                            </th>

                            <th>
                                Costo aplicado
                            </th>

                            <th>
                                Observaciones
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${filas}

                    </tbody>

                </table>

            </div>

        </div>


        <div class="total-factura">

            <span>
                Total a pagar
            </span>

            <strong>
                ${formatoDinero(
                    factura.total
                )}
            </strong>

        </div>
    `;
}


// ============================================================
// INICIAR MÓDULO
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        crearPanelFactura();

        console.log(
            'factura.js cargado correctamente'
        );
    }
);