const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env')});

const port = process.env.SERVER_PORT;

const app = express();
app.use(helmet(
    {crossOriginEmbedderPolicy: true, }
));
app.use(cors(
    {origin: 'http://localhost:4200',
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']   
    }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}));

// for catching unhandled errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({mensaje: 'Error interno del servidor.'});
});

app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
const controller=require("./controller/controller")
app.use(controller)

app.listen(port, () => {
    console.log(`El servidor se encuentra corriendo en el puerto: ${port}`);
});