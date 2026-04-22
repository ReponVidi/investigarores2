import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "123456",
    database: "open_project",
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