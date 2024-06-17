const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Sirve los archivos estáticos desde la carpeta 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Maneja todas las solicitudes GET y las redirige al archivo 'index.html'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Inicia el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor React iniciado en el puerto ${port}`);
});
