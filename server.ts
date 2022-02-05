const bodyParser = require('body-parser');
const express = require('express');

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
//error handling layer for REST error responses
app.use(handleError);

app.listen(port, () => console.log(`API listening on port ${port}`));
