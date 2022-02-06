const bodyParser = require('body-parser');
const express = require('express');

import { Database } from './db/Database';
import { handleError } from './middleware/errorHandling/errorResponses';

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

require('./routes/paymentRoutes')(app);
require('./routes/userRoutes')(app);

//error handling layer for REST error responses
app.use(handleError);

Database.loadDBFromJSON();

//start nightly 4am future payment cron process
Database.scheduleFuturePaymentCron();

app.listen(port, () => console.log(`API listening on port ${port}`));
