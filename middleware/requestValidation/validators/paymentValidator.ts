import { body, query } from 'express-validator';

export default (method: string) => {
	switch (method) {
		case 'create_payment':
			return [
				query('userId').exists(),
				body('beneficiary_id').exists(),
				body('amount').exists().isNumeric(),
				body('beneficiary_name').exists().isLength({ max: 32 }),
				body('description').exists().isLength({ max: 300 }),
				body('pay_date').optional(),
			];

		case 'update_payment':
			return [
				query('userId').exists(),
				body('description').exists().isLength({ max: 300 }),
			];
	}
};
