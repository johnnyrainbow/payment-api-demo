import { processPayment, submitPayment } from './payment';
import { Database } from '../db/Database';
import { ResponseError } from '../middleware/errorHandling/errorResponses';
import ERRORS from '../middleware/errorHandling/codes.json';
import User from '../db/tables/User';
jest.mock('../db/Database');

describe('Payment controller tests', () => {
	let requestObject;
	let responseObject;
	let nextFunction;
	beforeEach(() => {
		nextFunction = jest.fn();
		requestObject = {
			body: {},
			query: {},
			params: {},
		};
		requestObject.body = {
			amount: 10,
			description: 'theDescription',
			beneficiary_name: 'theName',
			beneficiary_id: 'theBeneficiaryId',
		};
		requestObject.query = {
			userId: 'theUserId',
		};
	});

	it('submitPayment, should call next with thrown error if user not found in database', async () => {
		Database.getUser = jest.fn().mockResolvedValue(null);

		await submitPayment(requestObject, responseObject, nextFunction);
		expect(Database.getUser).toHaveBeenNthCalledWith(1, 'theUserId');
		expect(nextFunction).toBeCalledWith(
			new ResponseError(ERRORS.USER_NOT_FOUND, 'theUserId')
		);
	});
	it('submitPayment, should call next with thrown error if recipient user not found in database', async () => {
		Database.getUser = jest
			.fn()
			.mockResolvedValueOnce('theUser')
			.mockResolvedValueOnce(null);
		await submitPayment(requestObject, responseObject, nextFunction);
		expect(Database.getUser).toHaveBeenNthCalledWith(2, 'theBeneficiaryId');
		expect(nextFunction).toBeCalledWith(
			new ResponseError(ERRORS.RECIPIENT_USER_NOT_FOUND, 'theBeneficiaryId')
		);
	});

	it('submitPayment, should call next with thrown error if pay_date is passed, and is not valid date format', async () => {
		Database.getUser = jest
			.fn()
			.mockResolvedValueOnce('theUser')
			.mockResolvedValueOnce('theRecepientUser');

		requestObject.body.pay_date = 'badDateFormat';

		await submitPayment(requestObject, responseObject, nextFunction);

		expect(nextFunction).toBeCalledWith(
			new ResponseError(ERRORS.INVALID_PAY_DATE_FORMAT, 'badDateFormat')
		);
	});

	it('submitPayment, should call next with thrown error if pay_date is passed, and is not a present or future date', async () => {
		Database.getUser = jest
			.fn()
			.mockResolvedValueOnce('theUser')
			.mockResolvedValueOnce('theRecepientUser');

		requestObject.body.pay_date = '2022-01-01';

		await submitPayment(requestObject, responseObject, nextFunction);

		expect(nextFunction).toBeCalledWith(
			new ResponseError(ERRORS.INVALID_PAY_DATE_RANGE, '2022-01-01')
		);
	});

	it('submitPayment, should call next with thrown error if passed amount is negative', async () => {
		Database.getUser = jest
			.fn()
			.mockResolvedValueOnce('theUser')
			.mockResolvedValueOnce('theRecepientUser');

		requestObject.body.amount = -1;

		await submitPayment(requestObject, responseObject, nextFunction);

		expect(nextFunction).toBeCalledWith(
			new ResponseError(ERRORS.NEGATIVE_AMOUNT_INVALID)
		);
	});

	it('submitPayment, should call next with thrown error if pay_date is not dated for today, or the next business day, and the user does not have sufficient funds ', async () => {
		Database.getUser = jest
			.fn()
			.mockResolvedValueOnce({ getBalance: jest.fn().mockResolvedValue(0) })
			.mockResolvedValueOnce('theRecepientUser');

		requestObject.body.amount = 10;

		await submitPayment(requestObject, responseObject, nextFunction);

		expect(nextFunction).toBeCalledWith(
			new ResponseError(ERRORS.INSUFFICIENT_BALANCE)
		);
	});

	it('processPayment, for INSTANT transfer, should perform fund transfer and create payment record', async () => {
		const mockUser = {
			getBalance: jest.fn().mockResolvedValue(100),
			subtractBalance: jest.fn(),
			addBalance: jest.fn(),
		};
		Database.getUser = jest.fn().mockResolvedValue(mockUser);

		requestObject.body.amount = 10;
		const user = new User('theUserId', 'theName', 100);
		const recipientUser = new User('theRecipientId', 'theRecipientName', 100);
		const result = await processPayment(
			'INSTANT',
			user,
			recipientUser,
			50,
			'theDescription',
			'theBeneficiaryName',
			null
		);

		expect(mockUser.subtractBalance).toBeCalledWith(50);
		expect(mockUser.addBalance).toBeCalledWith(50);
	});
});
