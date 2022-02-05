import importUsers from './users.json';
import User from './tables/User';
import Payment from './tables/Payment';
//Just a psuedo DB in memory

export class Database {
	static users: Map<string, User> = new Map<string, User>();
	static payments: Map<string, Payment> = new Map<string, Payment>();
	static startTransaction() {
		//ACID TRANSACTION STUB
	}
	static commitTransaction() {
		//ACID TRANSACTION STUB
	}
	static rollbackTransaction() {
		//ACID TRANSACTION STUB
	}
	static createPaymentRecord(
		id,
		amount,
		description,
		beneficiary_name,
		senderId,
		receiverId
	) {
		const payment = new Payment(
			id,
			amount,
			description,
			beneficiary_name,
			senderId,
			receiverId
		);
		Database.payments[payment.id] = payment;

		return payment;
	}

	static getUser(id: any) {
		return Database.users[id];
	}
	static getPayment(id: any) {
		return Database.payments[id];
	}
	static getUsers() {
		return Database.users;
	}
	static getPayments() {
		return Database.payments;
	}
	static loadDBFromJSON() {
		for (const user of importUsers) {
			Database.users[user.id] = new User(user.id, user.name, user.balance);
		}
	}
}
