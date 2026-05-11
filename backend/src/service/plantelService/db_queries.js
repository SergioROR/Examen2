const db = require("../../db/db");
const ErrorImpl = require("../../utils/errorImpl");
const { getUsuarioByCorreo, getUsuariosByPlantelId } = require("../usuarioService/db_queries");

async function addPlantel(data){
    const client = await db.connect();
    try{
        await client.query("BEGIN");

        // crear el plantel
        const result = await client.query(
            "INSERT INTO planteles(nombre, imagen) VALUES ($1, $2) RETURNING *",
            [data.nombre, data.imagen]
        );
        
        const plantel = result.rows[0];
        
        // añadir departamentos al plantel recien creado
        await client.query(
            `INSERT INTO departamento (nombre, descripcion, id_plantel) VALUES
            ('Control de Equipos y Soporte', 'Departamento de control de equipos y soporte técnico', $1)`,
            [plantel.id_plantel]
        );

        await client.query("COMMIT");

        return plantel;
    }catch(err){
        if (client) await client.query("ROLLBACK");
        console.error(`Error en la base de datos al añadir un plantel: ${err}.`);
        throw new ErrorImpl("Error al añadir un plantel.", 500);
    }finally{
        if (client) client.release();
    }  
}

async function getPlantelById(id_plantel){
    try{
        const result = await db.query(
            `SELECT * FROM planteles WHERE id_plantel = $1`, [parseInt(id_plantel)]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al consultar un plantel por su id. ${err}.`);
        throw new ErrorImpl("Error al consultar plantel por su identificador.", 500);
    }
}

async function getAllPlanteles(){
    try{
        const result = await db.query(
            `SELECT id_plantel, nombre, imagen from planteles`
        );
        return result.rows;
    }catch(err){
        console.error(`Error en la base de datos al consultar los planteles: ${err}.`);
        throw new ErrorImpl("Error al consultar los planteles.", 500);
    }
}

async function getPlantelPrincipal(){
    try{
        const result = await db.query(
            `SELECT id_plantel, nombre, imagen from planteles
            WHERE es_principal = true`
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al obtener el plantel principal: ${err}.`);
        throw new ErrorImpl("Error al obtener el plantel principal.", 500);
    }
}

async function updatePlantelPrincipalById(id_nuevo_plantel_principal){
    const client = await db.connect();
    try{
        await client.query("BEGIN");
        const result = await client.query(
            `UPDATE planteles
            SET es_principal = (id_plantel = $1)
            WHERE id_plantel = $1 OR es_principal = true
            RETURNING id_plantel, es_principal
            `, [parseInt(id_nuevo_plantel_principal)]
        );
        
        if (!result.rows.some(r => r.es_principal === true)) {
            throw new ErrorImpl("Plantel no encontrado.", 404);
        }
        await client.query("COMMIT");
        // return result.rows;
    }catch(err){    
        if(client) await client.query("ROLLBACK");
        console.error(`Error en la base de datos al actualizar el plantel principal: ${err}.`)
        throw err instanceof ErrorImpl ? err : new ErrorImpl("Error al actualizar plantel principal.", 500);
    } finally {
        if(client) client.release();
    }
}

module.exports = {
    addPlantel,
    getPlantelById, 
    getAllPlanteles,
    updatePlantelPrincipalById,
    getPlantelPrincipal,
}