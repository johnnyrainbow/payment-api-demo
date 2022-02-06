import shortid from 'shortid';
import {
	FUTURE_CREDIT_RECIPIENT_COMPLETE,
	INSTANT_SEND,
} from '../../util/PaymentCodes';

export default class Payment {
	id: string;
	amount: number;
	description: string;
	beneficiary_name: string;
	senderId: string;
	receiverId: string;
	paymentType: string;
	payDate: string;
	completed: boolean;
	createdAt: string;
	updatedAt: string;

	constructor(
		id,
		amount,
		description,
		beneficiary_name,
		senderId,
		receiverId,
		paymentType,
		payDate
	) {
		this.id = id === null || id === undefined ? shortid() : id;
		this.amount = amount;
		this.description = description;
		this.beneficiary_name = beneficiary_name;
		this.senderId = senderId;
		this.receiverId = receiverId;
		this.paymentType = paymentType;
		this.payDate = payDate;
		this.completed =
			paymentType === INSTANT_SEND ||
			paymentType === FUTURE_CREDIT_RECIPIENT_COMPLETE;
		this.createdAt = new Date().toISOString();
		this.updatedAt;
	}
	//psuedo async
	async getId() {
		return this.id;
	}
	//psuedo async
	async getAmount() {
		return this.amount;
	}
	//psuedo async
	async getDescription() {
		return this.description;
	}
	//psuedo async
	async getSenderId() {
		return this.senderId;
	}
	//psuedo async
	async getReceiverId() {
		return this.receiverId;
	}
	//psuedo async
	async getPaymentType() {
		return this.paymentType;
	}
	//psuedo async
	async getPayDate() {
		return this.payDate;
	}
	//psuedo async
	async setDescription(newDescription) {
		this.description = newDescription;
		this.updatedAt = new Date().toISOString();
	}
	//psuedo async
	async setCompleted(isCompleted: boolean) {
		this.completed = isCompleted;
		this.updatedAt = new Date().toISOString();
	}
}
