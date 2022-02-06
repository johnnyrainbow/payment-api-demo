import shortid from 'shortid';

export default class User {
	id: string;
	name: string;
	balance: number;

	constructor(id, name, balance) {
		this.id = id === null || id === undefined ? shortid() : id;
		this.name = name;
		this.balance = balance || 0;
	}

	async subtractBalance(amount: number) {
		this.balance -= amount;
	}
	async addBalance(amount: number) {
		this.balance += amount;
	}
	async getBalance() {
		return this.balance;
	}
	async getName() {
		return this.name;
	}
	async setName(newName) {
		this.name = newName;
	}
}
