const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'echis',
    connectionLimit: 5
});

async function createTableIfNotExists(tableName, doc) {
    let connection;
    try {
        connection = await pool.getConnection();
        const columns = Object.keys(doc).map(key => `${key} TEXT`).join(', ');
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (id VARCHAR(255) PRIMARY KEY, ${columns})`;
        await connection.query(createTableQuery);
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        if (connection) await connection.end();
    }
}

async function insertDocument(tableName, doc) {
    let connection;
    try {
        connection = await pool.getConnection();
        // Check if 'id' field exists, if not assign a random value
        if (!doc.hasOwnProperty('id')) {
            doc.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        const columns = Object.keys(doc).join(', ');
        const values = Object.values(doc).map(value => {
            // Check if value is an object, if it is, stringify it
            if (typeof value === 'object' && value !== null) {
                return `'${JSON.stringify(value)}'`;
            }
            return `'${value}'`;
        }).join(', ');
        const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${values}) ON DUPLICATE KEY UPDATE ${Object.keys(doc).map(key => `${key}=VALUES(${key})`).join(', ')}`;
        await connection.query(insertQuery);
    } catch (err) {
        console.error('Error inserting document:', err);
    } finally {
        if (connection) await connection.end();
    }
}
module.exports = { createTableIfNotExists, insertDocument };
