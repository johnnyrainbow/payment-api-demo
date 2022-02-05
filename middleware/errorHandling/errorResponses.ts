import { NextFunction, Request, Response } from 'express';
import ERRORS from './codes.json';

export class ResponseError {
	statusCode: string;
	message: string;
	injectedInfo: string;

	constructor(error: any, injectedInfo?: any) {
		this.statusCode = error.code;
		this.message = error.message;
		this.injectedInfo = injectedInfo;
	}
}

const send = (
	res: Response,
	type: string,
	statusCode: number,
	message: string
) => {
	return res
		.status(statusCode)
		.send({ success: false, error: { type, message } });
};

export const handleError = (
	err: ResponseError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const handledError = handleSupportedErrors(err);

	if (handledError) {
	
		handledError.message = handledError.message.replace('${VALUE}', handledError.injectedInfo);
		return send(
			res,
			handledError.type,
			handledError.code,
			handledError.message
		);
	}

	return send(res, 'UNKNOWN ERROR', 500, 'Unknown');
};

const handleSupportedErrors = (err: ResponseError) => {
	for (const error in ERRORS) {
		if (ERRORS[error].message === err.message)
			return {
				type: error,
				code: ERRORS[error].code,
				message: err.message,
				injectedInfo: err.injectedInfo,
			};
	}
	return null;
};
