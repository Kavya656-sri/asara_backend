// import { Router } from 'express';
// import { body } from 'express-validator';
// import {
//     createContact,
//     updateContact,
//     deleteContact,
//     listContacts,
//     listActiveContactsByCompany,
//     getContact,
//     datatablecontacts,
//     setExternalId
// } from '../controllers/contact.controller.js';
// import { verifyToken } from '../middleware/auth.js';

// const router = Router();

// const contactValidation = [
//     body('contact_name').notEmpty().withMessage('Contact name is required'),
//     body('email').isEmail().withMessage('Valid email is required'),
//     body('mobile_no').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number is required'),
//     body('designation').notEmpty().withMessage('Designation is required'),
//     body('company_id').notEmpty().withMessage('Company ID is required')
// ];
// router.post('/', contactValidation, createContact);
// router.put('/:id', contactValidation, updateContact);
// router.patch('/:id/external-id', setExternalId);
// router.delete('/:id', deleteContact);
// router.get('/', listContacts);
// router.get('/company/:companyId/active', listActiveContactsByCompany);
// router.get('/datatable-contacts', datatablecontacts);
// router.get('/:id', getContact);
// export default router;


import { Router } from 'express';
import {
    createContact,
    updateContact,
    deleteContact,
    listContacts,
    listActiveContactsByCompany,
    getContact,
    datatablecontacts,
    setExternalId
} from '../controllers/contact.controller.js';

const router = Router();

// No JWT Authentication
// No Request Validation

router.post('/', createContact);
router.put('/:id', updateContact);
router.patch('/:id/external-id', setExternalId);
router.delete('/:id', deleteContact);
router.get('/', listContacts);
router.get('/company/:companyId/active', listActiveContactsByCompany);
router.get('/datatable-contacts', datatablecontacts);
router.get('/:id', getContact);

export default router;