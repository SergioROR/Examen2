const {connection} = require("pg")
const {user,password}= require("pg/lib/defaults")

const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const pgsqlPool= require("pg").Pool

const pool=new pgsqlPool({
    user:process.env.POSTGRES_USER,
    password:process.env.POSTGRES_PASSWORD,
    database:process.env.POSTGRES_DB,
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