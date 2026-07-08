// Replaces the old `SELECT * FROM companies WHERE id = ?` calls that used
// to live inside the contact monolith. contact-service no longer has
// access to the companies table - it asks company-service over HTTP.

const COMPANY_SERVICE_URL = process.env.COMPANY_SERVICE_URL || 'http://company-service:4002';

export const CompanyClient = {
    async findById(companyId) {
        try {
            const res = await fetch(`${COMPANY_SERVICE_URL}/companies/${companyId}`);
            if (!res.ok) return null;
            const body = await res.json();
            return body.company || null;
        } catch (err) {
            console.error('CompanyClient.findById error:', err.message);
            return null;
        }
    }
};
