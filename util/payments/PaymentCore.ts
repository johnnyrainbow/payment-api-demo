import { Database } from '../../db/Database';
import Payment from '../../db/tables/Payment';
import User from '../../db/tables/User';
import {
	FUTURE,
	FUTURE_CREDIT_RECIPIENT_COMPLETE,
	INSTANT_SEND,
	SUBTRACT_NOW,
} from '../PaymentCodes';

/**
 * Performs an credit action to a single recipient user
 *
 * Creates a payment record of FUTURE_CREDIT_RECIPIENT_COMPLETE
 *
 * @param paymentId  The Id of the future payment record that triggered this transfer
 * @param userId  the Id of the user to withdraw from
 * @param recipientUserId  the Id of the user to deposit to
 * @param amount  The amount in dollars
 * @param description  Payment record descriptor
 * @param beneficiary_name  The name of the beneficiary
 * @return {Payment} Returns the created payment
 */
export const creditUser = async (
	paymentId: string,
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string
) => {
	try {
		const recipientUser: User = await Database.getUser(recipientUserId);
		if (!recipientUserId) return null;

		//perform ACID transaction
		await Database.startTransaction();

		await recipientUser.addBalance(amount);

		//update the original payment record with complete true
		const paymentRecord: Payment = await Database.getPayment(paymentId);
		if (!paymentRecord) throw new Error('Payment record does not exist');

		await paymentRecord.setCompleted(true);

		//create a new payment record
		const payment: Payment = await Database.createPaymentRecord(
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
		//error, perform rollback
		await Database.rollbackTransaction();
		return null;
	}
};

/**
 * Performs an debit/withdraw action against a single user
 *
 * Creates a payment record of SUBTRACT_NOW
 *
 * @param userId  the Id of the user to withdraw from
 * @param recipientUserId  the Id of the user to deposit to
 * @param amount  The amount in dollars
 * @param description  Payment record descriptor
 * @param beneficiary_name  The name of the beneficiary
 * @param pay_date  The date of payment to the recipientUser
 * @return {Payment} Returns the created payment
 */
export const debitUser = async (
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string,
	pay_date: string
) => {
	try {
		const user: User = await Database.getUser(userId);
		if (!user) return null;

		//perform ACID transaction
		await Database.startTransaction();

		await user.subtractBalance(amount);

		//create the payment record
		const payment: Payment = await Database.createPaymentRecord(
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

/**
 * Performs an instant fund transfer between two parties.
 *
 * Creates a payment record of INSTANT
 *
 * @param paymentId  If a future record triggered this transfer, pass its payment id. Otherwise null.
 * @param userId  the Id of the user to withdraw from
 * @param recipientUserId  the Id of the user to deposit to
 * @param amount  The amount in dollars
 * @param description  Payment record descriptor
 * @param beneficiary_name  The name of the beneficiary
 * @return {Payment} Returns the created payment
 */
export const instantFundsTransfer = async (
	paymentId: string | null,
	userId: string,
	recipientUserId: string,
	amount: number,
	description: string,
	beneficiary_name: string
): Promise<Payment> => {
	try {
		const user: User = await Database.getUser(userId);
		if (!user) return null;

		const recipientUser: User = await Database.getUser(recipientUserId);
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
		const payment: Payment = await Database.createPaymentRecord(
			null,
			amount,
			description,
			beneficiary_name,
			user.id,
			recipientUser.id,
			INSTANT_SEND,
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
	const user: User = await Database.getUser(userId);
	if (!user) return null;

	const recipientUser: User = await Database.getUser(recipientUserId);
	if (!recipientUser) return null;

	//create the payment record
	const payment: Payment = await Database.createPaymentRecord(
		null,
		amount,
		description,
		beneficiary_name,
		user.id,
		recipientUser.id,
		FUTURE,
		pay_date
	);

	return payment;
};
