export interface Usuario {
    nombre: string,
    apellidos: string,
    correo: string,
    password: string,
    rol: string,
    id_plantel: number,
    estado: boolean
}

export interface UsuarioC {
    nombre: string;
    apellidos: string;
    correo: string;
    password: string;
    rol: string;
    id_plantel: string;
}

export interface RespuestaApi {
  verificacion: boolean;
  mensaje: string;
}

export interface RespuestaCambioEstado extends RespuestaApi {
  nuevoEstado?: boolean;
  correo?: string;
}
