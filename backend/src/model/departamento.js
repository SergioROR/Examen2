class Departamento{
    constructor(
        {
            id_departamento,
            nombre,
            descripcion,
            id_plantel
        }
    ){
        this.id_departamento = id_departamento;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.id_plantel = id_plantel;
    }
}

module.exports = Departamento;