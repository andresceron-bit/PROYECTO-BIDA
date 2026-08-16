// ============================================================
// JAVASCRIPT - PÁGINA PRINCIPAL
// BIDA Odontología Especializada
// ============================================================


// ============================================================
// VERIFICAR SESIÓN
// ============================================================

const sesion =
    sessionStorage.getItem('bidaSesion');


// ============================================================
// SI NO EXISTE SESIÓN
// ============================================================

if (sesion !== 'activa') {

    window.location.href =
        'login.html';

}


// ============================================================
// OBTENER DATOS DEL EMPLEADO
// ============================================================

const datosEmpleado =
    sessionStorage.getItem('bidaEmpleado');


// ============================================================
// MOSTRAR INFORMACIÓN DEL EMPLEADO
// ============================================================

if (datosEmpleado) {

    try {

        const empleado =
            JSON.parse(datosEmpleado);


        const nombreUsuario =
            document.getElementById('nombreUsuario');


        const cargoUsuario =
            document.getElementById('cargoUsuario');


        if (nombreUsuario) {

            nombreUsuario.textContent =
                `${empleado.nombre} ${empleado.apellido}`;

        }


        if (cargoUsuario) {

            cargoUsuario.textContent =
                empleado.cargo;

        }


    } catch (error) {

        console.error(
            'Error al obtener los datos del empleado:',
            error
        );

    }

}


// ============================================================
// BOTÓN CERRAR SESIÓN
// ============================================================

const botonCerrarSesion =
    document.getElementById('cerrarSesion');


if (botonCerrarSesion) {

    botonCerrarSesion.addEventListener(
        'click',
        () => {

            // Eliminar sesión

            sessionStorage.removeItem(
                'bidaSesion'
            );


            // Eliminar datos del empleado

            sessionStorage.removeItem(
                'bidaEmpleado'
            );


            // Regresar al login

            window.location.href =
                'login.html';

        }
    );

}
