import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../middleware/errorHandling/errorResponses';
import ERRORS from '../middleware/errorHandling/codes.json';

export const submitPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { amount, description, beneficiary_name } = req.body;

		if (amount < 0) throw new ResponseError(ERRORS.NEGATIVE_AMOUNT_INVALID);

		return res.status(200).send({ success: true });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const getPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	return res.status(200).send({ success: true });
};

export const updatePayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	const { amount, description, beneficiary_name } = req.body;

	return res.status(200).send({ success: true });
};
