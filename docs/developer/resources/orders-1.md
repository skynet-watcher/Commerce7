# Orders

**Source:** [https://developer.commerce7.com/docs/orders-1](https://developer.commerce7.com/docs/orders-1)

**Section:** resources

---
Orders are customer purchases made through Commerce7 online, in the Admin, or on the POS. "Orders" refers to completed orders, whereas a "Cart" is an order that is started, but is not yet complete.
  * Order object & ENUMs
  * Create order (and upsert)
  * Retrieve order
  * List orders
  * Set starting order number


* * *
# 
Order object
Object
    
    {
        "id": "cf61d2ca-41d5-44f4-8e46-17ef90c83920",
        "orderSubmittedDate": "2018-12-04T19:10:27.905Z",
        "orderPaidDate": "2018-12-04T19:10:28.143Z",
        "orderNumber": 1248,
        "orderSource": "Internal",
        "previousOrderId": null,
        "previousOrderNumber": null,
      	"linkedOrders": [],
        "paymentStatus": "Paid",
        "complianceStatus": "No Compliance",
        "fulfillmentStatus": "Not Fulfilled",
        "cartId": "cf61d2ca-41d5-44f4-8e46-17ef90c83920",
        "channel": "Web",
        "posProfileId": null,
        "customerId": "c48d6fbd-e235-4ffd-a527-d9dd25e8d2c2",
        "orderDeliveryMethod": "Ship",
        "shippingInstructions": null,
        "taxSaleType": "Offsite",
        "subTotal": 4500,
        "shipTotal": 0,
        "taxTotal": 540,
        "dutyTotal": 0,
        "bottleDepositTotal": 0,
        "tipTotal": 0,
        "total": 5040,
        "totalAfterTip": 5040,
        "giftMessage": null,
        "allowPromotions": true,
        "flags": [],
        "productTenantId": null,
        "isNonTaxable": false,
        "createdAt": "2018-12-02T18:45:17.895Z",
        "updatedAt": "2018-12-04T19:10:28.144Z",
        "club": null,
        "shipping": [{
            "id": "fe92be1e-8791-4c2b-93c6-d10643a730ed",
            "title": "Ground",
            "code": "FEX",
            "service": "Ground",
            "shippingServiceId": "cff90aaa-f12a-4f57-b511-5504a5aad34b",
            "price": 0,
            "originalPrice": 0,
            "isQualifiesForPrime": false,
            "tax": 0
        }],
        "coupons": [],
        "shipTo": {
            "id": "801a34ff-dc02-452f-b143-34522f12d714",
            "customerAddressId": "b092d0c0-0d4b-4f3b-9b61-87c52f11d40e",
            "birthDate": "1990-01-01",
            "honorific": null,
            "firstName": "Zachary",
            "lastName": "Kamphuis",
            "company": null,
            "phone": "+16042175161",
            "address": "1051 Broughton Street",
            "address2": "unit 103",
            "city": "Vancouver",
            "stateCode": "BC",
            "zipCode": "v6g0b6",
            "countryCode": "CA"
        },
        "billTo": {
            "id": "59f8209b-c879-4b11-8b9e-3be17e63a57a",
            "customerAddressId": "b092d0c0-0d4b-4f3b-9b61-87c52f11d40e",
            "birthDate": "1990-01-01",
            "honorific": null,
            "firstName": "Zachary",
            "lastName": "Kamphuis",
            "company": null,
            "phone": "+16042175161",
            "address": "1051 Broughton Street",
            "address2": "unit 103",
            "city": "Vancouver",
            "stateCode": "BC",
            "zipCode": "v6g0b6",
            "countryCode": "CA"
        },
        "pickupBy": null,
        "carryOut": null,
        "promotions": [],
        "tenders": [{
            "id": "a0a385e8-b6ef-4970-a28e-10173274aecf",
            "refundId": null,
            "previousTenderId": null,
            "tenderType": "Credit Card",
            "chargeType": "Capture",
            "chargeStatus": "Success",
            "amountTendered": 5040,
            "tip": 0,
            "errorCode": "",
            "paymentDate": "2018-12-04T19:10:28.128Z",
            "createdAt": "2018-12-02T18:45:18.008Z",
            "updatedAt": "2018-12-04T19:10:28.128Z",
            "creditCard": {
                "gateway": "No Gateway",
                "cardBrand": "MasterCard",
                "maskedCardNumber": "************5454",
                "expiryMo": 1,
                "expiryYr": 2023,
                "cardHolderName": "Zach Kamphuis",
                "oneTimeToken": null,
                "tokenOnFile": "fakeId",
                "processorResponse": null,
                "authorizationId": "fakeId",
                "customerCreditCardId": "fd10d818-9cf3-4178-9953-65d24c79813b"
            }
        }],
        "items": [{
            "id": "4c785d18-dd17-48a0-ad0e-d18378f5a997",
            "productTitle": "2014 Spectra Cabernet Sauvignon",
            "type": "Wine",
            "inventoryLocationId": null,
            "productId": "94d672d2-b9aa-4c2e-8c28-37fbc3a12f73",
            "productVariantTitle": "750ml",
            "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
            "image": "https://images.commerce7.com/spectrawinery/images/original/spectra-red-1522094480333.png",
            "sku": "2014-CS",
            "costOfGood": 700,
            "price": 4500,
            "originalPrice": 4500,
            "comparePrice": 4500,
            "bottleDeposit": 0,
            "quantity": 1,
            "quantityFulfilled": 0,
            "isPriceOverride": false,
            "tax": 540,
            "taxType": "Wine",
            "weight": 21,
            "hasShipping": true,
            "vendor": null,
            "volumeInML": 750,
            "departmentCode": "Wine",
            "allocationId": null,
            "departmentId": "ff78df8d-f7db-429a-9271-42e79aace894",
            "collectionIds": "53f25c13-3232-4759-8e2b-f67377e74d9b,6c02552a-e393-4d62-835c-e0314505115e,8c6550f0-1689-4055-804c-1b35059b0a28,3e18ab3f-c84b-4ace-9590-9560e749a50a"
        }],
        "fulfillments": [],
        "taxes": [{
            "id": "3613d489-ea75-490a-b152-71ecbe1a8c9f",
            "vendor": "Local",
            "title": "GST",
            "countryCode": "CA",
            "stateCode": null,
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "cannabis": 0,
            "wine": 5,
            "price": 225,
            "isIncludedInPrice": false,
            "isNonTaxable": false
        }, {
        "id": "b4790734-7bb8-4720-a429-19807a40176c",
        "vendor": "Local",
        "title": "PST",
        "countryCode": "CA",
        "stateCode": "BC",
        "freight": 7,
        "food": 7,
        "generalMerchandise": 7,
        "cannabis": 0,
        "wine": 7,
        "price": 315,
        "isIncludedInPrice": false,
        "isNonTaxable": false
        }],
        "duties": [],
        "selectedShippingOptions": {
            "shippingServiceId": null
        }
    }
## 
ENUMs
The enumerated order fields and their values.
Field| Value  
---|---  
`channel`| Channel that the order took place.
  * `Inbound`
  * `Web`
  * `POS`
  * `Club`

  
`paymentStatus`| 
  * `Paid`
  * `Authorized`
  * `Cancelled`

  
`fulfillmentStatus`| 
  * `Fulfilled`
  * `Not Fulfilled`
  * `Partially Fulfilled`
  * `No Fulfillment Required`

  
`shippingStatus`| 
  * `Not Tracked`
  * `Pending`
  * `In Transit`
  * `Delivered`

  
`complianceStatus`| 
  * `Compliant`
  * `Forced`
  * `Not Checked`
  * `No Compliance Required`
  * `Quarantined`
  * `Void`

  
`orderDeliveryMethod`| 
  * `Pickup`
  * `Carry Out`
  * `Ship`Carryout is used for standard POS orders.

  
`taxSaleType`| 
  * `Offsite`
  * `Onsite`

  
`tenderType`| 
  * `Credit Card`
  * `Cash `
  * `COD`
  * `External`
  * `Debit`
  * `Gift Card`
  * `Other`
  * `Alipay`
  * `WeChat Pay`
  * `Loyalty Points`

  
`chargeStatus`| 
  * `Pending`
  * `Failed`
  * `Success`
  * `Waiting`
  * `Cancelled`

  
`chargeType`| 
  * `Sale`
  * `PreAuth`
  * `Cancel`
  * `Refund`

  
`cardBrand`| 
  * `Visa`
  * `MasterCard`
  * `American Express`
  * `Discover`
  * `JCB`
  * `Diners Club`
  * `Union Pay`
  * `Maestro`
  * `Unknown`

  
`purchaseType`| 
  * `Refund`
  * `Exchange`
  * `Pickup To Ship`
  * `Regular`
  * `Corporate Order`

  
## 
Cart object
For orders that are not yet completed, use the `cart` object.
Object
    
    {
        "object": "Cart",
        "action": "Update",
        "payload": {
            "id": "6b025777-32c9-4a71-83d4-1e9e3322486c",
            "orderId": null,
            "previousOrderId": null,
            "orderNumber": null,
            "previousOrderNumber": null,
            "purchaseType": "Regular",
            "status": "Pending",
            "channel": "POS",
            "posProfileId": "6c4616f6-1fd1-4489-87d6-0076670cd483",
            "customerId": null,
            "email": null,
            "isSubscribe": false,
            "orderDeliveryMethod": "Carry Out",
            "shippingInstructions": null,
            "taxSaleType": "Onsite",
            "subTotal": 1900,
            "bottleDepositTotal": 0,
            "tipTotal": 0,
            "total": 2047,
            "totalAfterTip": 2047,
            "giftMessage": null,
            "metaData": null,
            "errors": [],
            "pos": {
                "name": "Guest 1",
                "userId": "5677f694-de65-4f93-9e0a-e0de7a59df49",
                "initials": "G1"
            },
            "isNonTaxable": false,
            "isNoDuty": false,
            "createdAt": "2021-02-03T01:03:17.135Z",
            "updatedAt": "2021-02-03T01:03:17.198Z",
            "customer": null,
            "additionalData": null,
            "club": null,
            "reservation": null,
            "shipping": [],
            "coupons": [],
            "shipTo": null,
            "billTo": null,
            "pickupBy": null,
            "carryOut": {
                "id": "c76d0a98-fd1d-4663-87ec-60079188b0f7",
                "inventoryLocationId": "2e838b60-bd74-4208-a0f9-1fa286322a24",
                "customerAddressId": null,
                "birthDate": null,
                "honorific": null,
                "firstName": null,
                "lastName": null,
                "company": null,
                "phone": "+15103685427",
                "address": "1234 Main Street",
                "address2": null,
                "city": "Napa",
                "stateCode": "CA",
                "zipCode": "94558",
                "countryCode": "US"
            },
            "carrierPickupLocation": null,
            "promotions": [
            {
                "id": "4fef1ea7-b5b0-49a5-a43c-34978a5c85be",
                "promotionId": "5000926e-2245-48b7-aec5-e5d5c4c5a7d9",
                "title": "$10 Off",
                "inUse": true,
                "productValue": 1000,
                "shippingValue": 0,
                "totalValue": 1000
            }
            ],
            "tenders": [],
            "taxes": [
            {
                "id": "258b1cc3-c851-486e-861a-dddc2b58c701",
                "vendor": "ShipCompliantLocal",
                "title": "Tax",
                "countryCode": "US",
                "stateCode": "CA",
                "zipCode": "94558",
                "freight": 0,
                "food": 0,
                "generalMerchandise": 7.75,
                "cannabis": 0,
                "wine": 7.75,
                "price": 147,
                "isIncludedInPrice": false,
                "isNonTaxable": false,
                "sortOrder": 0
            }
            ],
            "duties": [],
            "items": [
            {
                "id": "4c0a87bd-2609-4efd-ab8b-785c36db9e91",
                "purchaseType": "Regular",
                "productTitle": "2015 Chardonnay",
                "type": "Wine",
                "inventoryLocationId": null,
                "productId": "83040aba-ad87-416c-9815-6b04a566ffb9",
                "productVariantTitle": "bottle",
                "productVariantId": "ac85fcfb-d6c4-475c-a097-916bac68d5ad",
                "image": "https://images.commerce7.com/c7-now-seed/images/original/outshinery-commerce7-chard-1586028948795.png",
                "sku": "2015C",
                "price": 1900,
                "originalPrice": 2900,
                "comparePrice": 3500,
                "bottleDeposit": 0,
                "quantity": 1,
                "isPriceOverride": false,
                "isOverrideOperatingRegions": false,
                "tax": 147,
                "taxType": "Wine",
                "weight": 3,
                "hasShipping": true,
                "vendor": null,
                "volumeInML": 750,
                "departmentCode": "Wine",
                "allocationId": null,
                "departmentId": "588e42c2-d748-413e-8ff0-66ae5f27ecb9",
                "collectionIds": "0e4622bf-a804-4415-aab1-2ecc804de281,28315627-406e-42b5-ba74-8ae5b4f9714d",
                "bundleItems": null,
                "itemData": null
            }
            ],
            "selectedShippingOptions": {
                "shippingServiceId": null
            },
            "shippingTaxEstimate": {
                "stateCode": null,
                "countryCode": null,
                "zipCode": null
            },
            "connectionInformation": {
                "customerIpAddress": "192.168.0.30",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0"
            },
            "salesAssociate": {
                "accountId": "5677f694-de65-4f93-9e0a-e0de7a59df49",
                "name": "Dev Data"
            }
        },
        "user": "[[email protected]](/cdn-cgi/l/email-protection)",
        "tenantId": "example"
    }
* * *
# 
Create order
Creating or upserting an order can be used for historical data purposes. The order will not be charged.
**`POST`** `/order` \- Create a new order
**`PUT`** `/order/upsert` \- Delete the order if it exists, then `POST` it  
This is a slower method to upload orders, so only use this if you need to replace orders that were uploaded with incorrect information. For upserting orders:
> ❗️
> Pass `isSendTransactionEmail` of `false` if you don't want the Order Confirmation email to be sent to customers
**Request**  
Example of a historical order from the web, that was shipped and paid by credit card.
  * `customerId` has been set to null so this order is not attached to a customer.
    * To retain orders attached to customers, upload the customer first and ensure you upload the same `customerId`.
    * If you want to retain existing primary UUIDs, ensure your API user has the "Data" role set, [see here](/commerce7-apis#authentication) for more details.
  * If `orderFulfilledDate` is not provided will be populated with the `orderPaidDate`.
  * If upserting:
    * `orderNumber` and `externalOrderNumber` are both required
    * `orderNumber` is an integer with maximum number of `2,147,483,647`.
    * You can choose the Commerce7 `orderNumber`, but it must be unique


JSON
    
    {
        "channel": "Web",
        "posProfileId": null,
        "customerId": null,
        "orderNumber": "123456", // Commerce7 OrderNumber
        "externalOrderNumber": "123456",
        "externalOrderVendor": "WineDirect",
        "email": null,
        "orderDeliveryMethod": "Ship",
        "shippingInstructions": null,
        "taxSaleType": "Offsite",
        "subTotal": 1250,
        "bottleDepositTotal": 0,
        "total": 3413,
        "shipTotal": 2000,
        "taxTotal": 163,
        "paymentStatus": "Paid",
        "fulfillmentStatus": "Fulfilled",
        "giftMessage": null,
        "orderSubmittedDate": "2018-01-22T21:58:07.401Z",
        "orderPaidDate": "2018-02-22T15:32:01.301Z",
        "orderFulfilledDate": "2018-02-22T15:32:01.301Z",
        "shipping": [{
            "title": "DHL",
            "code": "ground",
            "service": "DHL",
            "shippingServiceId": "00000000-0000-0000-0000-000000000000",
            "price": 2000,
            "originalPrice": 2000,
            "tax": 100
        }],
        "coupons": [],
        "shipTo": {
            "birthDate": "1950-10-12",
            "honorific": null,
            "firstName": "Jason",
            "lastName": "Andres",
            "company": "Commerce7",
            "phone": "+17075555555",
            "address": "3425 Solano Ave",
            "address2": null,
            "city": "Napa",
            "stateCode": "CA",
            "zipCode": "94558",
            "countryCode": "US"
        },
        "billTo": {
            "birthDate": "1950-10-12",
            "honorific": null,
            "firstName": "Jason",
            "lastName": "Andres",
            "company": "Commerce7",
            "phone": "+17075555555",
            "address": "3425 Solano Ave",
            "address2": null,
            "city": "Napa",
            "stateCode": "CA",
            "zipCode": "94558",
            "countryCode": "US"
        },
        "pickupBy": null,
        "carryOut": null,
        "tenders": [{
            "refundId": null,
            "previousTenderId": null,
            "tenderType": "Credit Card",
            "chargeType": "Sale",
            "chargeStatus": "Success",
            "amountTendered": 3413,
            "errorCode": "",
            "paymentDate": "2018-02-22T15:32:01.301Z",
            "creditCardBrand": "MasterCard",
            "maskedCardNumber": "************5454",
            "creditCardExpiryMo": 2,
            "creditCardExpiryYr": 2020,
            "creditCardHolderName": "Jason Andres"
        }],
        "items": [{
            "productTitle": "2012 Spectra Cabernet Sauvignon",
            "type": "Wine",
            "inventoryLocationId": null,
            "productVariantTitle": "750ml",
            "image": "https://images.commerce7.com/jason-demo-site/images/original/spectra-red-1522094480333-1548194135724.png",
            "sku": "10000542012",
            "costOfGood": 300,
            "price": 1250,
            "originalPrice": 2500,
            "comparePrice": 2900,
            "bottleDeposit": 0,
            "quantity": 1,
            "quantityFulfilled": 1,
            "tax": 63,
            "taxType": "Wine",
            "weight": 3,
            "hasShipping": true,
            "vendor": "Spectra Winery",
            "volumeInML": 750,
            "departmentCode": "Wine",
            "allocationId": null,
            "bundleItems": null
        }],
        "taxes": [{
            "vendor": "Local",
            "title": "Tax",
            "countryCode": "US",
            "stateCode": "CA",
            "freight": 5,
            "food": 5,
            "generalMerchandise": 5,
            "cannabis": 0,
            "wine": 5,
            "price": 163,
            "isIncludedInPrice": false
        }]
    }
**Response**  
`order` object
* * *
# 
Retrieve order
**`GET`** `/order/{:id}`
**Response**  
`order` object
* * *
# 
List orders
**`GET`** `/order`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`.
Example:
  * `/order?channel=Web&orderPaidDate=gte:2021-01-01` lists all web orders with a paid date greater than January 1, 2021.
  * `/order?orderPaidDate=btw:2021-01-01|2021-02-01` lists all orders with a paid date between January 1, 2021 and February 1, 2021.


Param| Description  
---|---  
`q=n`|   
`customerId=n`| Specific customer ID  
`id=n`| Specific order ID  
`orderTagId=n`| Specific order tag ID  
`posProfileId=n`| Specific POS profile ID  
`tagId=n`| Specific tag ID  
`allocationId=n`| Specific allocation ID  
`queryId=n`| Specific query ID  
`updatedAt=n`| Last date and time the order was changedDate format: YYYY-MM-DD Date options: `=`, `=gt:`, `gte:`, `=lt:`, `=lte:`  
`orderPaidDate=n`| Date and time that the order payment was completedDate format: YYYY-MM-DD  
Date options: `=`, `=gt:`, `gte:`, `=lt:`, `=lte:` `=btw:`  
`orderFulfilledDate=n`| Date and time that the order was marked "Fulfilled"Date format: YYYY-MM-DD  
Date options: `=`, `=gt:`, `gte:`, `=lte:`, `=lt:`, `btw:`  
`orderSubmittedDate=n`| Date and time that the order was submittedDate format: YYYY-MM-DD  
Date options: `=`, `=gt:`, `gte:`, `=lte:`, `=lt:`, `btw:`  
`fulfillmentStatus=n`| Matching a fulfillment status:
  * `Fulfilled`
  * `Not Fulfilled`
  * `Partially Fulfilled`
  * `No Fulfillment Required`

  
`complianceStatus=n`| Matching a compliance status:
  * `Compliant`
  * `Forced`
  * `Not Checked`
  * `No Compliance Required`
  * `Quarantined`
  * `Void`

  
`channel=n`| For a specific channel:
  * `Inbound`
  * `Web`
  * `POS`
  * `Club`

  
`orderDeliveryMethod=n`| For a specific order delivery method
  * `Pickup`
  * `Carry Out`
  * `Ship`

  
**Response**  
Array of `order` objects with total count
JSON
    
    {
    "orders": [
    {
    "id": "d0052cb7-f4b4-4e38-86c0-a5a003442ee6",
    "orderSubmittedDate": "2018-11-06T23:31:20.691Z",
    "orderPaidDate": "2018-11-06T23:31:21.059Z",
    "orderNumber": 1200,
    "orderSource": "Internal",
    "previousOrderId": null,
    "previousOrderNumber": null,
    "refundOrderId": null,
    "refundOrderNumber": null
    "paymentStatus": "Paid",
    "complianceStatus": "No Compliance",
    "fulfillmentStatus": "Fulfilled",
    "cartId": "d0052cb7-f4b4-4e38-86c0-a5a003442ee6",
    "channel": "POS",
    "posProfileId": null,
    "customerId": "c48d6fbd-e235-4ffd-a527-d9dd25e8d2c2",
    "orderDeliveryMethod": "Pickup",
    "shippingInstructions": null,
    "taxSaleType": "Offsite",
    "subTotal": 11000,
    "shipTotal": 0,
    "taxTotal": 1320,
    "dutyTotal": 0,
    "bottleDepositTotal": 0,
    "tipTotal": 0,
    "total": 12320,
    "totalAfterTip": 12320,
    "giftMessage": null,
    "allowPromotions": true,
    "flags": [],
    "productTenantId": null,
    "isNonTaxable": false,
    "createdAt": "2018-11-06T23:31:06.752Z",
    "updatedAt": "2018-11-08T21:24:25.356Z",
    "club": null,
    "shipping": [],
    "coupons": [],
    "shipTo": null,
    "billTo": {
    "id": "4176f32c-28fd-42c3-8061-041e46d9c1e6",
    "customerAddressId": "b092d0c0-0d4b-4f3b-9b61-87c52f11d40e",
    "birthDate": "1995-06-11",
    "honorific": null,
    "firstName": "Zachary",
    "lastName": "Kamphuis",
    "company": null,
    "phone": "+16042175161",
    "address": "1051 Broughton Street",
    "address2": "unit 103",
    "city": "Vancouver",
    "stateCode": "BC",
    "zipCode": "v6g0b6",
    "countryCode": "CA"
    },
    "pickupBy": {
    "id": "b06ca098-8cd4-4130-b335-f7e6bd8db0c0",
    "inventoryLocationId": "88145cdc-f5a6-11e8-a80a-06d2aa911ccc",
    "customerAddressId": null,
    "birthDate": "1995-06-11",
    "honorific": null,
    "firstName": "Zach",
    "lastName": "Kamphuis",
    "company": null,
    "phone": "+16042175161",
    "address": "27 Alexander",
    "address2": null,
    "city": "Vancouver",
    "stateCode": "BC",
    "zipCode": "V6A1B2",
    "countryCode": "CA"
    },
    "carryOut": null,
    "promotions": [],
    "tenders": [
    {
    "id": "52550613-cd99-41fd-ba30-94c5113db50f",
    "refundId": null,
    "previousTenderId": null,
    "tenderType": "Credit Card",
    "chargeType": "Capture",
    "chargeStatus": "Success",
    "amountTendered": 12320,
    "tip": 0,
    "errorCode": "",
    "paymentDate": "2018-11-06T23:31:21.048Z",
    "createdAt": "2018-11-06T23:31:09.952Z",
    "updatedAt": "2018-11-06T23:31:21.048Z",
    "creditCard": {
        "gateway": "No Gateway",
        "cardBrand": "MasterCard",
        "maskedCardNumber": "************5454",
        "expiryMo": 1,
        "expiryYr": 2023,
        "cardHolderName": "Zach Kamphuis",
        "oneTimeToken": null,
        "tokenOnFile": "fakeId",
        "processorResponse": null,
        "authorizationId": "fakeId",
        "customerCreditCardId": "fd10d818-9cf3-4178-9953-65d24c79813b"
    }
    }
    ],
    "items": [
    {
    "id": "2e99070c-251a-453f-ac09-c3f5bfaadd57",
    "productTitle": "2017 Spectra Cabernet Sauvignon",
    "type": "Wine",
    "inventoryLocationId": null,
    "productId": "606ed5f8-c1ef-4919-ac2c-00f6f963bb2c",
    "productVariantTitle": "1.5L",
    "productVariantId": "047e7f1a-7a73-46f9-9185-a3c2fd39ee34",
    "image": "https://images.commerce7.com/demo/images/original/black-bottle---alchemy-1521133555447.jpg",
    "sku": "2017-CS-l",
    "costOfGood": 1000,
    "price": 11000,
    "originalPrice": 11000,
    "comparePrice": 11000,
    "bottleDeposit": 0,
    "quantity": 1,
    "quantityFulfilled": 1,
    "isPriceOverride": false,
    "tax": 1320,
    "taxType": "Wine",
    "weight": 0,
    "hasShipping": true,
    "vendor": null,
    "volumeInML": 1500,
    "departmentCode": "Wine",
    "allocationId": null,
    "departmentId": null,
    "collectionIds": null
    }
    ],
    "fulfillments": [
    {
    "id": "5202c63e-ca72-4cf0-8c30-92a03204fc67",
    "type": "Picked Up",
    "fulfillmentDate": "2018-11-08T08:00:00.000Z",
    "packageCount": 1,
    "items": [
        {
            "sku": "2017-CS-l",
            "quantityFulfilled": 1
        }
    ],
    "pickedUp": {
        "pickedUpBy": "zach"
    }
    }
    ],
    "taxes": [
    {
    "id": "19a101e3-ea46-4f73-90eb-561b2fa66353",
    "vendor": "Local",
    "title": "PST",
    "countryCode": "CA",
    "stateCode": "BC",
    "freight": 7,
    "food": 7,
    "generalMerchandise": 7,
    "cannabis": 0,
    "wine": 7,
    "price": 770,
    "isIncludedInPrice": false,
    "isNonTaxable": false
    }
    ]
    },
    {
    "id": "cf61d2ca-41d5-44f4-8e46-17ef90c83920",
    "orderSubmittedDate": "2018-12-04T19:10:27.905Z",
    "orderPaidDate": "2018-12-04T19:10:28.143Z",
    "orderNumber": 1248,
    "orderSource": "Internal",
    "previousOrderId": null,
    "previousOrderNumber": null,
    "refundOrderId": null,
    "refundOrderNumber": null,
    "paymentStatus": "Paid",
    "complianceStatus": "No Compliance",
    "fulfillmentStatus": "Not Fulfilled",
    "cartId": "cf61d2ca-41d5-44f4-8e46-17ef90c83920",
    "channel": "Web",
    "posProfileId": null,
    "customerId": "c48d6fbd-e235-4ffd-a527-d9dd25e8d2c2",
    "orderDeliveryMethod": "Ship",
    "shippingInstructions": null,
    "taxSaleType": "Offsite",
    "subTotal": 4500,
    "shipTotal": 0,
    "taxTotal": 540,
    "dutyTotal": 0,
    "bottleDepositTotal": 0,
    "tipTotal": 0,
    "total": 5040,
    "totalAfterTip": 5040,
    "giftMessage": null,
    "allowPromotions": true,
    "flags": [],
    "productTenantId": null,
    "isNonTaxable": false,
    "createdAt": "2018-12-02T18:45:17.895Z",
    "updatedAt": "2018-12-04T19:10:28.144Z",
    "club": null,
    "shipping": [
    {
    "id": "fe92be1e-8791-4c2b-93c6-d10643a730ed",
    "title": "Ground",
    "code": "FEX",
    "service": "Ground",
    "shippingServiceId": "cff90aaa-f12a-4f57-b511-5504a5aad34b",
    "price": 0,
    "originalPrice": 0,
    "isQualifiesForPrime": false,
    "tax": 0
    }
    ],
    "coupons": [],
    "shipTo": {
    "id": "801a34ff-dc02-452f-b143-34522f12d714",
    "customerAddressId": "b092d0c0-0d4b-4f3b-9b61-87c52f11d40e",
    "birthDate": "1995-06-11",
    "honorific": null,
    "firstName": "Zachary",
    "lastName": "Kamphuis",
    "company": null,
    "phone": "+16042175161",
    "address": "1051 Broughton Street",
    "address2": "unit 103",
    "city": "Vancouver",
    "stateCode": "BC",
    "zipCode": "v6g0b6",
    "countryCode": "CA"
    },
    "billTo": {
    "id": "59f8209b-c879-4b11-8b9e-3be17e63a57a",
    "customerAddressId": "b092d0c0-0d4b-4f3b-9b61-87c52f11d40e",
    "birthDate": "1995-06-11",
    "honorific": null,
    "firstName": "Zachary",
    "lastName": "Kamphuis",
    "company": null,
    "phone": "+16042175161",
    "address": "1051 Broughton Street",
    "address2": "unit 103",
    "city": "Vancouver",
    "stateCode": "BC",
    "zipCode": "v6g0b6",
    "countryCode": "CA"
    },
    "pickupBy": null,
    "carryOut": null,
    "promotions": [],
    "tenders": [
    {
    "id": "a0a385e8-b6ef-4970-a28e-10173274aecf",
    "refundId": null,
    "previousTenderId": null,
    "tenderType": "Credit Card",
    "chargeType": "Capture",
    "chargeStatus": "Success",
    "amountTendered": 5040,
    "tip": 0,
    "errorCode": "",
    "paymentDate": "2018-12-04T19:10:28.128Z",
    "createdAt": "2018-12-02T18:45:18.008Z",
    "updatedAt": "2018-12-04T19:10:28.128Z",
    "creditCard": {
        "gateway": "No Gateway",
        "cardBrand": "MasterCard",
        "maskedCardNumber": "************5454",
        "expiryMo": 1,
        "expiryYr": 2023,
        "cardHolderName": "Zach Kamphuis",
        "oneTimeToken": null,
        "tokenOnFile": "fakeId",
        "processorResponse": null,
        "authorizationId": "fakeId",
        "customerCreditCardId": "fd10d818-9cf3-4178-9953-65d24c79813b"
    }
    }
    ],
    "items": [
    {
    "id": "4c785d18-dd17-48a0-ad0e-d18378f5a997",
    "productTitle": "2014 Spectra Cabernet Sauvignon",
    "type": "Wine",
    "inventoryLocationId": null,
    "productId": "94d672d2-b9aa-4c2e-8c28-37fbc3a12f73",
    "productVariantTitle": "750ml",
    "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
    "image": "https://images.commerce7.com/spectrawinery/images/original/spectra-red-1522094480333.png",
    "sku": "2014-CS",
    "costOfGood": 700,
    "price": 4500,
    "originalPrice": 4500,
    "comparePrice": 4500,
    "bottleDeposit": 0,
    "quantity": 1,
    "quantityFulfilled": 0,
    "isPriceOverride": false,
    "tax": 540,
    "taxType": "Wine",
    "weight": 21,
    "hasShipping": true,
    "vendor": null,
    "volumeInML": 750,
    "departmentCode": "Wine",
    "allocationId": null,
    "departmentId": "ff78df8d-f7db-429a-9271-42e79aace894",
    "collectionIds": "53f25c13-3232-4759-8e2b-f67377e74d9b,6c02552a-e393-4d62-835c-e0314505115e,8c6550f0-1689-4055-804c-1b35059b0a28,3e18ab3f-c84b-4ace-9590-9560e749a50a"
    }
    ],
    "fulfillments": [],
    "taxes": [
    {
    "id": "3613d489-ea75-490a-b152-71ecbe1a8c9f",
    "vendor": "Local",
    "title": "GST",
    "countryCode": "CA",
    "stateCode": null,
    "freight": 5,
    "food": 5,
    "generalMerchandise": 5,
    "cannabis": 0,
    "wine": 5,
    "price": 225,
    "isIncludedInPrice": false,
    "isNonTaxable": false
    }
    ]
    }
    ],
    "total": 2
    }
* * *
# 
Set starting order number
**`PUT`** `/order-number`
**Request**
JSON
    
    {
      "orderNumber": 30000
    }
**Response**  
An update record
