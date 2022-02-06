import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../middleware/errorHandling/errorResponses';
import ERRORS from '../middleware/errorHandling/codes.json';
import { Database } from '../db/Database';
import { isDateInPast, isValidDateFormat } from '../util/DateUtil';
import {
	createFuturePaymentRecord,
	debitUser,
	instantFundsTransfer,
} from '../util/payments/PaymentCore';
import { getPaymentType } from '../util/payments/PaymentUtil';
import User from '../db/tables/User';
import { FUTURE, INSTANT_SEND, SUBTRACT_NOW } from '../util/PaymentCodes';
import Payment from '../db/tables/Payment';

//TODO UNIT TESTS, postman download
export const submitPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { pay_date, amount, description, beneficiary_name, beneficiary_id } =
			req.body;

		const { userId } = req.query;

		const user: User = await Database.getUser(userId);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		const recipientUser: User = await Database.getUser(beneficiary_id);
		if (!recipientUser)
			throw new ResponseError(ERRORS.RECIPIENT_USER_NOT_FOUND, beneficiary_id);

		if (pay_date)
			if (!isValidDateFormat(pay_date))
				throw new ResponseError(ERRORS.INVALID_PAY_DATE_FORMAT, pay_date);

		if (isDateInPast(pay_date))
			throw new ResponseError(ERRORS.INVALID_PAY_DATE_RANGE, pay_date);

		if (amount < 0) throw new ResponseError(ERRORS.NEGATIVE_AMOUNT_INVALID);

		//get is payment instant, subtract_now, or future
		const paymentType = getPaymentType(pay_date);

		if (paymentType !== FUTURE && (await user.getBalance()) - amount < 0)
			//for a non future payment, check that the user has sufficient funds, negative balance not accepted
			throw new ResponseError(ERRORS.INSUFFICIENT_BALANCE);

		const paymentResult: any = await processPayment(
			paymentType,
			user,
			recipientUser,
			amount,
			description,
			beneficiary_name,
			pay_date
		);

		return paymentResult
			? res
					.status(200)
					.send({ success: true, result: { paymentId: paymentResult.id } })
			: res.status(500).send({
					success: false,
					error:
						'Something went wrong attempting to send your payment, please try again later',
			  });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const processPayment = async (
	paymentType: string,
	user: User,
	recipientUser: User,
	amount: number,
	description: string,
	beneficiary_name: string,
	pay_date: string
) => {
	if (paymentType === INSTANT_SEND) {
		//update user balances
		return await instantFundsTransfer(
			null,
			user.id,
			recipientUser.id,
			amount,
			description,
			beneficiary_name
		);
	} else if (paymentType === SUBTRACT_NOW) {
		return await debitUser(
			user.id,
			recipientUser.id,
			amount,
			description,
			beneficiary_name,
			pay_date
		);
	} else if (paymentType === FUTURE) {
		return await createFuturePaymentRecord(
			user.id,
			recipientUser.id,
			amount,
			description,
			beneficiary_name,
			pay_date
		);
	}
};

export const getPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { paymentId } = req.params;
		const payment = await Database.getPayment(paymentId);
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

		const user: User = await Database.getUser(userId);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		const payment: Payment = await Database.getPayment(paymentId);
		if (!payment) throw new ResponseError(ERRORS.PAYMENT_NOT_FOUND, paymentId);

		if ((await payment.getSenderId()) !== userId)
			throw new ResponseError(ERRORS.UNAUTHORIZED_PAYMENT_UPDATE, userId);

		await payment.setDescription(description);

		return res.status(200).send({ success: true, result: { payment } });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const getDueFuturePayments = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const dueFuturePayments: Payment[] = await Database.getDueFuturePayments();

		return res.status(200).send({ success: true, result: dueFuturePayments });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const runDueFuturePayments = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		await Database.scheduleFuturePaymentCron();

		return res.status(200).send({ success: true });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const getAllPayments = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const payments: Map<string, Payment> = await Database.getPayments();

		return res.status(200).send({ success: true, result: payments });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};
