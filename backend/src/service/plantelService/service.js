const Plantel = require("../../model/plantel");
const ErrorImpl = require("../../utils/errorImpl");
const { getProductosByPlantelId } = require("../productoService/db_queries");
const { getUsuariosByPlantelId } = require("../usuarioService/db_queries");
const { addPlantel, getAllPlanteles, getPlantelById, updatePlantelPrincipalById, getPlantelPrincipal } = require("./db_queries");

async function postPlantel(plantel, file){
    try{
        const nombre = plantel.nombre;
        if(!nombre){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const imagen = file ? file.filename : null;
        const data = {...plantel, imagen:imagen};
        return await addPlantel(data);
    }catch(err){
        console.error(`Error al añadir un plantel: ${err}`);
        throw err;
    }
}

async function getPlanteles(){
    try{
        const result = await getAllPlanteles();
        return result;
    }catch(err){
        console.error(`Error al consultar los planteles: ${err}`);
        throw err;
    }
}

async function getDetallePlantel(params){
    try{
        const id_plantel = params.id;
        if (!id_plantel) throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        const plantel = await getPlantelById(id_plantel);
        if (!plantel) throw new ErrorImpl("Plantel no encontrado.", 404);
        const [productos, usuarios] = await Promise.all([
            getProductosByPlantelId(id_plantel),
            getUsuariosByPlantelId(id_plantel)
        ]);
        // const result = await getProductosByPlantelId(id_plantel);
        // const usuarios = await getUsuariosByPlantelId(id_plantel);
        return {plantel, productos, usuarios};
    }catch(err){
        console.error(`Error al obtener detalles de un plantel: ${err}.`);
        throw err;
    }
}

async function updatePlantelPrincipal(params){
    try{
        const id_plantel = params.id;
        if (!id_plantel) throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        // const target = await getPlantelById(id_plantel);
        // if (!target) throw new ErrorImpl("Plantel no encontrado.", 404);
        await updatePlantelPrincipalById(id_plantel);
        // return result;
    }catch(err){
        console.error(`Error al actualizar el plantel principal: ${err}.`);
        throw err;
    }
}

async function getProductosFromPlantelPrincipal(){
    try{
        const result = await getPlantelPrincipal();
        if (!result){
            throw new ErrorImpl("Plantel principal no encontrado.", 404);
        }
        const plantel = new Plantel(result);
        return await getProductosByPlantelId(plantel.id_plantel);
    }catch(err){
        console.error(`Error al obtener los productos del plantel principal: ${err}.`);
        throw err;
    }
}

module.exports = {
    postPlantel,
    getPlanteles,
    getDetallePlantel,
    updatePlantelPrincipal,
    getProductosFromPlantelPrincipal,
}