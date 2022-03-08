import { isDateBusinessDay } from '../DateUtil';
import { FUTURE, INSTANT_SEND, SUBTRACT_NOW, INVALID } from '../PaymentCodes';

export const getPaymentType = (payDate: string): string => {
	if (!payDate) return INSTANT_SEND;

	const payDateObject: Date = new Date(payDate);
	const now: Date = new Date();

	// calculate the number of days difference between now and paydate
	const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
	const day_diff = Math.round(
		Math.abs((now.getTime() - payDateObject.getTime()) / oneDay)
	);

	//payment is dated future payment for today
	if (day_diff === 0) return SUBTRACT_NOW;

	//payment is dated for tomorrow, and it is a business day
	if (day_diff === 1 && isDateBusinessDay(payDateObject)) return SUBTRACT_NOW;

	//anytime futher in the future
	if (day_diff > 0) return FUTURE;

	return INVALID;
};
