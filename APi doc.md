Upload Statements
Method: POST
URL: https://api2.bankstatementconverter.com/api/v1/BankStatement
Headers: { Authorization: api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH
Body: Multipart Form Data
Response

[
  {
    "uuid": "bb2f3c62-331e-42ee-a931-d25a5ee0946f",
    "filename": "bankstatement.pdf",
    "pdfType": "TEXT_BASED",
    "state": "READY"
  }
]
Get Upload Status
This API is only needed if the upload API responds with a state value of PROCESSING.

This happens when uploading a scanned or image based PDF.

We recommend polling this API every ten seconds until the status changes from PROCESSING to READY.

Method: POST
URL: https://api2.bankstatementconverter.com/api/v1/BankStatement/status
Headers: { Authorization: api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH
Body: A list of UUID strings in JSON. The UUID comes from the response of the Upload PDF API.
Request Body
["b0df4b60-1ab7-4edf-bf87-4664f91a67b7"]
Response Body
[
  {
    "uuid": "b0df4b60-1ab7-4edf-bf87-4664f91a67b7",
    "filename": "bankstatement.pdf",
    "pdfType": "IMAGE_BASED",
    "state": "READY"
  }
]
Convert Statements
Method: POST
URL: https://api2.bankstatementconverter.com/api/v1/BankStatement/convert?format=JSON
Headers: { Authorization: api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH
Body: A list of UUID strings in JSON. The UUID comes from the response of the Upload PDF API.
Request Body
["b0df4b60-1ab7-4edf-bf87-4664f91a67b7"]
Response Body
[{
  "normalised": [
    {
      "date": "03/08/20",
      "description": "Monthly Service Fee",
      "amount": "-5.00"
    }
  ]
}]
Provide a password for uploaded PDFs
This API is only needed if the PDFs you uploaded have passwords.

Method: POST
URL: https://api2.bankstatementconverter.com/api/v1/BankStatement/setPassword
Headers: { Authorization: api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH
Body: A list of uuids and passwords
Request Body
{
  "passwords": [
    { "uuid": "b0df4b60-1ab7-4edf-bf87-4664f91a67b7", "password": "elephant" }
  ]
}
Response Body
[
  {
    "uuid": "b0df4b60-1ab7-4edf-bf87-4664f91a67b7",
    "filename": "locked.pdf",
    "pdfType": "TEXT_BASED",
    "state": "READY",
    "numberOfPages": 3
  }
]
Get Remaining Credits
This API provides the credits you have left, along with other user information

Method: GET
URL: https://api2.bankstatementconverter.com/api/v1/user
Headers: { Authorization: api-AB7psQuumDdjVHLTPYMDghH2xUgaKcuJZVvwReMMsxM9iQBaYJg/BrelRUX07neH
Response Body
{
    "user": {
        "userId": 1,
        "firstName": "Erlich",
        "lastName": "Bachman",
        "email": "erlich@aviato.com",
        "emailVerified": true,
        "referralCode": "AVIATO1234",
        "apiKey": "[API_KEY]"
    },
    "credits": {
        "paidCredits": 20000,
        "freeCredits": 0
    },
    "unlimitedCredits": false,
    "subscriptionCount": 1
}