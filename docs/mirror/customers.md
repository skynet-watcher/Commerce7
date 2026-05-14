# Customers

**Source:** https://developer.commerce7.com/docs/customers

---

The Customers API allows you to manage, update, and search for customers in a client tenant. All fields on the `customer` object are optional except for email. (Customers could have one or more email address, but multiple emails must be unique.)
  * Customer object & ENUMs
  * Create customer
  * Create with address
  * Retrieve customer
  * Update customer
  * Delete customer
  * List customers


* * *
# 
Customer object
If no data exists, `null` will be returned.
Object
    
    {
        "id": "a36b6ff1-7190-49a0-895e-fd2c001eb2a6",
        "avatar": null,
        "honorific": "Mr",
        "firstName": "Jason",
        "lastName": "Andres",
        "birthDate": "1972-10-03",
        "city": "Napa",
        "stateCode": "CA",
        "zipCode": "94558",
        "countryCode": "US",
        "emailMarketingStatus": "Subscribed",
        "lastActivityDate": "2020-03-23T22:02:13.385Z",
        "facebookId": null,
        "metaData": {
            "gender": null
        },
        "appData": null,
        "appSync": null,
        "flags": [{
            "id": "8cf3f706-9123-4b74-94bb-e230fe8408d9",
            "content": "Give this customer free tastings"
        }],
        "notifications": [{
            "id": "185b0050-9918-4d86-91df-62e5570b9ec3",
            "type": "Order To Be Picked Up",
            "content": "Order #218072 is awaiting pickup.",
            "objectId": "e466fc90-0b82-464f-b915-7cc9c0717703"
            },
            {
                "id": "77a7694f-fe21-48a3-bcda-9128535e7eb5",
                "type": "Order To Be Picked Up",
                "content": "Order #218069 is awaiting pickup.",
                "objectId": "a79f0ba8-fbac-49af-a1a2-2bb42425e8e6"
            }
        ],
        "createdAt": "2020-01-22T19:50:37.096Z",
        "updatedAt": "2020-03-23T22:02:13.421Z",
        "orderInformation": {
            "currentWebCartId": null,
            "lastOrderId": "594340c7-f6fb-4a9c-9564-c860b6228f49",
            "lastOrderDate": "2020-03-17T18:48:51.919Z",
            "orderCount": 32,
            "lifetimeValue": 380273,
            "rank": 100,
            "rankTrend": "Up",
            "grossProfit": 249375,
            "currentClubTitle": "Big Club",
            "daysInCurrentClub": 6
        },
        "emails": [{
            "id": "26117008-2fce-4be0-bc65-020152fb5193",
            "email": "[[email protected]](/cdn-cgi/l/email-protection)"
        }],
        "phones": [{
            "id": "efd6fbe5-b443-4fdb-8e7d-45cfd8c94cea",
            "phone": "+17783477874"
            },
            {
                "id": "25824294-7569-494e-9715-3fe15af4cd96",
                "phone": "+17783477888"
            }
        ],
        "tags": [{
            "id": "703d758d-111f-4ecc-a48d-4887758574ee",
            "title": "My First Tag",
            "objectType": "Customer",
            "type": "Manual",
            "appliesToCondition": null,
            "createdAt": "2020-03-23T20:59:43.204Z",
            "updatedAt": "2020-03-23T22:00:04.400Z"
        }],
        "groups": [{
            "id": "703d758d-111f-4ecc-a48d-4887758574ee",
            "title": "My First Tag",
            "objectType": "Customer",
            "type": "Manual",
            "appliesToCondition": null,
            "createdAt": "2020-03-23T20:59:43.204Z",
            "updatedAt": "2020-03-23T22:00:04.400Z"
        }],
        "clubs": [{
            "clubId": "eac87925-977e-4c41-893d-521a073ac142",
            "clubTitle": "Big Club",
            "cancelDate": null,
            "signupDate": "2020-03-17T15:30:33.990Z",
            "clubMembershipId": "fb70edd5-be57-46bf-b60f-ccb17179824d"
        }],
        "products": [{
            "product": {
                "sku": "cskfg201701",
                "image": "https://images.commerce7.com/jason-demo-site/images/original/img_0001-1575063073456.jpg",
                "price": 10000,
                "title": "Kunfu Girl",
                "quantity": 1
            },
                "purchaseDate": "2020-03-17T18:48:51.919Z" 
            },
            {
                "product": {
                    "sku": "834506000086",
                    "image": "https://images.commerce7.com/jason-demo-site/images/original/img_1652-1567110681297.jpg",
                    "price": 2204,
                    "title": "Vineyard Syrah",
                    "quantity": 1
            },
                "purchaseDate": "2020-03-11T18:38:01.705Z"
            }
        ],
        "hasAccount": false
    }
## 
ENUMs
The enumerated customer fields and their values.
Field| Value  
---|---  
`honorific`| \- `Mr` \- `Ms` \- `Dr`  
`emailMarketingStatus`| \- `Subscribed` \- `Unsubscribed`  
`notifications` : `type`| \- `Order To Be Picked Up` \- `Active Club Membership Missing Address` \- `Active Club Membership Missing Credit Card` \- `Active Club Membership With Expired Card` \- `Card Declined On Last Club Process`  
`customerEmailStatus`| \- `Ok` \- `Bounced`  
* * *
# 
Create customer
**`POST`** `/customer`
**Request**
  * Pass `isSendTransactionEmail` of `false` if you don't want an email to be sent to the customer


JSON
    
    {
     "firstName": "Andrew",
     "lastName": "Kamphuis",
     "birthDate": "1973-11-15",
     "city": "Vancouver",
     "stateCode": "BC",
     "zipCode": "V6A1C2", 
     "countryCode": "CA",
     "emailMarketingStatus": "Subscribed",
     "phones": [{
    		"phone": "+16046135343"
     }],
     "emails": [{
    		"email": "[[email protected]](/cdn-cgi/l/email-protection)"
     }]
    }
**Response**  
`customer` object
* * *
# 
Create customer with address
**`POST`** `/customer-address`
> ❗️
> Pass `isSendTransactionEmail` of `false` if you don't want an email to be sent to customers
**Request**
JSON
    
    {
        "honorific": "Mr",
        "firstName": "Carisen",
        "lastName": "Randing",
        "address": "123 Main St",
        "address2": "Apt 201",
        "city": "Napa",
        "stateCode": "CA",
        "zipCode": "90210",
        "countryCode": "US",
        "emailMarketingStatus": null,
        "birthDate": "1960-05-01",
        "metaData": {
            "test": null
        },
        "emails": [
            {
                "email": "[[email protected]](/cdn-cgi/l/email-protection)"
            }
        ],
        "phones": [
            {
                "phone": "+15555555"
            }
        ],
        "orderInformation": {
            "acquisitionChannel": "Inbound"
        }
    }
**Response**  
`customer` object
* * *
# 
Retrieve customer
**`GET`** `/customer/{:id}`
**Response**  
`customer` object
* * *
# 
Update customer
**`PUT`** `/customer/{:id}`
**Request**
  * Include only the fields that you wish to update. Example below demonstrates an update to `birthDate`.


JSON
    
    {
     "birthDate": "1973-11-15"
    }
**Response**  
`customer` object
* * *
# 
Delete customer
**`DELETE`** `/customer/{:id}`
**Response**  
Blank object and 204 status
* * *
# 
List customers
**`GET`** `/customer`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`.  
Example: `/customer?q=andrew&orderCount=gt:1` lists customers with the name of Andrew and an order count greater than 1
Param| Description  
---|---  
`q=n`| Customer name  
Ex. `/customer?q=andrew`  
`lifetimeValue=n`| Lifetime value  
`orderCount=n`| Number of orders per customerDate format: YYYY-MM-DD  
Value options: `=`, `=gt:`, `gte:`, `=lt:`, `=lte:`  
Ex. `/customer?orderCount=gt:1`  
`createdAt=n`| Contact record creationDate format: YYYY-MM-DD  
Value options: `=`, `=gt:`, `gte:`, `=lt:`, `=lte:`  
**Response**  
Array of `customer` objects and total count.
JSON
    
    {
        "customers": [{
            "id": "a36b6ff1-7190-49a0-895e-fd2c001eb2a6",
            "avatar": null,
            "honorific": null,
            "firstName": "Jason",
            "lastName": "Andres",
            "birthDate": "1972-10-03",
            "city": "Napa",
            "stateCode": "CA",
            "zipCode": "94558",
            "countryCode": "US",
            "emailMarketingStatus": "Subscribed",
            "lastActivityDate": "2020-03-23T22:02:13.385Z",
            "facebookId": null,
            "metaData": {
            "gender": null
        },
            "appData": null,
            "appSync": null,
            "flags": [{
                "id": "8cf3f706-9123-4b74-94bb-e230fe8408d9",
                "content": "Give this customer free tastings"
            }],
            "notifications": [{
                "id": "185b0050-9918-4d86-91df-62e5570b9ec3",
                "type": "Order To Be Picked Up",
                "content": "Order #218072 is awaiting pickup.",
                "objectId": "e466fc90-0b82-464f-b915-7cc9c0717703"
            },
            {
                "id": "77a7694f-fe21-48a3-bcda-9128535e7eb5",
                "type": "Order To Be Picked Up",
                "content": "Order #218069 is awaiting pickup.",
                "objectId": "a79f0ba8-fbac-49af-a1a2-2bb42425e8e6"
            }
            ],
                "createdAt": "2020-01-22T19:50:37.096Z",
                "updatedAt": "2020-03-23T22:02:13.421Z",
                "orderInformation": {
                    "currentWebCartId": null,
                    "lastOrderId": "594340c7-f6fb-4a9c-9564-c860b6228f49",
                    "lastOrderDate": "2020-03-17T18:48:51.919Z",
                    "orderCount": 32,
                    "lifetimeValue": 380273,
                    "rank": 100,
                    "rankTrend": "Up",
                    "grossProfit": 249375,
                    "currentClubTitle": "Big Club",
                    "daysInCurrentClub": 6
            },
            "emails": [{
                "id": "26117008-2fce-4be0-bc65-020152fb5193",
                "email": "[[email protected]](/cdn-cgi/l/email-protection)"
            }],
            "phones": [{
                "id": "efd6fbe5-b443-4fdb-8e7d-45cfd8c94cea",
                "phone": "+17783477874"
            },
            {
                "id": "25824294-7569-494e-9715-3fe15af4cd96",
                "phone": "+17783477888"
            }
            ],
            "tags": [{
                "id": "703d758d-111f-4ecc-a48d-4887758574ee",
                "title": "My First Tag",
                "objectType": "Customer",
                "type": "Manual",
                "appliesToCondition": null,
                "createdAt": "2020-03-23T20:59:43.204Z",
                "updatedAt": "2020-03-23T22:00:04.400Z"
            }],
            "groups": [{
                "id": "703d758d-111f-4ecc-a48d-4887758574ee",
                "title": "My First Tag",
                "objectType": "Customer",
                "type": "Manual",
                "appliesToCondition": null,
                "createdAt": "2020-03-23T20:59:43.204Z",
                "updatedAt": "2020-03-23T22:00:04.400Z"
            }],
            "clubs": [{
                "clubId": "eac87925-977e-4c41-893d-521a073ac142",
                "clubTitle": "Big Club",
                "cancelDate": null,
                "signupDate": "2020-03-17T15:30:33.990Z",
                "clubMembershipId": "fb70edd5-be57-46bf-b60f-ccb17179824d"
            }],
            "products": [{
                "product": {
                    "sku": "cskfg201701",
                    "image": "https://images.commerce7.com/jason-demo-site/images/original/img_0001-1575063073456.jpg",
                    "price": 10000,
                    "title": "Kunfu Girl",
                    "quantity": 1
                },
                "purchaseDate": "2020-03-17T18:48:51.919Z"
                },
                {
                "product": {
                    "sku": "834506000086",
                    "image": "https://images.commerce7.com/jason-demo-site/images/original/img_1652-1567110681297.jpg",
                    "price": 2204,
                    "title": "Vineyard Syrah",
                    "quantity": 1
                },
                "purchaseDate": "2020-03-11T18:38:01.705Z"
            }
            ],
            "hasAccount": false
            },
            {"id": "99b62452-5115-488f-97a2-976a35459652",
            "avatar": null,
            "honorific": null,
            "firstName": "Jane",
            "lastName": "Doe",
            "birthDate": "1950-12-25",
            "city": "Napa",
            "stateCode": "CA",
            "zipCode": "94558",
            "countryCode": "US",
            "emailMarketingStatus": null,
            "lastActivityDate": "2019-05-08T21:27:03.251Z",
            "facebookId": null,
            "metaData": {
                "gender": "Male",
                "string-required": "test"
            },
            "appData": null,
            "appSync": null,
            "flags": [],
            "notifications": [{
                "id": "03360158-b46a-4a5a-bba1-3234851d05f7",
                "type": "Order To Be Picked Up",
                "content": "Order #217647 is awaiting pickup.",
                "objectId": "04975ce2-1ec0-435b-a4cd-c403137d50ac"
            },
            {
                "id": "0d5b12c1-0776-4941-a340-4aa83c803c0a",
                "type": "Order To Be Picked Up",
                "content": "Order #187180 is awaiting pickup.",
                "objectId": "466a5743-1d99-4b9a-b153-86e3061a4622"
            },
            {
                "id": "738bc3a7-1fb2-4c4c-985b-acf4a684d260",
                "type": "Order To Be Picked Up",
                "content": "Order #217639 is awaiting pickup.",
                "objectId": "8222e9e7-81d2-461a-bdc2-b1d0e787a29d"
            }
            ],
            "createdAt": "2018-09-07T23:20:27.541Z",
            "updatedAt": "2020-03-23T22:19:18.054Z",
            "orderInformation": {
                "currentWebCartId": null,
                "lastOrderId": "04975ce2-1ec0-435b-a4cd-c403137d50ac",
                "lastOrderDate": "2019-05-08T21:27:02.288Z",
                "orderCount": 13,
                "lifetimeValue": 103167,
                "rank": 0,
                "rankTrend": null,
                "grossProfit": 57193,
                "currentClubTitle": "Red Club",
                "daysInCurrentClub": 475
            },
            "emails": [{
                "id": "99841a25-9ec5-4cb7-8775-62dbfb677a69",
                "email": "[[email protected]](/cdn-cgi/l/email-protection)"
            }],
            "phones": [{
                "id": "818453fd-88a8-4116-8f2f-c994219ecc36",
                "phone": "+17075555555"
            }],
            "tags": [],
            "groups": [],
            "clubs": [{
                "clubId": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
                "clubTitle": "Red Club",
                "cancelDate": null,
                "signupDate": "2018-12-04T21:43:08.087Z",
                "clubMembershipId": "4894b73e-bd0c-4216-9c45-8b9af89f147e"
            }],
            "products": [{
                "product": {
                    "sku": "109711",
                    "image": "https://images.commerce7.com/images/noimages/original/no-image.png",
                    "price": 4499,
                    "title": "Spey Tenne Tawny Port Finish",
                    "quantity": 1
                },
                "purchaseDate": "2019-05-08T21:27:02.288Z"
                },
                {
                "product": {
                    "sku": "jasonwine",
                    "image": "https://images.commerce7.com/jason-demo-site/images/original/spectra-rose-1522095037811-1556831506031.png",
                    "price": 10000,
                    "title": "Jason Wine 2006 - 750ml",
                    "quantity": 1
                },
                "purchaseDate": "2019-05-08T21:27:02.288Z"
                },
                {
                "product": {
                    "sku": "poster",
                    "image": "https://images.commerce7.com/images/noimages/original/no-image.png",
                    "price": 0,
                    "title": "Poster",
                    "quantity": 1
                },
                "purchaseDate": "2019-05-08T21:27:02.288Z"
            }
            ],
            "hasAccount": false
        }],
        "total": 2
    }
