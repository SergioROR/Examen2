const ErrorImpl = require("../../utils/errorImpl");
const { isAnIntegerNumber } = require("../../utils/quantity_validators");
const { getAllProductos, getProductoById, addProducto } = require("./db_queries");

async function getProductos() {
    try{
        const result = await getAllProductos();
        if (result.length === 0) throw new ErrorImpl("No se encontró ningún producto registrado.", 404);
        return result;
    }catch(err){
        console.error(`Error al consultar los productos: ${err}.`);
        throw err;
    }
}

async function getProducto(body){
    try{
        const { id_producto } = body;
        if (!id_producto || !isAnIntegerNumber(id_producto)){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos o formato inadecuado.", 400);
        } 
        const data = await getProductoById(id_producto);
        if(!data) throw new ErrorImpl("Producto no encontrado.", 404);
        return data;
    }catch(err){
        console.error(`Error al consultar producto: ${err}.`);
        throw err;
    }
}

async function postProduct(body){
    try{
        const product = new Producto(body);
        const required = ['nombre', 'modelo', 'num_serie', 'cantidad', 'id_departamento'];
        const skipped = [];
        
        for (const [key, value] of Object.entries(product)) {
            if (required.includes(key) && (value === null || value === undefined || value === '')){
                skipped.push(key);
            }
        }

        if (skipped.length > 0) throw new ErrorImpl(`Faltan campos requeridos: ${skipped.join(', ')}`, 400);
        if(!isAnIntegerNumber(product.cantidad)) throw new ErrorImpl(`La cantidad debe ser un número entero positivo.`, 400);
        
        const result = await addProducto(product);
        const {es_nuevo, cantidad} = result;
        let [mensaje, accion] = es_nuevo 
            ? ["Producto creado correctamente.", "creado"] 
            : [`Producto ya existente. Se agregaron ${cantidad} unidades.`, "cantidad_actualizada"];
        
        return {mensaje, accion, result};
        
    }catch(err){
        console.error(`Error al insertar un producto: ${err}.`);
        throw err;
    }
}

module.exports = {
    getProductos,
    getProducto,
    postProduct

}