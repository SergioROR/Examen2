const express=require("express");
const app = express();
const cors = require("cors");
const port = process.env.port || 3005
const bodyParser = require("body-parser");
const path = require("path");

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
const controller=require("./controller/controller")
app.use(controller)

app.listen(port, () => {
    console.log(`El servidor se encuentra corriendo en el puerto: ${port}`);
});