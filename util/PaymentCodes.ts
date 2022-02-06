/**
 * The INSTANT_SEND code. This payment code refers to any payment that
 * either has no pay_date, and is instantaneous, or is a future (2+ days out) payment being executed.
 *
 * @type {string}
 */
export const INSTANT_SEND: string = 'INSTANT';

/**
 * The SUBTRACT_NOW code. This payment code refers to any payment that
 * has been passed a pay_date that is for either today, or the next business day.
 *
 * It indicates that the sender's money has been immediately withdrawn.
 * @type {string}
 */
export const SUBTRACT_NOW: string = 'SUBTRACT_NOW';

/**
 * The FUTURE code. This payment code refers to any payment that
 * has been passed a pay_date that is for any future date beyond SUBTRACT_NOW policy
 *
 * It indicates that no money has been withdrawn from either party, and will not until the cron runs at 4am on pay_date
 * @type {string}
 */
export const FUTURE: string = 'FUTURE';

/**
 * The FUTURE_CREDIT_RECIPIENT_COMPLETE code. This payment code refers to
 * any FUTURE payment that is now due and has been run.
 *
 *  This is a resolved/completion code.
 * @type {string}
 */
export const FUTURE_CREDIT_RECIPIENT_COMPLETE: string =
	'FUTURE_CREDIT_RECIPIENT_COMPLETE';
