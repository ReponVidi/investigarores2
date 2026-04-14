import pkg from "pg";
const { Pool } = pkg;

/*const pool = new Pool({
    host: "10.0.13.229",
    user: "openprouser",
    password: "M10A07Q12U",
    database: "openprojectdb",
    port: 5432
});*/

//Conexion oficina- compu con Ubuntu
const pool = new Pool({
    host: "localhost",
    user: "openprouser", //Si no, probar con postgres en user
    password: "lapiz2-2025",
    database: "openprojectdb",
    port: 5432
});

//Conexion compu casa- sabri
/*const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "sayed2819",
    database: "openprojectdb",
    port: 5432
});*/

export default pool;


// Conexion compu sabrina
