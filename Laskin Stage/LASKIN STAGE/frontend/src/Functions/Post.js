import { HOST } from './Constants'


function handleErrors(response) {
  if (response.status >= 500) {
    throw Error(response.statusText)
  }
  return response
}

// PERFORM POST/PUT REQUESTS
export function simpleRequest(path, type, data, responseHandler) {
  let url = HOST + path

  fetch(url, {
    method: type,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error)
      }

      return responseHandler('success', response)
    })
    .catch((error) => responseHandler('error', error))
}

export function customRequest(path, type, product, responseHandler) {
  let url = HOST + path;

  let data = {
    product: product
  };

  fetch(url, {
    method: type,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error);
      }

      return responseHandler('success', response);
    })
    .catch((error) => responseHandler('error', error));
}

export function sendOrders(path, type, orders, responseHandler) {
  let url = HOST + path;

  let data = { ...orders };

  fetch(url, {
    method: type,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error);
      }

      return responseHandler('success', response);
    })
    .catch((error) => responseHandler('error', error));
}


export function customRequest2(path, type, product, responseHandler) {
  let url = HOST + path;

  fetch(url, {
    method: type,
    body: JSON.stringify(product),
    headers: {
      'Content-Type': 'application/json',
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error);
      }

      return responseHandler('success', response);
    })
    .catch((error) => responseHandler('error', error));
}

export function simpleRequest3(path, type, data, responseHandler) {
  let url = HOST + path;

  fetch(url, {
    method: type,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error);
      }

      return responseHandler('success', response);
    })
    .catch((error) => responseHandler('error', error));
}

async function readJSONFromFile(file) {
  try {
    const response = await fetch(file);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading JSON file:', error);
    throw error;
  }
}

// PERFORM POST/PUT REQUESTS WITH FILES
export function simpleRequestWithFiles(path, type, data, responseHandler) {
  let url = HOST + path

  const formData = new FormData();

  console.log("DATA", data);

  for (const name in data) {
    console.log(name);
    formData.append(name, data[name]);
  }

  fetch(url, {
    method: type,
    body: formData,
    headers: {
      token: sessionStorage.getItem('token'),
    },
  })
    .then(handleErrors)
    .then((res) => res.json())
    .then((response) => {
      if (response.hasOwnProperty('error')) {
        return responseHandler('error', response.error)
      }

      return responseHandler('success', response)
    })
    .catch((error) => responseHandler('error', error))
}

export async function asyncRequest(path, type, data, responseHandlerStep) {
  let url = HOST + path
  return fetch(url, {
    method: type,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      token: sessionStorage.getItem('token'),
    },
  }).then((x) => {
    return x.clone().json()
  }).then((response) => {
    return response
  }
  )
    .catch((error) => console.log("errorrrrr ", error))
}