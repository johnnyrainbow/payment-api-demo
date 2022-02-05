import v from '../middleware/requestValidation/validators/paymentValidator';
import { validate } from '../middleware/requestValidation/validate';
import { Router } from 'express';
import {
	submitPayment,
	getPayment,
	updatePayment,
} from '../controllers/payment';

module.exports = (app: Router) => {
	app.post(
		'/payments/create', //naive userid reference
		v('create_payment'),
		validate,
		submitPayment
	);
	app.get('/payments/:paymentId', getPayment);
	app.patch(
		'/payments/:paymentId', //naive userid reference
		v('update_payment'),
		validate,
		updatePayment
	);
};
