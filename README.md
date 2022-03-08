# Payments API
*A REST payments API using in memory storage for a psuedo database.*

This is the implementation of a technical assesment for [redacted] by Gabriel Kennedy

&nbsp;

### Part One – Book and View Payments

&nbsp;

For this task you’ll create a basic web service that allows a single user to manage and 
submit payments.
The service should comprise of a REST API, running in a technology of your choice. 
(Express is a popular choice for Node based applications). You can use in-memory 
storage in a database-like manner for the sake of this test.
The service should:
1. Allow a user to submit a payment.
2. Should perform some basic validation rules on the payment and reject any 
unusual payments (some example rules are provided below).
3. Should allow users to fetch payments information after they’ve been accepted.
4. Should allow users to amend payments to change anything about them.
Validation Rules
At a minimum your API should ensure that:
1. Payments for negative amounts cannot be submitted.
2. All payments have a beneficiary name associated with them.
3. All payments have a payment description associated with them.
Feel free to add rules of your own to the list.

&nbsp;

### Part Two - Keeping Balance
The user’s account now starts off with a balance of $1000. Update your service so 
that:
1. Each payment accepted by the system reduces the user’s balance.
2. New payments that would push the user into a negative balance are not 
accepted.
3. The user can query the balance at any time and get the correct result.

&nbsp;

### Part Three - Future Payments
Payments no longer need be made the same day they’re created. Payments can be 
scheduled to be up to a month in the future.
Update your service so that: 
1. Users can specify an optional PayDate on their payments in YYYY-MM-DD 
format
2. If a payment is dated for today, or for the next business day, it counts towards 
the balance
3. If a payment is further out, it does not count towards the balance.
4. A user can schedule payments in the future (i.e., 2 or more business days out), 
even if they don’t have the balance right now.
To simplify this part of the test, please ignore public holidays when calculating 
business days


&nbsp;


## Testing

Run `npm test`

&nbsp;

## DB structure

The in memory user DB is automatically populated from a `users.json` file, and contains two users.

```json
	{
		"id": "VQyftQazB",
		"name": "Jimbo",
		"balance": 1000
	},
	{
		"id": "AwSLfAsEf",
		"name": "Jones",
		"balance": 0
	}
```

Note: Some endpoints will require userId to be passed in naively as a URL query parameter `?userId=VQyftQazB`

&nbsp;
&nbsp;

# Endpoints

## Send a payment

`POST /payments/create?userId=:userId`

```javascript
 Body: {

    "amount": 100, //the amount to send
    "description": "Some description", //payment description
    "beneficiary_name": "Some Name",
    "beneficiary_id": "AwSLfAsEf", //the userId of the recipient
}

```

Additionally you can include the optional Body parameter 'pay_date', with the YYYY-MM-DD format to schedule this payment.

```javascript
{
	"pay_date": "2024-06-10" //OPTIONAL - the future date to schedule this payment
}
```

If the passed `pay_date` is dated for today, or for the next business day, it is immediately deducted from the sender's balance.

If `pay_date` is a future date beyond that, no funds will be deducted until the payment is run at 4am on that date. Immediate funds are not required to be in your account balance in order to schedule this type of future payment.

&nbsp;

### Response

the ID of the created payment.

```json
{
	"success": true,
	"result": {
		"paymentId": "MpJZ9eshR"
	}
}
```

&nbsp;

## Get a user's balance

`GET /users/:userId`

Retrieves the balance for a user

### Response

```json
{
	"success": true,
	"result": {
		"balance": 100
	}
}
```

&nbsp;

## Get a payment

`GET /payments/:paymentId`

Retrieves the details of a payment record

### Response

```json
{
	"success": true,
	"result": {
		"id": "vLajsqxIm",
		"amount": 100
	}
}
```

&nbsp;

## Update a payment

`PATCH /payments/:paymentId?userId=:userId`

Updates the details of a payment record. At this time only the description field can be updated.

### Response

Returns the updated payment record

```json
{
	"success": true,
	"result": {
		"payment": {
			"id": "vLajsqxIm",
			"amount": 100
		}
	}
}
```

&nbsp;

## Get all payments

`GET /payments`

Gets a list of all payment records

### Response

```json
{
	"success": true,
	"result": [
		{
			"id": "VddFbA5Hf",
			"amount": 100
		}
	]
}
```

## Get upcoming payments

`GET /payments/future/upcoming`

Gets all future payments that will run today

### Response

```json
{
	"success": true,
	"result": [
		{
			"id": "VddFbA5Hf",
			"amount": 100
		}
	]
}
```

&nbsp;

## Run all upcoming payments

`POST /payments/future/upcoming`

```javascript
Body: null;
```

Runs all upcoming payments scheduled for today

### Response

```json
{
	"success": true
}
```

&nbsp;

## Get all future payments

`GET /payments/future/all`

Gets all future payments

### Response

```json
{
	"success": true,
	"result": [
		{
			"id": "VddFbA5Hf",
			"amount": 100
		}
	]
}
```

&nbsp;

## Run all future payments

`POST /payments/future/all`

```javascript
Body: null;
```

Runs all upcoming payments scheduled, regardless of if they should run today

### Response

```json
{
	"success": true
}
```
