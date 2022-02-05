import v from '../middleware/requestValidation/validators/paymentValidator';
import { validate } from '../middleware/requestValidation/validate';
import { Router } from 'express';
import {
	submitPayment,
	getPayment,
	updatePayment,
} from '../controllers/payment';

module.exports = (app: Router) => {
	app.post('/payments/create', v('create_payment'), validate, submitPayment);
	app.get('/payments/:id', getPayment);
	app.patch('/payments/:id', v('update_payment'), validate, updatePayment);
};
