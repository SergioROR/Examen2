const {connection} = require("pg")
const {user,password}= require("pg/lib/defaults")

const pgsqlPool= require("pg").Pool

const pool=new pgsqlPool({
    user:"postgres",
    password:"Sergio12",
    database:"inventario",
    host:"localhost",
    port: 5432,
    max:10
})

pool.connect((err, connection)=>{
    if(err) throw err;
    console.log(`Conexion exitosa con el gestor de BD PostgreSQL`)
    connection.release()
})

module.exports=pool;