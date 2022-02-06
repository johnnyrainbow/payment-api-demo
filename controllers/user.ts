import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../middleware/errorHandling/errorResponses';
import ERRORS from '../middleware/errorHandling/codes.json';
import { Database } from '../db/Database';
import User from '../db/tables/User';

export const getUserBalance = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = req.params;

		const user: User = await Database.getUser(userId);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		return res
			.status(200)
			.send({ success: true, result: { balance: await user.getBalance() } });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};
