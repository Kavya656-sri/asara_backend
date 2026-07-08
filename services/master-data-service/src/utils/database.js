import mysql from 'mysql2/promise';
// XAMPP local dev — hardcoded because bare dotenv.config() cannot find the
// root .env from a nested service working directory.
const pool = mysql.createPool({
    host:               'localhost',
    port:               3306,
    user:               'root',
    password:           '',
    database:           'company_contact',
    waitForConnections: true,
    connectTimeout:     5000,
    connectionLimit:    10,
    queueLimit:         0
});

// Thin wrapper matching the `db.query(sql, params)` shape used in the
// original monolith model files, so controllers/models port over with
// minimal changes.
export const db = {
    query: async (sql, params = []) => {
        const [rows] = await pool.query(sql, params);
        return rows;
    }
};

export default pool;
