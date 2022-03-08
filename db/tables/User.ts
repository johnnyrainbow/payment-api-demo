import shortid from 'shortid';

export default class User {
	id: string;
	name: string;
	balance: number;

	constructor(id: string, name: string, balance: number) {
		this.id = id === null || id === undefined ? shortid() : id;
		this.name = name;
		this.balance = balance || 0;
	}
	//psuedo async
	async subtractBalance(amount: number): Promise<void> {
		this.balance -= amount;
	}
	//psuedo async
	async addBalance(amount: number): Promise<void> {
		this.balance += amount;
	}
	//psuedo async
	async getBalance(): Promise<number> {
		return this.balance;
	}
	//psuedo async
	async getName(): Promise<string> {
		return this.name;
	}
	//psuedo async
	async setName(newName: string): Promise<void> {
		this.name = newName;
	}
}
