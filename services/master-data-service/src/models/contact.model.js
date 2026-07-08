import { db } from '../utils/database.js';

// NOTE: This model only ever touches the `contacts` table. Anything that
// used to join into companies/projects/tasks/tickets/users has been
// removed - that data now lives behind company-service, task-project-service,
// ticket-service and is composed at the api-gateway layer instead.

export const Contact = {
    async checkContactExists(email, mobile_no, excludeId = null) {
        let sql = 'SELECT id FROM contacts WHERE (email = ? OR mobile_no = ?) AND status = 1';
        const params = [email, mobile_no];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const rows = await db.query(sql, params);
        return rows.length > 0;
    },

    async create(data, createdBy) {
        const { contact_name, email, mobile_no, designation, company_id } = data;
        const result = await db.query(
            `INSERT INTO contacts
                (contact_name, email, mobile_no, designation, company_id, status, create_date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 1, CURDATE(), NOW(), NOW())`,
            [contact_name, email, mobile_no, designation, company_id]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { contact_name, email, mobile_no, designation, company_id } = data;
        await db.query(
            `UPDATE contacts
                SET contact_name = ?, email = ?, mobile_no = ?, designation = ?,
                    company_id = ?, updated_at = NOW()
              WHERE id = ?`,
            [contact_name, email, mobile_no, designation, company_id, id]
        );
        return true;
    },

    async softDelete(id) {
        await db.query('UPDATE contacts SET status = 0, updated_at = NOW() WHERE id = ?', [id]);
        return true;
    },

    async findById(id) {
        const rows = await db.query('SELECT * FROM contacts WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async list() {
        return db.query('SELECT * FROM contacts WHERE status = 1 ORDER BY created_at DESC');
    },

    async listActiveByCompanyId(companyId) {
        return db.query(
            'SELECT * FROM contacts WHERE company_id = ? AND status = 1 ORDER BY contact_name ASC',
            [companyId]
        );
    },

    async datatableList({ page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', search = '' }) {
        const allowedSort = ['id', 'contact_name', 'email', 'mobile_no', 'designation', 'created_at', 'updated_at'];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
        const dir = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const offset = (Math.max(page, 1) - 1) * limit;

        const params = [];
        let where = 'WHERE status = 1';
        if (search) {
            where += ' AND (contact_name LIKE ? OR email LIKE ? OR mobile_no LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const totalRows = await db.query(`SELECT COUNT(*) as total FROM contacts ${where}`, params);
        const total = totalRows[0]?.total || 0;

        const contacts = await db.query(
            `SELECT * FROM contacts ${where} ORDER BY ${sortColumn} ${dir} LIMIT ? OFFSET ?`,
            [...params, Number(limit), Number(offset)]
        );

        return { contacts, total };
    },

    async setExternalId(id, externalId) {
        await db.query('UPDATE contacts SET external_id = ?, updated_at = NOW() WHERE id = ?', [externalId, id]);
        return true;
    }
};
