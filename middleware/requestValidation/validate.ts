import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (input: any, res: Response, next: NextFunction) => {
	const errors = validationResult(input);

	if (errors.isEmpty()) return next();

	const extractedErrors: Array<any> = [];
	errors.array().map((err: any) => {
		if (
			extractedErrors.filter((item) => item.param === err.param)
				.length === 0
		)
			//filter out multiple of same field errors
			return extractedErrors.push(err);
	});

	return res.status(422).json({
		validation_errors: extractedErrors,
	});
};
