const {connection} = require("pg")
const {user,password}= require("pg/lib/defaults")

const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const pgsqlPool= require("pg").Pool

const pool=new pgsqlPool({
    user:process.env.POSTGRES_USER,
    password:process.env.POSTGRES_PASSWORD,
    database:process.env.POSTGRES_DB,
    host:process.env.POSTGRES_DB_HOST,
    port: parseInt(process.env.POSTGRES_DB_PORT),
    max:10,
    idleTimeoutMillis: 30000, //Close inactive clients after 30 seconds
    connectionTimeoutMillis: 3000, // Returns an error after 3 seconds if no conecction was stablished
    maxUses: 2000   // Close and replace a conecction after being used 2000 times
                    // maxUses = rebalanceWindowSeconds + totalRequestsPerSecond / numAppInstances / poolSize
});

pool.connect((err, connection)=>{
    if(err){
        console.error(`Error al conectarse con PostgreSQL: ${err.message}`);
        return;
    }
    console.log("Conexion exitosa con el gestor de bases de datos PostgreSQL");
    connection.release();
});

module.exports=pool;