import { DATE_OPTIONS } from './Constants'

export function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// Return true if string is valid to store
export function validateString(string) {
  if (String(string).length > 800) {
    return false
  }

  const re =
    /\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b/gm
  return !re.test(String(string).toUpperCase())
}

export function setSelectOptions(options) {
  if (options.length < 1) {
    return
  }

  let select_options = []

  for (let i = 0; i < options.length; i++) {
    let op = options[i]

    select_options.push(
      <option
        key={op.name}
        className='global-form-input-select-option'
        value={op.value}
      >
        {op.name}
      </option>
    )
  }

  return select_options
}

export function formatPrice(price) {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    ninimumFractionDigits: 0,
  });
  return formatter.format(price)
}

export function formatPriceCompare(price) {
  if (parseFloat(price) === 0) {
    return '';
  }

  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });

  return formatter.format(price);
}


export function formatearPrecio(precioStr) {
  // Obtener la parte entera del precio eliminando los decimales
  const precioEntero = precioStr.split(".")[0];

  // Convertir la parte entera a un número entero
  const precioFormateado = parseInt(precioEntero);

  return precioFormateado;
}

export async function getCityFromAddress(address, department) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${address}, ${department}, Colombia`,
        format: 'json',
        limit: 1,
      },
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].display_name;
    } else {
      throw new Error('No se encontró la ciudad para la dirección proporcionada.');
    }
  } catch (error) {
    throw new Error(`Error al obtener la ciudad: ${error.message}`);
  }
}




export function formatDateToLocal(date_string) {
  let date = new Date(date_string)

  return (
    date.toLocaleDateString('es-CO', DATE_OPTIONS) +
    ' ' +
    date.toLocaleTimeString()
  )
}

export function formatDate(date_string) {
  let date = new Date(date_string)

  let year = date.getFullYear()
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  let mins =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

  let month = date.getMonth() + 1
  month = month < 10 ? '0' + month : month

  return year + '-' + month + '-' + day + 'T' + hours + ':' + mins
}

// Returns true if the first date is greater than the second
export function compareDates(date_1, date_2) {
  let first = new Date(date_1)
  let second = new Date(date_2)

  return first > second
}


export function parseOptionToStatic(num) {
  let id = 's'

  switch (num) {
    case 1:
      return id + 1
    case 2:
      return id + 1
    case 3:
      return id + 2
    case 4:
      return id + 2
    case 5:
      return id + 8
    case 6:
      return id + 2
    case 7:
      return id + 2
    case 8:
      return id + 2
    case 9:
      return id + 3
    case 10:
      return id + 4
    case 11:
      return id + 6
    case 12:
      return id + 1
    case 13:
      return id + 6
    case 14:
      return id + 6
    case 15:
      return id + 4
    case 16:
      return id + 4
    case 17:
      return id + 1
    case 18:
      return id + 6
    case 19:
      return id + 8
    case 20:
      return id + 8
    case 21:
      return id + 4
    case 22:
      return id + 8
    case 23:
      return id + 8
    case 24:
      return id + 8
  }
}