import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    host: "localhost",
    user: "openprouser",
    password: "M10A07Q12U",
    database: "openprojectdb",
    port: 5432
});

/*const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "sayed2819",
    database: "openprojectdb",
    port: 5432
});*/

export default pool;