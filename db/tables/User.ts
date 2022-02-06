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
	//psuedo async
	async subtractBalance(amount: number) {
		this.balance -= amount;
	}
	//psuedo async
	async addBalance(amount: number) {
		this.balance += amount;
	}
	//psuedo async
	async getBalance() {
		return this.balance;
	}
	//psuedo async
	async getName() {
		return this.name;
	}
	//psuedo async
	async setName(newName) {
		this.name = newName;
	}
}
