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
import {
	FUTURE,
	INSTANT_SEND,
	INVALID,
	SUBTRACT_NOW,
} from '../util/PaymentCodes';
import Payment from '../db/tables/Payment';

/**
 * REST Controller for submitting a payment, that based on the pay_date, 
 * can be of paymentTypes: INSTANT, SUBTRACT_NOW, or FUTURE
 * 
 * @param req The request object
 * @param res  The response object
 * @param next the next function

 */
export const submitPayment = async function (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>> | void> {
	try {
		const {
			pay_date,
			amount,
			description,
			beneficiary_name,
			beneficiary_id,
		}: {
			pay_date: string;
			amount: number;
			description: string;
			beneficiary_name: string;
			beneficiary_id: string;
		} = req.body;

		const { userId } = req.query;

		const user: User | undefined = await Database.getUser(userId as string);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		const recipientUser: User | undefined = await Database.getUser(
			beneficiary_id
		);
		if (!recipientUser)
			throw new ResponseError(ERRORS.RECIPIENT_USER_NOT_FOUND, beneficiary_id);

		if (pay_date) {
			if (!isValidDateFormat(pay_date))
				throw new ResponseError(ERRORS.INVALID_PAY_DATE_FORMAT, pay_date);

			if (isDateInPast(pay_date))
				throw new ResponseError(ERRORS.INVALID_PAY_DATE_RANGE, pay_date);
		}

		if (amount < 0) throw new ResponseError(ERRORS.NEGATIVE_AMOUNT_INVALID);

		//get is payment INSTANT, SUBTRACT_NOW, or FUTURE
		const paymentType: string | undefined = getPaymentType(pay_date);

		if (paymentType === INVALID)
			throw new ResponseError(ERRORS.INVALID_PAYMENT_TYPE);

		if (paymentType !== FUTURE && (await user.getBalance()) - amount < 0)
			//for a non future payment, check that the user has sufficient funds, negative balance not accepted
			throw new ResponseError(ERRORS.INSUFFICIENT_BALANCE);

		const paymentResult: Payment | null = await processPayment(
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

/**
 * Processes a payment, by evaluating the paymentType
 *
 * @param paymentType INSTANT, SUBTRACT_NOW, or FUTURE
 * @param user  the user to withdraw from
 * @param recipientUserId  the user to deposit to
 * @param amount  The amount in dollars
 * @param description  Payment record descriptor
 * @param beneficiary_name  The name of the beneficiary
 * @param pay_date  The date of payment to the recipientUser
 *
 * @return {Payment} Returns the created payment
 */
export const processPayment = async (
	paymentType: string,
	user: User,
	recipientUser: User,
	amount: number,
	description: string,
	beneficiary_name: string,
	pay_date: string
): Promise<Payment | null> => {
	/**
	 * The INSTANT_SEND code. This payment code refers to any payment that
	 * either has no pay_date, and is instantaneous, or is a future (2+ days out) payment being executed.
	 */
	if (paymentType === INSTANT_SEND) {
		return await instantFundsTransfer(
			null,
			user.id,
			recipientUser.id,
			amount,
			description,
			beneficiary_name
		);
	}
	/**
	 * The SUBTRACT_NOW code. This payment code refers to any payment that
	 * has been passed a pay_date that is for either today, or the next business day.
	 *
	 * It indicates that the sender's money has been immediately withdrawn.
	 * @type {string}
	 */
	if (paymentType === SUBTRACT_NOW) {
		return await debitUser(
			user.id,
			recipientUser.id,
			amount,
			description,
			beneficiary_name,
			pay_date
		);
	}
	/**
	 * The FUTURE code. This payment code refers to any payment that
	 * has been passed a pay_date that is for any future date beyond SUBTRACT_NOW policy
	 *
	 * It indicates that no money has been withdrawn from either party, and will not until the cron runs at 4am on pay_date
	 * @type {string}
	 */
	if (paymentType === FUTURE) {
		return await createFuturePaymentRecord(
			user.id,
			recipientUser.id,
			amount,
			description,
			beneficiary_name,
			pay_date
		);
	}

	return null;
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

		return res.status(200).send({ success: true, result: payment });
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
		const { description }: { description: string } = req.body;
		const { userId } = req.query;
		const { paymentId } = req.params;

		const user: User | undefined = await Database.getUser(userId as string);
		if (!user) throw new ResponseError(ERRORS.USER_NOT_FOUND, userId);

		const payment: Payment | undefined = await Database.getPayment(paymentId);
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
		const dueFuturePayments: Payment[] = await Database.getFuturePayments(true);

		return res.status(200).send({ success: true, result: dueFuturePayments });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};
export const getAllFuturePayments = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const dueFuturePayments: Payment[] = await Database.getFuturePayments(
			false
		);

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
		await Database.scheduleFuturePaymentCron(true);

		return res.status(200).send({ success: true });
	} catch (e) {
		return next(e); //forward to error handler middleware
	}
};

export const runAllFuturePayments = async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		await Database.scheduleFuturePaymentCron(false);

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
