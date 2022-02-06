import importUsers from './users.json';
import User from './tables/User';
import Payment from './tables/Payment';
import { isDateToday } from '../util/DateUtil';
import { creditUser, instantFundsTransfer } from '../util/payments/PaymentCore';
import { FUTURE, SUBTRACT_NOW } from '../util/PaymentCodes';

//Just a psuedo DB in memory

export class Database {
	static users: Map<string, User> = new Map<string, User>();
	static payments: Map<string, Payment> = new Map<string, Payment>();

	//only runs at 4am
	static async scheduleFuturePaymentCron() {
		const dueFuturePayments: Payment[] = await Database.getDueFuturePayments();

		for (const payment of dueFuturePayments) {
			const {
				senderId,
				receiverId,
				amount,
				description,
				beneficiary_name,
				payDate,
			} = payment;

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

	static async startTransaction() {
		//ACID TRANSACTION STUB
	}
	static async commitTransaction() {
		//ACID TRANSACTION STUB
	}
	static async rollbackTransaction() {
		//ACID TRANSACTION STUB
	}

	static async getUser(id: any) {
		return Database.users[id];
	}
	static async getPayment(id: any) {
		return Database.payments[id];
	}
	static async getUsers() {
		return Database.users;
	}
	static async getPayments() {
		return Database.payments;
	}
	static async getDueFuturePayments() {
		//would usually be an SQL select

		const payments: Map<string, Payment> = await Database.getPayments();
		const paymentArray: Payment[] = [];
		for (const key in payments) paymentArray.push(payments[key]);

		return paymentArray.filter((payment) => {
			//get payments that are not completed, and are to be run today
			if (payment.completed === false) {
				const dateObject: Date = new Date(payment.payDate);
				return isDateToday(dateObject);
			}
		});
	}
	static async createPaymentRecord(
		id,
		amount,
		description,
		beneficiary_name,
		senderId,
		receiverId,
		paymentType,
		payDate
	) {
		const payment = new Payment(
			id,
			amount,
			description,
			beneficiary_name,
			senderId,
			receiverId,
			paymentType,
			payDate
		);
		Database.payments[payment.id] = payment;

		return payment;
	}
	static loadDBFromJSON() {
		for (const user of importUsers) {
			Database.users[user.id] = new User(user.id, user.name, user.balance);
		}
	}
}
