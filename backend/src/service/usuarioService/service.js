
const Usuario = require("../../model/usuario");
const ErrorImpl = require("../../utils/errorImpl");
const { getUsuarioByCorreo, addUsuario, getAllUsuarios, updateUsuarioById, updateContraseñaByCorreo, updateEstadoByCorreo, getImagenById, updateImagenById } = require("./db_queries");
const bcrypt = require("bcrypt");

const SALTROUNDS = 10;
async function logUsuarioIn({correo, contraseña}) {
   try{
        if (!correo || !contraseña){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const usuario = await getUsuarioByCorreo(correo);

        if (usuario === null || usuario.esta_activo === false){
            throw new ErrorImpl("Correo o contraseña incorrectos.", 401);
        }
        
        const match = await bcrypt.compare(contraseña, usuario.contraseña);
        if (match){
            return new Usuario(usuario);
        }else{
            throw new ErrorImpl("Correo o contraseña incorrectos.", 401)
        }
   } catch(err){
        console.error(`Error al iniciar sesión: ${err}.`)
        // throw new Error("No ha sido posible iniciar sesión.")
        throw err;
   }
}

async function postUsuario(usuario){
    try{
        const { nombre, apellidos, correo, password, rol, id_plantel} = usuario;
        if(!nombre || !apellidos || !correo || !password || !rol || !id_plantel){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const existentUser = await getUsuarioByCorreo(correo);
        if (existentUser !== null){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);
        const data = {...new Usuario(usuario), contraseña: hashedPassword};
        const result = await addUsuario(data);
        return new Usuario(result); 
    }catch(err){
        console.error(`Error al crear usuario: ${err}.`);
        throw err;
    }
}

async function getUsuarios(){
    try{
        return await getAllUsuarios();
    }catch(err){
        throw err;
    }
} 

async function updateUsuario(usario){
    try{
        const { id_usuario } = usario;
        if(!id_usuario){
            throw new ErrorImpl("La petición no ha podido completarse por ausencia de campos obligatorios.", 400);
        }
        const result = await updateUsuarioById(usario);
        if (result === null){
            throw new ErrorImpl("Usuario no encontrado.", 404);
        }
        return result;
    }catch(err){
        console.error(`Eror al actualizar usuario con id: ${id_usuario}. ${err}`);
        throw err;
    }
}

async function updateContraseña(usuario){
    try{
        const {correo, password} = usuario;
        if (!correo || !password){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);
        const result = await updateContraseñaByCorreo(correo, hashedPassword);
        if (result === null){
            throw new ErrorImpl(`Usuario no encontrado: ${correo}`, 404);
        }
        return new Usuario(result);
    }catch(err){
        console.error(`Eror al actualizar la contraseña del usuario. ${err}`);
        throw err;
    }
}

async function toggleUsuarioEstado(usuario){
    try{
        const {correo, estado} = usuario;
        if (!correo || estado === undefined || estado === null){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const result = await updateEstadoByCorreo(correo, estado);
        if (result === null){
            throw new ErrorImpl(`Usuario no encontrado: ${correo}`, 404);
        }
        return new Usuario(result);
    }catch(err){
        console.error(`Eror al actualizar el estado del usuario. ${err}`);
        throw err;
    }
}

async function getImagen(params){
    try{
        const id_usuario = params.id;
        if (!id_usuario){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        } 
        const result = await getImagenById(id_usuario);
        if (result === null) {
            throw new ErrorImpl("Usuario no encontrado.", 404);
        }
        return result.imagen;
    }catch(err){
        console.error(`Error al obtener la imagen del usuario: ${err}.`);
        throw err;
    }
}

async function updateImagen(usuario){
    try{
        const { id_usuario, imagen } = usuario;
        if(!id_usuario || !imagen){
            throw new ErrorImpl("La acción no ha podido completarse debido a la ausencia de campos requeridos.", 400);
        }
        const result = await updateImagenById(id_usuario, imagen);
        if (result === null){
            throw new ErrorImpl("Usuario no encontrado.", 404);
        }
        return result.imagen;
    }catch(err){
        console.error(`Error al actualizar la imagen del usuario: ${err}.`);
        throw err;
    }
}

module.exports = { 
    logUsuarioIn, 
    postUsuario, 
    getUsuarios, 
    updateUsuario, 
    updateContraseña, 
    toggleUsuarioEstado,
    getImagen,
    updateImagen,
}