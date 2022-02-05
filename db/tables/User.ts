import shortid from 'shortid';

export default class User {
	id: string;
	name: string;
	balance: number;
	randomVal: boolean;

	constructor(id, name, balance) {
		this.id = id === null || id === undefined ? shortid() : id;
		this.name = name;
		this.balance = balance || 0;
	}

	subtractBalance(amount: number) {
		this.balance -= amount;
	}
	addBalance(amount: number) {
		this.balance += amount;
	}
	getBalance() {
		return this.balance;
	}
	setName() {}
	getName() {}
}
