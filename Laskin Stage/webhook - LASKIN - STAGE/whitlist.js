var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

// Starting express
var app = express()
app.use(bodyParser.json())
app.use(cors())

let paths = [
	'/',
	'/:a',
	'/:a/:b',
	'/:a/:b/:c',
	'/:a/:b/:c/:d',
	'/:a/:b/:c/:d/:e',
]
app.get(paths, function(req, res) {
    console.log('GET')
    console.log('body', req.body)
    console.log('headers', req.headers)
    res.send({status: 1})
})
app.post(paths, function(req, res) {
    console.log('POST')
    console.log('body', req.body)
    console.log('headers', req.headers)
    res.send({status: 1})
})

app.listen(3000, function() {
    console.log('Listening on port 3000!')
})