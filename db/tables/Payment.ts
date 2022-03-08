import shortid from 'shortid';
import {
	FUTURE_CREDIT_RECIPIENT_COMPLETE,
	INSTANT_SEND,
} from '../../util/PaymentCodes';

export default class Payment {
	id: string | null;
	amount: number;
	description: string;
	beneficiary_name: string;
	senderId: string;
	receiverId: string;
	paymentType: string;
	payDate: string | null;
	completed: boolean;
	createdAt: string;
	updatedAt: string | null;

	constructor(
		id: string | null,
		amount: number,
		description: string,
		beneficiary_name: string,
		senderId: string,
		receiverId: string,
		paymentType: string,
		payDate: string | null
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
		this.updatedAt = null;
	}
	//psuedo async
	async getId(): Promise<string | null> {
		return this.id;
	}
	//psuedo async
	async getAmount(): Promise<number> {
		return this.amount;
	}
	//psuedo async
	async getDescription(): Promise<string> {
		return this.description;
	}
	//psuedo async
	async getSenderId(): Promise<string> {
		return this.senderId;
	}
	//psuedo async
	async getReceiverId(): Promise<string> {
		return this.receiverId;
	}
	//psuedo async
	async getPaymentType(): Promise<string> {
		return this.paymentType;
	}
	//psuedo async
	async getPayDate(): Promise<string | null> {
		return this.payDate;
	}
	//psuedo async
	async setDescription(newDescription: string): Promise<void> {
		this.description = newDescription;
		this.updatedAt = new Date().toISOString();
	}
	//psuedo async
	async setCompleted(isCompleted: boolean): Promise<void> {
		this.completed = isCompleted;
		this.updatedAt = new Date().toISOString();
	}
}
