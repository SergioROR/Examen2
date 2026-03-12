// registros.interfaces.ts

export interface RegistroResumen {
  id_registro:      number;
  fecha:            string;
  tipo:             'entrada' | 'salida';
  nota:             string;
  usuario:          string;   // nombre del usuario (viene del JOIN)
  departamento:     string;
  plantel:          string;
  total_productos:  number;
}

export interface RegistroDetalle {
  id_registro_produ: number;
  cantidad:          number;
  producto:          string;
  modelo:            string;
  num_serie:         string;
  descripcion:       string;
}

export interface CrearRegistro {
  tipo:             'entrada' | 'salida';
  nota?:            string;
  id_departamento:  number;
  id_plantel:       number;
  id_usuario:       number;   // ID del usuario, no el nombre
  productos:        { id_productos: number; cantidad: number }[];
}