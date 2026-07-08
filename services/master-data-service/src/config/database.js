import mysql from 'mysql2/promise';

// XAMPP MySQL connection for local development
// These values match the root .env file: DB_USER=root, DB_PASSWORD=(empty), DB_NAME=company_contact
const pool = mysql.createPool({
    host:               'localhost',
    port:               3306,
    user:               'root',
    password:           '',
    database:           'company_contact',
    waitForConnections: true,
    connectionLimit:    10
});

export const db = {
    query: async (sql, params = []) => {
        const [rows] = await pool.query(sql, params);
        return rows;
    }
};
