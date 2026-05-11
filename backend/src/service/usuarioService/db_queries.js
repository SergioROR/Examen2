const db = require("../../db/db");
const ErrorImpl  = require("../../utils/errorImpl");

async function getUsuarioByCorreo (correo){
    try{
        const result = await db.query(
            "SELECT id_usuario, correo, contraseña, nombre, rol, id_plantel, esta_activo, imagen FROM usuarios WHERE correo = $1",
            [correo]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al obtener un usuario por su correo: ${err}`);
        throw new ErrorImpl(`No ha sido posible consultar al usuario: ${correo}.`, 500);
    }
}

async function getUsuariosByPlantelId(id_plantel){
    try{
        const result = await db.query(
            `SELECT u.nombre, u.apellidos, u.correo, u.rol, u.estado, u.imagen
            FROM usuarios u
            WHERE u.id_plantel = $1
            ORDER BY u.rol, u.nombre ASC`, [parseInt(id_plantel)]
        );
        return result.rows;
    }catch(err){
        console.error(`Error en la base de datos al obtener los usuarios relacionados a un plantel: ${err}`);
        throw new ErrorImpl(`No ha sido posible consultar los usuarios de un plantel.`, 500);
    }
}

async function addUsuario (usuario){
    try{
        const result = await db.query(
            `INSERT INTO usuarios (nombre, apellidos, correo, contraseña, rol, id_plantel, imagen) 
                VALUES ($1,$2,$3,$4,$5,$6,$7) 
                RETURNING id_usuario, nombre, apellidos, correo, rol, id_plantel, imagen`,
            [usuario.nombre, usuario.apellidos, usuario.correo, usuario.contraseña, usuario.rol, parseInt(usuario.id_plantel), usuario.imagen || null]
        );
        return result.rows[0];
    }catch(err){
        console.error(`Error en la base de datos al añadir un usuario: ${err}`);
        throw new ErrorImpl(`No ha sido posible añadir al usuario: ${usuario.correo}.`, 500);
    }
}

async function getAllUsuarios(){
    try{
        const result = await db.query ( 
            `
                SELECT u.id_usuario, u.nombre, u.apellidos, u.rol, u.correo,
                u.esta_activo, u.imagen, p.nombre AS planteles, u.id_plantel
                FROM usuarios u
                INNER JOIN planteles p ON u.id_plantel = p.id_plantel
            `
        );
        return result.rows;
    }catch(err){
        console.error(`Error en la base de datos al consultar los usuarios: ${err}`);
        throw new ErrorImpl("Error al consultar los usuarios.", 500);
    }
}

async function updateUsuarioById(usuario){
    try{
        const result = await db.query(
            `
                UPDATE usuarios SET
                    nombre     = COALESCE($1, nombre),
                    apellidos  = COALESCE($2, apellidos),
                    correo     = COALESCE($3, correo),
                    rol        = COALESCE($4, rol),
                    id_plantel = COALESCE($5, id_plantel)
                WHERE id_usuario = $6 RETURNING id_usuario, nombre, apellidos, correo, rol, id_plantel
            `, [usuario.nombre || null, usuario.apellidos || null, 
                usuario.correo || null, usuario.rol || null, 
                parseInt(usuario.id_plantel) || null, 
                parseInt(usuario.id_usuario)]
            );
        
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al actualizar usuario: ${err}`);
        throw new ErrorImpl("Error al actualizar el usuario.", 500);
    }
}

async function updateContraseñaByCorreo(correo, contraseña){
    try{
        const result = await db.query(
            `
            UPDATE usuarios SET contraseña = $1 
            WHERE correo = $2 
            RETURNING id_usuario, nombre, apellidos, correo, rol, id_plantel`,
            [contraseña, correo]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error al actualizar la contraseña: ${err}.`);
        throw new ErrorImpl(`Error al actualizar la contraseña para el usuario: ${correo}.`, 500);
    }
}

async function updateEstadoByCorreo(correo, esta_activo){
    try{
        const result = await db.query(
            `
            UPDATE usuarios SET esta_activo = $1 
            WHERE correo = $2
            RETURNING id_usuario, nombre, apellidos, correo, rol, id_plantel, esta_activo
            `, [esta_activo, correo]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al actualizar el estado del usuario: ${err}.`);
        throw new ErrorImpl(`Error al actualizar el estado del usuario: ${correo}.`, 500);
    }
}

async function getImagenById(id_usuario){
    try{
        const result = await db.query(
            `SELECT imagen FROM usuarios WHERE id_usuario = $1`,
            [parseInt(id_usuario)]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al intentar obtener la imagen del usuario con identificador: ${id_usuario}. ${err}.`);
        throw new ErrorImpl("Error al intentar obtener la imagen del usuario.", 500);
    }   
}

async function updateImagenById(id_usuario, imagen){
    try{
        const result = await db.query(
            `UPDATE usuarios SET imagen = $1 WHERE id_usuario = $2 RETURNING imagen`,
            [imagen, parseInt(id_usuario)]
        );
        return result.rowCount > 0 ? result.rows[0] : null;
    }catch(err){
        console.error(`Error en la base de datos al actualizar la imagen del usuario: ${err}.`);
        throw new ErrorImpl("Error al actualizar la imagen del usuario.", 500);
    }
}

module.exports = { 
    getUsuarioByCorreo,
    getUsuariosByPlantelId, 
    addUsuario, 
    getAllUsuarios, 
    updateUsuarioById, 
    updateContraseñaByCorreo, 
    updateEstadoByCorreo,
    getImagenById,
    updateImagenById
}
