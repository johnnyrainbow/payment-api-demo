import { body } from 'express-validator';

export default (method: string) => {
	switch (method) {
		case 'create_payment':
			return [
				body('amount').exists().isNumeric(),
				body('beneficiary_name').exists().isLength({ max: 32 }),
				body('description').exists().isLength({ max: 300 }),
			];

		case 'update_payment':
			return [
				body('amount').optional().isNumeric(),
				body('beneficiary_name').optional().isLength({ max: 32 }),
				body('description').optional().isLength({ max: 300 }),
			];
	}
};
