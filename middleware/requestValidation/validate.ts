import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
export const validate = (input: any, res: Response, next: NextFunction) => {
	const errors = validationResult(input);

	if (errors.isEmpty()) {
		return next();
	}
	const extractedErrors: Array<object> = [];
	errors.array().map((err: any) => {
		if (
			extractedErrors.filter((item) => Object.keys(item)[0] === err.param)
				.length === 0
		)
			//filter out multiple of same field errors
			return extractedErrors.push({ [err.param]: err.msg });
	});

	return res.status(422).json({
		errors: extractedErrors,
	});
};
