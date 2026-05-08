require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'pelayanan_desa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

async function initDb() {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log('Mencoba koneksi ke database...');
      const connection = await pool.getConnection();
      console.log('Database terhubung.');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS requests (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          serviceType VARCHAR(255),
          description TEXT,
          status VARCHAR(100),
          fileUrl TEXT,
          createdAt DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('Table requests siap.');
      connection.release();
      return;
    } catch (error) {
      console.error(`Gagal koneksi database (retry ${6 - retries}/5):`, error.message);
      retries--;
      if (retries > 0) {
        console.log('Menunggu 5 detik sebelum retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  throw new Error('Gagal inisialisasi database setelah 5 retry.');
}

module.exports = {
  pool,
  initDb,
};
