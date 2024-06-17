import {
  HOST,
  DAY_IN_MS,
  NO_ITEMS_ERROR,
  INVALID_CLASSIF_ERROR,
} from './Constants'

function handleErrors(response) {
  if (response.status >= 500) {
    throw Error(response.statusText)
  }
  return response
}

function validateResponse(response) {
  if (response.hasOwnProperty('error')) {
    return response.error
  }

  if (!response.hasOwnProperty('rows')) {
    if (response.length < 1) {
      return NO_ITEMS_ERROR
    }

    return null
  }

  let rows = response.rows
  if (rows.length < 1) {
    return NO_ITEMS_ERROR
  }

  return null
}

// SIMPLE GET REQUESTS
export function getElementById(path, responseHandler) {
  // Path should have id as param
  let url = HOST + path;

  fetch(url, {
    method: 'GET',
    headers: {
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error);
      }

      if (response.hasOwnProperty('product')) {
        return responseHandler('success', response.product);
      }

      return responseHandler('success', response);
    })
    .catch((error) => responseHandler('error', error));
}


export function getElements(key, path, responseHandler) {
  let url = HOST + path
  fetch(url, {
    method: 'GET',
    headers: {
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      let validation = validateResponse(response)
      if (validation != null) {
        return responseHandler('error', validation)
      }

      let rows = response.rows ? response.rows : response
      let json = JSON.stringify(rows)
      sessionStorage.setItem(key, json)

      return responseHandler('success', rows)
    })
    .catch((error) => responseHandler('error', error))
}

export function getElements2(key, path, responseHandler) {
  let url = HOST + path;

  // Indicate that it's loading before making the request
  responseHandler('loading', null);

  fetch(url, {
    method: 'GET',
    headers: {
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      let validation = validateResponse(response);
      if (validation != null) {
        return responseHandler('error', validation);
      }

      let rows = response.rows ? response.rows : response;
      let json = JSON.stringify(rows);
      sessionStorage.setItem(key, json);

      return responseHandler('success', rows);
    })
    .catch((error) => responseHandler('error', error));
}

export function downloadExcel(path, responseHandler) {
  const url = HOST + path;

  fetch(url, {
    method: 'GET',
    headers: {
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders.xlsx');
      link.click();

      return responseHandler('success', 'Excel descargado correctamente');
    })
    .catch((error) => {
      console.error('Error:', error);
      return responseHandler('error', 'Error descargando el Excel');
    });
}


export function getElements3(path, method, responseHandler) {
  const url = HOST + path;
  
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'token': sessionStorage.getItem('token'),
    },
  })
  .then(handleErrors)
  .then((res) => res.json())
  .then((response) => {
    let validation = validateResponse(response);
    if (validation != null) {
      return responseHandler('error', validation);
    }
    
    let message = response.message ? response.message : response;
  
    return responseHandler('success', message);
  })
  .catch((error) => {
    console.error('Error en la solicitud fetch:', error);
    return responseHandler('error', error);
  });
}

export function downloadExcel2(path, responseHandler) {
  const url = HOST + path;

  fetch(url, {
    method: 'GET',
    headers: {
      token: sessionStorage.getItem('token'),
    },
  })
  .then(response => {
    if (!response.ok) {
      // Si la respuesta no es exitosa, arrojar un error
      throw new Error('La fecha no puede exceder un mes');
    }
    return response.blob();
  })
  .then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registros.xlsx');
    link.click();

    return responseHandler('success', 'Excel descargado correctamente');
  })
  .catch((error) => {
    console.error('Error:', error);
    // Manejar el error y pasar el mensaje al responseHandler
    return responseHandler('error', error.message);
  });
}


