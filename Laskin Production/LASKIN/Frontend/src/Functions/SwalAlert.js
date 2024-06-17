import Swal from 'sweetalert2'

export function simpleAlert(text, responseHandler) {
    Swal.fire({
        title: '¿Estás seguro de activar la venta sin stock?',
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#b31d1d',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            responseHandler();
        }
    })
}

export function simpleAlert2(text, responseHandler) {
    Swal.fire({
        title: '¿Estás seguro de desactivar la venta sin stock?',
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#b31d1d',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            responseHandler();
        }
    })
}

export function simpleAlert3(text, responseHandler) {
    Swal.fire({
        title: '¿Estás seguro de eliminar la parametrización?',
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#b31d1d',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            responseHandler();
        }
    })

}