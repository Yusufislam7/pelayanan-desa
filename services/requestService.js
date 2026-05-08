const { pool } = require('../config/db');

async function findAll(query = '') {
  let sql = 'SELECT * FROM requests ORDER BY createdAt DESC';
  let params = [];

  if (query) {
    sql = 'SELECT * FROM requests WHERE name LIKE ? ORDER BY createdAt DESC';
    params = [`%${query}%`];
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM requests WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createRequest(data) {
  const { id, name, serviceType, description, status, fileUrl, createdAt } = data;
  await pool.execute(
    'INSERT INTO requests (id, name, serviceType, description, status, fileUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, serviceType, description, status, fileUrl, createdAt]
  );
  return data;
}

async function updateRequest(id, updatedData) {
  const { name, serviceType, description, status, fileUrl } = updatedData;
  const [result] = await pool.execute(
    'UPDATE requests SET name = ?, serviceType = ?, description = ?, status = ?, fileUrl = ? WHERE id = ?',
    [name, serviceType, description, status, fileUrl, id]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return { id, ...updatedData };
}

async function deleteRequest(id) {
  const [result] = await pool.execute('DELETE FROM requests WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  createRequest,
  updateRequest,
  deleteRequest,
};