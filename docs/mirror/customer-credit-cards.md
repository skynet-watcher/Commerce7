# Customer Credit Cards

**Source:** https://developer.commerce7.com/docs/customer-credit-cards

---

Credit cards belong to a customer. A customer can have multiple credit cards.
Credit cards created through the API are immediately pushed to Stripe and tokenized. Only the token is stored inside Commerce7.
  * Credit card object & ENUMs
  * Create credit card
  * Retrieve credit card
  * Update credit card
  * Delete credit card
  * List credit cards


* * *
# 
Credit card object
Object
    
    {
     "id": "e804d4b3-e4e6-4a98-b395-4721d2002c77",
     "cardBrand": "Visa",
     "maskedCardNumber": "************1111",
     "expiryMo": 4,
     "expiryYr": 2027,
     "cardHolderName": "Jason Andres",
     "tokenOnFile": "Xt5EWLLDS7FJjR1c",
     "customerId": "9d30102b-afdf-42ca-9919-1500c730cac8",
     "isDefault": true,
     "createdAt": "2018-05-22T18:35:03.998Z",
     "updatedAt": "2018-05-22T18:35:03.998Z"
    }
## 
ENUMs
The enumerated credit card fields and their values.
Field| Value  
---|---  
`cardBrand`| `Visa`  
`American Express`  
`MasterCard`  
`Discover`  
`JCB`  
`Diners Club`  
`UnionPay`  
`Maestro`  
`Unknown`  
`gateway`| `No Gateway`  
`Commerce7Payments`  
`Stripe`  
`PayGate`  
`USAePay`  
`CardConnect`  
`Payment Express`  
`Poynt`  
> 📘
> ### 
> Gateway options when migrating tokens into Commerce7:
>   * `Commerce7Payments` \- All USA tenant migrations
>   * `Stripe` \- All non-USA tenant migrations
> 

* * *
# 
Create credit card
**`POST`** `/customer/{:customerId}/credit-card`
**Request**
JSON
    
    {
      "cardBrand": "MasterCard",
      "gateway": "No Gateway",
      "maskedCardNumber": "************5454",
      "tokenOnFile": "Xt5EWLLDS7FJjR1c",
      "expiryMo": 1,
      "expiryYr": 2021,
      "cardHolderName": "Andrew Kamphuis",
      "isDefault": true
    }
**Response**  
`credit-card` object
* * *
# 
Retrieve credit card
**`GET`**`/customer/{:customerId}/credit-card/{:id}`
**Response**  
`credit-card` object
* * *
# 
Update credit card
**`PUT`** `/customer/{:customerId}/credit-card/{:id}`
**Request**
JSON
    
    {
      "cardBrand": "MasterCard",
      "gateway": "No Gateway",
      "maskedCardNumber": "************5454",
      "tokenOnFile": "Zt5AFGLDS7FMjY1b",
      "expiryMo": 1,
      "expiryYr": 2021,
      "cardHolderName": "Andrew Kamphuis",
      "isDefault": true
    }
**Response**  
`credit-card` object
* * *
# 
Delete credit card
**`DELETE`** `/customer/{:customerId}/credit-card/{:id}`
**Response**  
Blank object and 204 status
* * *
# 
List credit cards
**`GET`** `/customer/{:customerId}/credit-card`
**Optional query parameters**
Param| Description  
---|---  
`?searchText=n`| Search text  
**Response**  
Array of `credit-card` objects and total count
JSON
    
    {
     "customerCreditCards": [{
      "id": "e804d4b3-e4e6-4a98-b395-4721d2002c77",
      "cardBrand": "Visa",
      "maskedCardNumber": "************1111",
      "expiryMo": 4,
      "expiryYr": 2027,
      "cardHolderName": "Jason Andres",
      "tokenOnFile": "Xt5EWLLDS7FJjR1c",
      "customerId": "9d30102b-afdf-42ca-9919-1500c730cac8",
      "isDefault": true,
      "createdAt": "2018-05-22T18:35:03.998Z",
      "updatedAt": "2018-05-22T18:35:03.998Z"
     }, {
      "id": "1c7eab39-8997-4da4-9f76-b8fb78d740bb",
      "cardBrand": "MasterCard",
      "maskedCardNumber": "************5454",
      "expiryMo": 10,
      "expiryYr": 2021,
      "cardHolderName": "Jason Andres",
      "tokenOnFile": "Zt5AFGLDS7FMjY1b",
      "customerId": "9d30102b-afdf-42ca-9919-1500c730cac8",
      "isDefault": false,
      "createdAt": "2018-05-22T17:51:31.177Z",
      "updatedAt": "2018-05-22T18:48:10.960Z"
     }],
     "total": 2
    }
