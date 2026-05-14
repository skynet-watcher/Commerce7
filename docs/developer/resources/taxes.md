# Taxes

**Source:** [https://developer.commerce7.com/docs/taxes](https://developer.commerce7.com/docs/taxes)

**Section:** resources

---
[Taxes](https://documentation.commerce7.com/taxes-overview) are set based on the ship or pickup country, province, state, or zip code of an order. There are multiple ways to configure taxes within Commerce7.
* * *
# 
Tax object
JSON
    
    {
        "id": "016c5fea-5d7c-4555-b460-24852614a352",
        "title": "PST",
        "countryCode": "CA",
        "stateCode": "BC",
        "freight": 5,
        "food": 5,
        "generalMerchandise": 5,
        "wine": 5,
        "taxCalculation": "Added",
        "createdAt": "2018-05-18T16:53:46.620Z",
        "updatedAt": "2018-05-18T16:53:46.620Z"
    }
* * *
# 
Create tax
**`POST`** `/tax`
**Request**
JSON
    
    {
        "title": "TAX",
        "countryCode": "CA",
        "stateCode": "AB",
        "freight": 5,
        "food": 5,
        "generalMerchandise": 5,
        "wine": 7,
        "taxCalculation": "Added"
    }
**Response**  
`tax` object
* * *
# 
Retrieve tax
**`GET`** `/tax/{:id}`
**Response**  
`tax` object
* * *
# 
Update tax
**`PUT`** `/tax/{:id}`
**Request**
JSON
    
    {
        "title": "TAX",
        "countryCode": "CA",
        "stateCode": "BC",
        "freight": 5,
        "food": 5,
        "generalMerchandise": 5,
        "wine": 10,
        "taxCalculation": "Added"
    }
**Response**  
`tax` object
* * *
# 
Delete tax
**`DELETE`** `/tax/{:id}`
**Response**  
`tax` object with 204 status
* * *
# 
List taxes
**`GET`** `/tax`
**Response**  
An array of `tax` objects and total count
JSON
    
    {
        "taxes": [{
            "id": "54b4f5d6-7f13-4949-bb7d-7c5006e4e887",
            "title": "GST",
            "countryCode": "CA",
            "stateCode": null,
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "wine": 5,
            "taxCalculation": "Added",
            "createdAt": "2018-05-18T16:53:46.617Z",
            "updatedAt": "2018-05-18T16:53:46.617Z"
        }, {
            "id": "8d6779a4-67b8-4f9e-a1c6-2a9e687bb898",
            "title": "PST",
            "countryCode": "CA",
            "stateCode": "AB",
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "wine": 5,
            "taxCalculation": "Added",
            "createdAt": "2018-05-18T16:53:46.620Z",
            "updatedAt": "2018-05-18T16:53:46.620Z"
        }, {
            "id": "016c5fea-5d7c-4555-b460-24852614a352",
            "title": "PST",
            "countryCode": "CA",
            "stateCode": "BC",
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "wine": 5,
            "taxCalculation": "Added",
            "createdAt": "2018-05-18T16:53:46.620Z",
            "updatedAt": "2018-05-18T16:53:46.620Z"
        }, {
            "id": "f7c4e1c4-8519-4a45-9964-c1e26edde280",
            "title": "HST",
            "countryCode": "CA",
            "stateCode": "MB",
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "wine": 5,
            "taxCalculation": "Instead Of",
            "createdAt": "2018-05-18T16:53:46.620Z",
            "updatedAt": "2018-05-18T16:53:46.620Z"
        }, {
            "id": "1d822f37-89db-490c-81ce-e282f5150fcd",
            "title": "HST",
            "countryCode": "CA",
            "stateCode": "NB",
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "wine": 5,
            "taxCalculation": "Instead Of",
            "createdAt": "2018-05-18T16:53:46.621Z",
            "updatedAt": "2018-05-18T16:53:46.621Z"
        }],
        "total": 5
    }
