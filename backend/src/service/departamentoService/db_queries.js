const db = require("../../db/db"); //import db conection
const ErrorImpl = require("../../utils/errorImpl");//import custom error class to throw errors with HTTP status code


async function getAllDepartamentos() {
    try {
        const result = await db.query("SELECT id_departamento, nombre, descripcion, id_plantel FROM departamentos ORDER BY nombre");
        return result.rows;
    } catch (error) {
        console.error(`Error en la base de datos al consultar los departamentos. ${error}.`);
        throw new ErrorImpl("Error al consultar los departamentos", 500);
    }
}

async function getDepartamentoByName(name, id_plantel) {
    try {
        const result = await db.query(
            `SELECT id_departamento FROM departamentos
             WHERE LOWER(nombre) = LOWER($1) AND id_plantel = $2`,
            [name, parseInt(id_plantel)]
        );
        return result;
    } catch (err) {
        console.error(`Error en la base de datos al buscar un departamento: ${err}.`);
        throw new ErrorImpl("Error al buscar departamento por su nombre.", 500);
    }
}
async function getDepartamentoById(id_plantel) {
    try {
        const result = await db.query(
            "SELECT id_departamento, nombre, descripcion, id_plantel FROM departamentos WHERE id_plantel = $1 ORDER BY nombre",
            [parseInt(id_plantel)]
        );
        return result.rows;
    } catch (err) {
        console.error(`Error en la base de datos al buscar un departamento por su id: ${err}.`);
        throw new ErrorImpl("Error al buscar departamento por su id.", 500);
    }
}

async function addDepartamento(data) {
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(
            `INSERT INTO departamentos (nombre, descripcion, id_plantel)
       VALUES ($1, $2, $3) RETURNING *`,
            [data.nombre, data.descripcion, parseInt(data.id_plantel)]
        );
        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        if (client) await client.query("ROLLBACK");
        console.error(`Error en la base de datos al crear un departamento. ${err}.`);
        throw new ErrorImpl("Error al crear departamento.", 500);
    } finally {
        if (client) client.release();
    }
}


module.exports = {
    getAllDepartamentos,
    getDepartamentoByName,
    getDepartamentoById,
    addDepartamento
};
