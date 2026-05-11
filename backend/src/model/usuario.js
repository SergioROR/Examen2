class Usuario{
    constructor(
        {
            id_usuario, 
            nombre, 
            apellidos, 
            correo, 
            contraseña, 
            rol, 
            id_plantel, 
            imagen, 
            esta_activo
        }
    ){
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.correo = correo;
        this.contraseña = contraseña;
        this.rol = rol;
        this.id_plantel = id_plantel;
        this.imagen = imagen;
        this.esta_activo = esta_activo;
    }
}

module.exports = Usuario