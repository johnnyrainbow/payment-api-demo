import { Router } from 'express';
import { getUserBalance } from '../controllers/user';

module.exports = (app: Router) => {
	app.get(
		'/users/:userId', //naive userid reference
		getUserBalance
	);
};
