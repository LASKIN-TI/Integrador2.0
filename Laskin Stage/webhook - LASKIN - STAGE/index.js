var webhook = require('./callserver.js')

exports.handler = async (event) => {
    const {httpMethod, path, headers, requestContext} = event
    console.log(JSON.stringify(event))

    var resource = path.split('/').pop()
    return webhook.handler(headers, getPayload(httpMethod, event), resource)
    .then(async (response) => {
        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
        }
    }).catch(async (error) => {
        return {
            statusCode: 502,
            body: JSON.stringify(error),
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
            },
        }
    })
}

function getPayload(method, event) {
    switch(method) {
        case 'GET':
            return event.queryStringParameters || {}
        default:
            return JSON.parse(event.body || "{}")
    }
}

