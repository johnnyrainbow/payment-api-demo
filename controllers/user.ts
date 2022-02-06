import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../middleware/errorHandling/errorResponses';
import ERRORS from '../middleware/errorHandling/codes.json';
import { Database } from '../db/Database';

export const getUserBalance = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = req.params;

		const user = await Database.getUser(userId);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		return res
			.status(200)
			.send({ success: true, result: { balance: await user.getBalance() } });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};
