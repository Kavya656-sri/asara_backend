import { Contact } from '../models/contact.model.js';
import { publishContactEvent } from '../events/publisher.js';

// NOTE: Freshdesk sync used to happen synchronously right here, blocking
// the HTTP response on an external API call. That logic has moved to
// integration-freshdesk-service, which listens for `contact.created` /
// `contact.updated` events (see events/publisher.js + docker-compose.yml).

export const createContact = async (req, res) => {
    try {
        const exists = await Contact.checkContactExists(req.body.email, req.body.mobile_no);
        if (exists) {
            return res.status(409).json({
                status: 409,
                message: 'Contact with this email or mobile number already exists'
            });
        }

        const contactId = await Contact.create(req.body);
        const contact = await Contact.findById(contactId);

        await publishContactEvent('contact.created', contact);

        res.status(201).json({
            status: 201,
            message: 'Contact created successfully',
            contact
        });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ status: 500, message: 'Failed to create contact', error: error.message });
    }
};

export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;

        const exists = await Contact.checkContactExists(req.body.email, req.body.mobile_no, id);
        if (exists) {
            return res.status(409).json({
                status: 409,
                message: 'Contact with this email or mobile number already exists'
            });
        }

        await Contact.update(id, req.body);
        const contact = await Contact.findById(id);

        await publishContactEvent('contact.updated', contact);

        res.json({
            status: 200,
            message: 'Contact updated successfully',
            contact
        });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ status: 500, message: 'Failed to update contact' });
    }
};

// Called by integration-freshdesk-service once it has created/updated the
// contact in Freshdesk and knows the external_id. Keeps contact-service as
// the sole owner of writes to its own table.
export const setExternalId = async (req, res) => {
    try {
        const { id } = req.params;
        const { external_id } = req.body;
        if (!external_id) {
            return res.status(400).json({ status: 400, message: 'external_id is required' });
        }
        await Contact.setExternalId(id, external_id);
        res.json({ status: 200, message: 'External ID updated' });
    } catch (error) {
        console.error('setExternalId error:', error);
        res.status(500).json({ status: 500, message: 'Failed to update external_id' });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.softDelete(id);
        await publishContactEvent('contact.deleted', { id });
        res.json({ status: 200, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ status: 500, message: 'Failed to delete contact' });
    }
};

export const listContacts = async (req, res) => {
    try {
        const contacts = await Contact.list();
        res.json({ status: 200, message: 'Contacts retrieved successfully', contacts });
    } catch (error) {
        console.error('List contacts error:', error);
        res.status(500).json({ status: 500, message: 'Failed to retrieve contacts' });
    }
};

export const listActiveContactsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        if (!companyId) {
            return res.status(400).json({ status: 400, message: 'Company ID is required' });
        }
        const contacts = await Contact.listActiveByCompanyId(companyId);
        res.json({ status: 200, message: 'Active contacts retrieved successfully', contacts });
    } catch (error) {
        console.error('List active contacts by company error:', error);
        res.status(500).json({ status: 500, message: 'Failed to retrieve active contacts' });
    }
};

// Bare contact record only. The old getContactDetailsPage joined in
// companies/projects/tasks/tickets - that composition now happens in
// api-gateway/src/routes/contact-aggregate.routes.js, which calls this
// endpoint plus the other services and merges the results.
export const getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ status: 404, message: 'Contact not found' });
        }
        res.json({ status: 200, message: 'Contact fetched successfully', contact });
    } catch (error) {
        console.error('getContact error:', error);
        res.status(500).json({ status: 500, message: 'Error fetching contact', error: error.message });
    }
};

export const datatablecontacts = async (req, res) => {
    try {
        const { start = 1, length = 10, order_by = 'created_at', order_dir = 'DESC', search = '' } = req.query;
        const page = parseInt(start);
        const limit = parseInt(length);

        const { contacts, total } = await Contact.datatableList({ page, limit, sortBy: order_by, sortOrder: order_dir, search });
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Contacts list fetched successfully',
            data: contacts,
            total,
            pagination: { total, page, limit, totalPages }
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Error fetching datatable contacts',
            error: error.message
        });
    }
};

// Returns the bare contact record for the contact detail page.
// Cross-service data (tickets, projects, tasks) is composed by
// api-gateway/src/routes/contact-aggregate.routes.js which calls this
// endpoint plus the other services and merges the results.
export const getContactDetailsPage = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ status: 404, message: 'Contact not found' });
        }
        res.json({ status: 200, message: 'Contact details fetched successfully', contact });
    } catch (error) {
        console.error('getContactDetailsPage error:', error);
        res.status(500).json({ status: 500, message: 'Error fetching contact details', error: error.message });
    }
};

// Paginated ticket list scoped to a contact.
// Ticket data lives in ticket-service; this endpoint accepts a contact_id
// query param and returns a stub — the real aggregation is done at the
// API-gateway layer. Kept here so the route exists and returns a clear
// message if called directly.
export const getContactTicketList = async (req, res) => {
    try {
        const { contact_id, start = 1, length = 10, order_by = 'created_at', order_dir = 'DESC', search = '' } = req.query;
        if (!contact_id) {
            return res.status(400).json({ status: 400, message: 'contact_id query param is required' });
        }
        // Verify the contact exists in this service before proxying.
        const contact = await Contact.findById(contact_id);
        if (!contact) {
            return res.status(404).json({ status: 404, message: 'Contact not found' });
        }
        // Ticket records are owned by ticket-service; return metadata only.
        res.json({
            status: 200,
            message: 'Ticket list should be fetched via the API gateway contact-aggregate route',
            contact_id: Number(contact_id),
            pagination: { page: Number(start), limit: Number(length), order_by, order_dir, search }
        });
    } catch (error) {
        console.error('getContactTicketList error:', error);
        res.status(500).json({ status: 500, message: 'Error fetching contact ticket list', error: error.message });
    }
};

// Returns a stats summary for a contact.
// Aggregate counts (tickets, tasks, projects) live in their respective
// services and are composed at the API-gateway layer. This endpoint
// returns what this service owns: the contact record itself.
export const getContactStats = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ status: 404, message: 'Contact not found' });
        }
        res.json({
            status: 200,
            message: 'Contact stats fetched successfully',
            stats: {
                contact_id: contact.id,
                contact_name: contact.contact_name,
                email: contact.email,
                company_id: contact.company_id,
                external_id: contact.external_id || null,
                // Aggregate counts (tickets / tasks / projects) are resolved
                // by the API gateway - not available in this service.
                note: 'Aggregate counts are composed at the API gateway layer'
            }
        });
    } catch (error) {
        console.error('getContactStats error:', error);
        res.status(500).json({ status: 500, message: 'Error fetching contact stats', error: error.message });
    }
};
