// departamentos.ts  (tu archivo de interfaces)

export interface Plantel {
  id_plantel: number;
  nombre: string;
  imagen?: string;
}

export interface Departamento {
  id_departamento: number;
  nombre: string;
  descripcion?: string;
  id_plantel: number;
}

export interface UsuarioSesion {
  id_usuario: number;  // agregado
  nombre:     string;
  plantel:    number;
  rol:        string;
}