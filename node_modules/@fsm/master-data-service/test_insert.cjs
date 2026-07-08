const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'company_contact'
}).then(async (conn) => {
  try {
    const [rows] = await conn.query(
      "INSERT INTO contacts (contact_name, email, mobile_no, designation, company_id, status, create_date, created_at, updated_at) VALUES ('John Doe', 'john.doe@example.com', '9876543210', 'Manager', 717, 1, CURDATE(), NOW(), NOW())"
    );
    console.log('INSERT OK', rows);
  } catch (e) {
    console.error('QUERY ERR', e.message);
  } finally {
    process.exit(0);
  }
}).catch(e => console.error('DB ERR', e.message));
