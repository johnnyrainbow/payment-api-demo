import shortid from 'shortid';

export default class Payment {
	id: string;
	amount: number;
	description: string;
	beneficiary_name: string;
	senderId: number;
	receiverId: number;
	createdAt: string;
	updatedAt: string;

	constructor(id, amount, description, beneficiary_name, senderId, receiverId) {
		this.id = id === null || id === undefined ? shortid() : id;
		this.amount = amount;
		this.description = description;
		this.beneficiary_name = beneficiary_name;
		this.senderId = senderId;
		this.receiverId = receiverId;
		this.createdAt = new Date().toISOString();
		this.updatedAt;
	}
	getId() {
		return this.id;
	}
	getAmount() {
		return this.amount;
	}
	getDescription() {
		return this.description;
	}
	getSenderId() {
		return this.senderId;
	}
	getReceiverId() {
		return this.receiverId;
	}
	setDescription(newDescription) {
		this.description = newDescription;
		this.updatedAt = new Date().toISOString();
	}
}
