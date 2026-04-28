// registros.interfaces.ts

export interface RegistroResumen {
  id_registro:        number;
  fecha:              string;
  tipo:               'entrada' | 'salida';
  id_departamento:    number;
  departamento:       string;
  plantel:            string;       // plantel destino (salida) o plantel propio (entrada)
  plantel_origen:     string | null; // plantel que hizo la salida
  total_movimientos:  number;
  total_productos:    number;
  usuario:            string;
}

export interface RegistroDetalle {
  id_registro:  number;
  hora:         string;
  nota:         string;
  usuario:      string;
  producto:     string;
  modelo:       string;
  num_serie:    string;
  descripcion:  string;
  cantidad:     number;
}

export interface CrearRegistro {
  tipo:              'entrada' | 'salida';
  nota?:             string;
  id_departamento:   number;
  id_plantel:        number;
  id_usuario:        number;
  id_plantel_origen?: number;
  productos:         { id_productos: number; cantidad: number }[];
}