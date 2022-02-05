import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../middleware/errorHandling/errorResponses';
import ERRORS from '../middleware/errorHandling/codes.json';
import { Database } from '../db/Database';

export const submitPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { amount, description, beneficiary_name, beneficiary_id } = req.body;
		const { userId } = req.query;

		const user = Database.getUser(userId);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		const recipientUser = Database.getUser(beneficiary_id);
		if (!recipientUser)
			throw new ResponseError(ERRORS.RECIPIENT_USER_NOT_FOUND, beneficiary_id);

		if (amount < 0) throw new ResponseError(ERRORS.NEGATIVE_AMOUNT_INVALID);

		try {
			//perform ACID transaction
			Database.startTransaction();

			if (user.getBalance() - amount < 0)
				//check that the user has sufficient funds, negative balance not accepted
				throw new ResponseError(ERRORS.INSUFFICIENT_BALANCE);

			//update user balances
			user.subtractBalance(amount);
			recipientUser.addBalance(amount);

			//create the payment record
			const payment = Database.createPaymentRecord(
				null,
				amount,
				description,
				beneficiary_name,
				userId,
				beneficiary_id
			);

			Database.commitTransaction();

			return res
				.status(200)
				.send({ success: true, result: { paymentId: payment.id } });
		} catch (e) {
			//error, perform rollback
			Database.rollbackTransaction();
		}
		return res.status(500).send({
			success: false,
			error:
				'Something went wrong attempting to send your payment, please try again later',
		});
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const getPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { paymentId } = req.params;
		const payment = Database.getPayment(paymentId);
		if (!payment) throw new ResponseError(ERRORS.PAYMENT_NOT_FOUND, paymentId);

		return res.status(200).send({ success: true, result: { payment } });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const updatePayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { description } = req.body;
		const { userId } = req.query;
		const { paymentId } = req.params;

		const user = Database.getUser(userId);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		const payment = Database.getPayment(paymentId);
		if (!payment) throw new ResponseError(ERRORS.PAYMENT_NOT_FOUND, paymentId);

		if (payment.getSenderId() !== userId)
			throw new ResponseError(ERRORS.UNAUTHORIZED_PAYMENT_UPDATE, userId);

		payment.setDescription(description);

		return res.status(200).send({ success: true, result: { payment } });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};
