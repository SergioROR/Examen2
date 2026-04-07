export interface Plantel {
  id_plantel:   number;
  nombre:       string;
  imagen?:      string;
  es_principal: boolean;
}

export interface DetallePlantel {
  plantel:   Plantel;
  productos: any[];
  usuarios:  any[];
}