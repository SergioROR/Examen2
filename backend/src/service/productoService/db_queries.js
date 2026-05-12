const ErrorImpl = require("../../utils/errorImpl");

async function getProductosByPlantelId(id_plantel){
    try{
        const result = await db.query(
            `SELECT * FROM vista_departamento_productos
            WHERE id_plantel = $1
            ORDER BY nombre ASC`,
            [parseInt(id_plantel)]
        );
        return result.rows
    }catch(err){
        console.error(`Error en la base de datos al obtener los productos relacionados con un plantel: ${err}.`);
        throw new ErrorImpl("Error al obtener los productos relacionados con un plantel.", 500);
    }
}

async function getAllProductos(){
    try{
        const result = await db.query(
            `SELECT * FROM vista_departamento_productos
            ORDER BY creado_el DESC
            `);
        return result.rows;
    }catch(err){
        console.error(`Error en la base de datos al consultar todos los productos, sus departamentos y sus respectivos planteles: ${err}`);
        throw new ErrorImpl("Error al obtener los productos.", 500);
    }
}

async function getProductoById(id_producto){
    try{
        const result = await db.query(
            `SELECT * FROM vista_departamento_productos
            WHERE id_producto = $1
            `, [parseInt(id_producto)]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al consultar un producto por su identificador: ${err}.`);
        throw new ErrorImpl("Error al obtener el producto.", 500);
    }
}

// async function addCantidadToProductoIfExists(producto){
//     try{
//         const {cantidad, num_serie, id_departamento} = producto;
//         const result = await db.query(`
//             UPDATE productos 
//             SET cantidad = cantidad + $1, 
//                 actualizado_el = NOW()
//             WHERE num_serie = $2 AND (SELECT d.id_plantel FROM departamentos d WHERE d.id_departamento = $3)
//             RETURNING *`, [parseInt(cantidad), num_serie, parseInt(id_plantel)]);
//         return result;
//     }catch(err){
//         console.error(`Error en la base de datos al modificar la cantidad de un producto: ${err}.`);
//         throw new ErrorImpl("Error al modificar la cantidad del producto.", 500);
//     }
// }

async function addProducto(producto){
    try{
        const { nombre, descripcion, modelo, num_serie, cantidad, id_departamento } = producto;
        const result = await db.query(
            `INSERT INTO productos (nombre, descripcion, modelo, cantidad, num_serie, id_departamento)
            VALUES ($1, $2, $3, $4, $5, $6) 
            ON CONFLICT ON CONSTRAINT ui_producto_plantel 
            DO UPDATE SET
                cantidad = productos.cantidad + EXCLUDED.cantidad,
                actualizado_el = NOW()
            RETURNING *, (xmax = 0) AS es_nuevo`,
            [nombre, descripcion || null, modelo, cantidad, num_serie, id_departamento]
        );
        return result.rows[0];
    }catch(err){
        console.error(`Error en la base de datos al añadir un nuevo producto: ${err}.`);
        throw new ErrorImpl("Error al añadir un nuevo producto.", 500);
    }
}

async function updateProductoCantidad(id_producto, operacion, cantidad){
    try{
        const signo = operación === "agregar" ? "+" : "-";
        const result = await db.query(
            `UPDATE productos 
            SET cantidad = cantidad ${signo} $2
                actualizado_el = NOW()
            WHERE id_producto = $1 AND (($3 = 'agregar') OR (cantidad >= $2))
            RETURNING *`,
            [parseInt(id_producto), parseInt(cantidad), operacion]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al actualizar la cantidad del producto: ${err}.`);
        throw new ErrorImpl("Error al actualizar la cantidad del producto.", 500);
    }
}

module.exports = {
    getProductosByPlantelId,
    getAllProductos,
    getProductoById,
    addProducto,
    updateProductoCantidad
}