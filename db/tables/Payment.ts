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
	async getId() {
		return this.id;
	}
	async getAmount() {
		return this.amount;
	}
	async getDescription() {
		return this.description;
	}
	async getSenderId() {
		return this.senderId;
	}
	async getReceiverId() {
		return this.receiverId;
	}
	async getPaymentType() {
		return this.paymentType;
	}
	async getPayDate() {
		return this.payDate;
	}
	async setDescription(newDescription) {
		this.description = newDescription;
		this.updatedAt = new Date().toISOString();
	}
	async setCompleted(isCompleted: boolean) {
		this.completed = isCompleted;
		this.updatedAt = new Date().toISOString();
	}
}
