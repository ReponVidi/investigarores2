import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    host: "10.0.13.229",
    user: "openprouser",
    password: "M10A07Q12U",
    database: "openprojectdb",
    port: 5432
});

export default pool;