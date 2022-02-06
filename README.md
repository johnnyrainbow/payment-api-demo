# Paytron Payments API

REST payments API using in memory storage for psuedo database.

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

```json
Request Body: {

    "amount": 100, //the amount to send
    "description": "Some description", //payment description
    "beneficiary_name": "Some Name",
    "beneficiary_id": "AwSLfAsEf", //the userId of the recipient
}

```

Additionally you can include the optional Body parameter 'pay_date', with the YYYY-MM-DD format to schedule this payment.

```json
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
			"amount": 100,
            ...
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
			"amount": 100,
            ...
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
            "amount": 100,
            ...
        },
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
            "amount": 100,
            ...
        },
    ]
}
```

&nbsp;

## Run all upcoming payments

`POST /payments/future/upcoming`

```json
Request Body: null
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
            "amount": 100,
            ...
        },
    ]
}
```

&nbsp;

## Run all future payments

`POST /payments/future/all`

```json
Request Body: null
```

Runs all upcoming payments scheduled, regardless of if they should run today

### Response

```json
{
	"success": true
}
```
