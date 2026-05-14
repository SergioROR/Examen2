const Departamento = require("../../model/departamento");
const ErrorImpl = require("../../utils/errorImpl");
const { getAllDepartamentos, getDepartamentoByName, addDepartamento, getDepartamentoById } = require("../departamentoService/db_queries");

async function getDepartamentos() {
    try {
        const result = await getAllDepartamentos();
        return result;
    } catch (err) {
        console.error(`Error al consultar los departamentos: ${err}`);
        throw err;
    }
}

async function getDepartamentosByPlantelId(id_plantel) {
    try {
        const result = await getDepartamentoById(id_plantel);
        return result;
    } catch (err) {
        console.error(`Error al obtener los departamentos del plantel: ${err}.`);
        throw err;
    }
}

async function postDepartamento(params) {
    console.log("DATA RECEIVED FROM FRONTEND:", params);

    const { nombre, descripcion, id_plantel } = params;
    if (!nombre || !descripcion || id_plantel==null) {
        throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
    }
    try {
        const data = { nombre, descripcion, id_plantel };
        return await addDepartamento(data);
    } catch (error) {
        console.error(`Error al agregar el departamento: ${error}.`);
        throw error;
    }
}

async function postDepartamentoByUsuario(params) {
    // Crea departamento en el plantel del usuario en sesión
    try {
        console.log("DATA RECEIVED FROM FRONTEND:", params);
        const { nombre, descripcion, id_plantel } = params;
        if (!nombre || !descripcion || id_plantel==null) {
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        // Verificar que no exista ya ese nombre en el mismo plantel
        const existe = await getDepartamentoByName(nombre, id_plantel);
        if (existe.rows.length > 0) {
            throw new ErrorImpl("Ya existe un departamento con ese nombre en este plantel.", 400);
        }
        const data = { nombre, descripcion, id_plantel };
        return await addDepartamento(data);
    } catch (err) {
        console.error(`Error al agregar el departamento: ${err}.`);
        throw err;
    }
}

module.exports = {
    getDepartamentos,
    getDepartamentosByPlantelId,
    postDepartamento,
    postDepartamentoByUsuario,
}
