class Plantel{
    constructor({
        id_plantel,
        nombre,
        imagen, 
        es_principal
    }
    ){
        this.id_plantel = id_plantel;
        this.nombre = nombre;
        this.imagen = imagen;
        this.es_principal = es_principal;
    }
}

module.exports = Plantel;