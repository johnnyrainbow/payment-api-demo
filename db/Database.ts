import importUsers from './users.json';
import User from './tables/User';
import Payment from './tables/Payment';
import { isDateToday } from '../util/DateUtil';
import { creditUser, instantFundsTransfer } from '../util/payments/PaymentCore';
import { FUTURE, SUBTRACT_NOW } from '../util/PaymentCodes';

//Just a psuedo DB in memory

export class Database {
	private static users: Map<string, User> = new Map<string, User>();
	private static payments: Map<string, Payment> = new Map<string, Payment>();

	//psuedo async
	static async startTransaction(): Promise<void> {
		//ACID TRANSACTION STUB
	}
	//psuedo async
	static async commitTransaction(): Promise<void> {
		//ACID TRANSACTION STUB
	}
	//psuedo async
	static async rollbackTransaction(): Promise<void> {
		//ACID TRANSACTION STUB
	}
	//psuedo async
	static async getUser(id: string): Promise<User | undefined> {
		return Database.users.get(id);
	}
	//psuedo async
	static async getPayment(id: string): Promise<Payment | undefined> {
		return Database.payments.get(id);
	}
	//psuedo async
	static async getUsers(): Promise<Map<string, User>> {
		return Database.users;
	}
	//psuedo async
	static async getPayments(): Promise<Map<string, Payment>> {
		return Database.payments;
	}
	//psuedo async
	static async getFuturePayments(onlyDuePayments: boolean): Promise<Payment[]> {
		//would usually be an SQL select

		const payments: Map<string, Payment> = await Database.getPayments();
		const paymentArray: Payment[] = [];
		for (const key in payments) paymentArray.push(payments.get(key) as Payment);

		return paymentArray.filter((payment) => {
			//get payments that are not completed, and are to be run today
			if (payment.completed === false && payment.payDate) {
				const dateObject: Date = new Date(payment.payDate);
				return onlyDuePayments ? isDateToday(dateObject) : true;
			}
		});
	}
	//psuedo async
	static async createPaymentRecord(
		id: string | null,
		amount: number,
		description: string,
		beneficiary_name: string,
		senderId: string,
		receiverId: string,
		paymentType: string,
		payDate: string | null
	): Promise<Payment> {
		const payment: Payment = new Payment(
			id,
			amount,
			description,
			beneficiary_name,
			senderId,
			receiverId,
			paymentType,
			payDate
		);
		Database.payments.set(payment.id as string, payment);

		return payment;
	}
	//psuedo async
	static loadDBFromJSON(): void {
		for (const user of importUsers) {
			Database.users.set(user.id, new User(user.id, user.name, user.balance));
		}
	}
	//only runs at 4am
	static async scheduleFuturePaymentCron(
		onlyDuePayments: boolean
	): Promise<void> {
		const dueFuturePayments: Payment[] = await Database.getFuturePayments(
			onlyDuePayments
		);

		for (const payment of dueFuturePayments) {
			const {
				senderId,
				receiverId,
				amount,
				description,
				beneficiary_name,
				payDate,
			} = payment;

			if (!payment.id) return;

			if (payment.paymentType === FUTURE) {
				//perform the full payment logic
				await instantFundsTransfer(
					payment.id,
					senderId,
					receiverId,
					amount,
					description,
					beneficiary_name
				);
			} else if (payment.paymentType === SUBTRACT_NOW) {
				//perform a creditRecipient logic, as the funds have already been subtracted

				await creditUser(
					payment.id,
					senderId,
					receiverId,
					amount,
					description,
					beneficiary_name
				);
			}
		}
	}
}
