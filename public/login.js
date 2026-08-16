// ============================================================
// JAVASCRIPT - LOGIN
// BIDA Odontología Especializada
// ============================================================

const URL_BASE =
    window.location.port === '3040'
        ? '/servidor'
        : 'http://localhost:3040/servidor';

const formulario =
    document.getElementById('formLogin');

const mensaje =
    document.getElementById('mensaje');


// ============================================================
// INICIO DE SESIÓN
// ============================================================

formulario.addEventListener('submit', async (evento) => {

    evento.preventDefault();


    // Obtener datos del formulario

    const documento =
        document
            .getElementById('documento')
            .value
            .trim();


    const correo =
        document
            .getElementById('correo')
            .value
            .trim();


    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================

    if (!documento || !correo) {

        mensaje.textContent =
            'Debe completar todos los campos.';

        return;
    }


    mensaje.textContent =
        'Validando información...';


    try {

        // ====================================================
        // BUSCAR EMPLEADO POR DOCUMENTO
        // ====================================================

        const respuesta = await fetch(
            `${URL_BASE}/empleado/documento/${encodeURIComponent(documento)}`
        );


        const datos = await respuesta.json();


        // ====================================================
        // EMPLEADO NO ENCONTRADO
        // ====================================================

        if (!respuesta.ok) {

            mensaje.textContent =
                datos.message ||
                'No se encontró el empleado.';

            return;
        }


        // ====================================================
        // OBTENER EL EMPLEADO
        // ====================================================

        const empleado =
            datos.empleado;


        // ====================================================
        // VERIFICAR CORREO
        // ====================================================

        if (
            empleado &&
            empleado.correo &&
            empleado.correo.toLowerCase() ===
            correo.toLowerCase()
        ) {


            // ================================================
            // GUARDAR SESIÓN
            // ================================================

            sessionStorage.setItem(
                'bidaSesion',
                'activa'
            );


            // ================================================
            // GUARDAR DATOS DEL EMPLEADO
            // ================================================

            sessionStorage.setItem(
                'bidaEmpleado',
                JSON.stringify({
                    id_empleado:
                        empleado.id_empleado,

                    documento_identidad:
                        empleado.documento_identidad,

                    nombre:
                        empleado.nombre,

                    apellido:
                        empleado.apellido,

                    cargo:
                        empleado.cargo,

                    correo:
                        empleado.correo
                })
            );


            // ================================================
            // MENSAJE DE BIENVENIDA
            // ================================================

            mensaje.textContent =
                `Bienvenido ${empleado.nombre} ${empleado.apellido}`;


            // ================================================
            // IR AL PANEL PRINCIPAL
            // ================================================

            setTimeout(() => {

                window.location.href =
                    '/index.html';

            }, 1000);


        } else {

            mensaje.textContent =
                'El correo no coincide con el empleado.';

        }


    } catch (error) {

        console.error(
            'Error durante el inicio de sesión:',
            error
        );


        mensaje.textContent =
            'No fue posible comunicarse con el servidor.';

    }

});