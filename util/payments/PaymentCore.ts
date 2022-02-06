import { Database } from '../../db/Database';
import { isDateBusinessDay } from '../DateUtil';
import {
	FUTURE_CREDIT_RECIPIENT_COMPLETE,
	SUBTRACT_NOW,
} from '../PaymentCodes';

export const creditUser = async (
	paymentId: string,
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string
) => {
	try {
		const recipientUser = await Database.getUser(recipientUserId);
		if (!recipientUserId) return null;

		//perform ACID transaction
		await Database.startTransaction();

		recipientUser.addBalance(amount);

		//update the original payment record with complete true
		const paymentRecord = await Database.getPayment(paymentId);
		await paymentRecord.setCompleted(true);

		//create a new payment record
		const payment = await Database.createPaymentRecord(
			null,
			amount,
			description,
			beneficiary_name,
			userId,
			recipientUserId,
			FUTURE_CREDIT_RECIPIENT_COMPLETE,
			null
		);

		await Database.commitTransaction();
		return payment;
	} catch (e) {
		console.log(e);
		//error, perform rollback
		await Database.rollbackTransaction();
		return null;
	}
};

export const debitUser = async (
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string,
	pay_date: string
) => {
	try {
		const user = await Database.getUser(userId);
		if (!user) return null;

		//perform ACID transaction
		await Database.startTransaction();

		await user.subtractBalance(amount);

		//create the payment record
		const payment = await Database.createPaymentRecord(
			null,
			amount,
			description,
			beneficiary_name,
			userId,
			recipientUserId,
			SUBTRACT_NOW,
			pay_date
		);

		await Database.commitTransaction();
		return payment;
	} catch (e) {
		//error, perform rollback
		await Database.rollbackTransaction();
		return null;
	}
};

export const instantFundsTransfer = async (
	paymentId: string,
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string
) => {
	try {
		const user = await Database.getUser(userId);
		if (!user) return null;

		const recipientUser = await Database.getUser(recipientUserId);
		if (!recipientUser) return null;

		//perform ACID transaction
		await Database.startTransaction();

		//ensure funds
		if ((await user.getBalance()) - amount < 0)
			throw new Error('Insufficient Funds');

		await user.subtractBalance(amount);
		await recipientUser.addBalance(amount);

		//if there was a future record that triggered this with a payment id, we should update it to be completed
		if (paymentId) {
			const paymentRecord = await Database.getPayment(paymentId);
			await paymentRecord.setCompleted(true);
		}
		//create the payment record
		const payment = await Database.createPaymentRecord(
			null,
			amount,
			description,
			beneficiary_name,
			user.id,
			recipientUser.id,
			'INSTANT',
			null
		);

		await Database.commitTransaction();
		return payment;
	} catch (e) {
		console.log(e);
		//error, perform rollback
		await Database.rollbackTransaction();
		return null;
	}
};

export const createFuturePaymentRecord = async (
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string,
	pay_date: string
) => {
	const user = await Database.getUser(userId);
	if (!user) return null;

	const recipientUser = await Database.getUser(recipientUserId);
	if (!recipientUser) return null;

	//create the payment record
	const payment = await Database.createPaymentRecord(
		null,
		amount,
		description,
		beneficiary_name,
		user.id,
		recipientUser.id,
		'FUTURE',
		pay_date
	);

	return payment;
};
