# Gift Cards

**Source:** [https://developer.commerce7.com/docs/gift-cards](https://developer.commerce7.com/docs/gift-cards)

**Section:** resources

---
# 
Gift card object
JSON
    
    {
        "id": "f8fc9780-86be-4638-9f31-792766135890",
        "title": "Virtual Gift Card",
        "type": "Virtual",
        "status": "Active",
        "giftCardNumber": 1041,
        "code": "LDA364DJGX111CIF",
        "initialAmount": 10000,
        "currentBalance": 10000,
        "expiryDate": null,
        "recipientEmail": "[[email protected]](/cdn-cgi/l/email-protection)",
        "fromName": "Andrew Kamphuis",
        "giftMessage": "Happy Birthday!",
        "notes": "",
        "productId": "c344d9a1-6c3e-438e-8b6b-27489a69ed9c",
        "purchasedOnOrderId": "a32610f4-4167-4eb8-acb0-7d1ebd6f04d9",
        "purchasedOnOrderNumber": 1812,
        "customerId": null,
        "createdAt": "2020-10-15T18:25:02.105Z",
        "updatedAt": "2020-10-15T18:25:02.200Z",
        "customer": null
    }
* * *
# 
Create gift card
**`POST`** `/gift-card`
JSON
    
    {
        "title": "Gift Card Title",
        "type": "Virtual",
        "code": "ABCDEFGH12345",
        "status": "Active",
        "initialAmount": 25000,
        "notes": "Gift Card Notes",
        "expiryDate": "2021-02-01T04:59:00.000Z"
    }
**Response**  
`gift-card` object
* * *
# 
Retrieve gift card
**`GET`** `/gift-card/{:id}`
**Response**  
`gift-card` object
* * *
# 
Update gift card
**`PUT`** `/gift-card/{:id}`
JSON
    
    {
        "title": "Edit Title",
        "status": "Active",
        "notes": "Edit GC",
        "expiryDate": "2021-02-07T04:59:00.000Z",
        "customerId": "204040a1-2b1b-476a-9baa-a312c61dd213"
    }
**Response**  
`gift-card` object
* * *
# 
Delete gift card
**`DELETE`** `/gift-card/{:id}`
**Response**  
Blank status and 204 status
* * *
# 
List gift cards
**`GET`** `/gift-card`
**Optional query parameters**
Param| Description  
---|---  
`q=n`|   
**Response**  
An array of `gift-card` objects and a total count.
JSON
    
    {
        "giftCards": [
            {
                "id": "7f7d2981-aae0-4dba-9927-f478ab31a077",
                "title": "Test Gift Card",
                "type": "Virtual",
                "status": "Active",
                "giftCardNumber": 1003,
                "code": "UZKJEYNX2FCVDJK3",
                "initialAmount": 5000,
                "currentBalance": 5000,
                "expiryDate": "2020-10-29T06:59:00.000Z",
                "recipientEmail": null,
                "fromName": null,
                "giftMessage": null,
                "notes": null,
                "productId": null,
                "purchasedOnOrderId": null,
                "purchasedOnOrderNumber": null,
                "customerId": null,
                "createdAt": "2020-10-19T21:52:14.423Z",
                "updatedAt": "2020-10-19T21:52:14.528Z",
                "customer": null
            },
            {
                "id": "33ad1a4e-574c-452f-80cf-9d2b55737194",
                "title": "Test Gift Card",
                "type": "Virtual",
                "status": "Active",
                "giftCardNumber": 1002,
                "code": "K0IS90XBDMWNGXU9",
                "initialAmount": 10000,
                "currentBalance": 10000,
                "expiryDate": null,
                "recipientEmail": null,
                "fromName": null,
                "giftMessage": null,
                "notes": null,
                "productId": null,
                "purchasedOnOrderId": null,
                "purchasedOnOrderNumber": null,
                "customerId": null,
                "createdAt": "2020-10-19T21:51:58.932Z",
                "updatedAt": "2020-10-19T21:51:59.015Z",
                "customer": null
            }
        ],
        "total": 2
    }
