# Customer Addresses

**Source:** [https://developer.commerce7.com/docs/customer-addresses](https://developer.commerce7.com/docs/customer-addresses)

**Section:** resources

---
Addresses belong to a customer. A customer can have multiple address.
  * Address object
  * Create customer
  * Retrieve customer
  * Update customer
  * Delete customer
  * List addresses (single customer)
  * List addresses (all customers)


* * *
# 
Address object
Object
    
    {
      "id": "5057e055-2ca6-4421-bf63-6c2a164e21ae",
      "customerId": "9d30102b-afdf-42ca-9919-1500c730cac8",
      "birthDate": "1972-10-03",
      "firstName": "Jason",
      "lastName": "Andres",
      "company": "Commerce7",
      "phone": "+17783477874",
      "address": "33925 Araki Court",
      "address2": "Unit #9",
      "city": "Mission",
      "stateCode": "BC",
      "zipCode": "V2V7R4",
      "countryCode": "CA",
      "isDefault": true,
      "createdAt": "2018-05-22T17:51:08.878Z",
      "updatedAt": "2018-05-22T17:51:08.878Z"
    }
* * *
# 
Create address
**`POST`** `/customer/:customerId/address`
**Request**
JSON
    
    {
     "firstName": "Jason",
     "lastName": "Andres",
     "company": "Commerce7",
     "address": "33925 Araki Ct",
     "address2": "Unit #9",
     "city": "Mission",
     "stateCode": "BC",
     "zipCode": "V2V7R4",
     "phone": "+17783477874",
     "countryCode": "CA",
     "isDefault": false,
     "birthDate": "1972-10-03"
    }
**Response**  
`address` object
* * *
# 
Retrieve address
**`GET`** `/customer/{:customerId}/address/{:id}`
**Response**  
`address` object
* * *
# 
Update address
**`PUT`** `/customer/{:customerId}/address/{:id}`
**Request**  
Include only the fields that you wish to update. Example below demonstrates an update to `company`.
JSON
    
    {
     "company": "Commerce7"
    }
**Response**  
`address` object
* * *
# 
Delete address
**`DELETE`** `/customer/{:customerId}/address/{:id}`
**Response**  
Blank object and 204 status
* * *
# 
List addresses (single customer)
**`GET`** `/customer/{:customerId}/address`
**Optional query parameters**
Param| Description  
---|---  
`?searchText=n`| Search text  
**Response**  
Array of `address` objects and total count
JSON
    
    {
     "customerAddresses": [{
      "id": "4a87ac0b-8b97-46ea-af15-bb579e5f4bcd",
      "customerId": "9d30102b-afdf-42ca-9919-1500c730cac8",
      "birthDate": "1972-10-03",
      "firstName": "Jason",
      "lastName": "Andres",
      "company": "Commerce7",
      "phone": "+17783477874",
      "address": "289 Alexander Street",
      "address2": "Unit #624",
      "city": "Vancouver",
      "stateCode": "BC",
      "zipCode": "V6A1C2",
      "countryCode": "CA",
      "isDefault": false,
      "createdAt": "2018-05-22T18:27:35.998Z",
      "updatedAt": "2018-05-22T18:31:31.487Z"
     }, {
      "id": "5057e055-2ca6-4421-bf63-6c2a164e21ae",
      "customerId": "9d30102b-afdf-42ca-9919-1500c730cac8",
      "birthDate": "1972-10-03",
      "firstName": "Jason",
      "lastName": "Andres",
      "company": "Commerce7",
      "phone": "+17783477874",
      "address": "33925 Araki Court",
      "address2": "Unit #9",
      "city": "Mission",
      "stateCode": "BC",
      "zipCode": "V2V7R4",
      "countryCode": "CA",
      "isDefault": true,
      "createdAt": "2018-05-22T17:51:08.878Z",
      "updatedAt": "2018-05-22T17:51:08.878Z"
     }],
     "total": 2
    }
* * *
# 
List addresses (all customers)
**`GET`** `/customer/{:customerId}/address`
**Optional query parameters**
Param| Description  
---|---  
`?searchText=n`| Search text  
**Response**  
Array of `address` objects and total count
JSON
    
    {
        "customerAddresses": [
            {
                "id": "7710c379-dffe-4065-9f60-c3d0eb0b18c2",
                "customerId": "6fab68de-990a-41a2-a628-522d4e9dde2f",
                "birthDate": "1972-10-03",
                "honorific": null,
                "firstName": "Jason",
                "lastName": "Andres",
                "company": null,
                "phone": "+17783477874",
                "address": "#9 - 33925 Araki Court",
                "address2": null,
                "city": "Mission",
                "stateCode": "BC",
                "zipCode": "V2V7R4",
                "countryCode": "CA",
                "isDefault": true,
                "metaData": null,
                "appData": null,
                "appSync": null,
                "createdAt": "2020-07-27T16:46:25.870Z",
                "updatedAt": "2020-07-27T16:46:25.870Z"
            },
            {
                "id": "cb808898-4265-4832-97e5-2a2b70dd12fc",
                "customerId": "2e98066b-69dc-440b-a532-949beccdada9",
                "birthDate": "1973-11-15",
                "honorific": null,
                "firstName": "Andrew",
                "lastName": "Kamphuis",
                "company": null,
                "phone": "+16046135343",
                "address": "#624 - 289 Alexander Street",
                "address2": null,
                "city": "Vancouver",
                "stateCode": "BC",
                "zipCode": "V6A1C2",
                "countryCode": "CA",
                "isDefault": true,
                "metaData": null,
                "appData": null,
                "appSync": null,
                "createdAt": "2020-07-27T16:46:25.869Z",
                "updatedAt": "2020-07-27T16:46:25.869Z"
            },
            {
                "id": "531aae91-b08d-4e65-a193-6c2a62ce7548",
                "customerId": "9b5ecfb7-8f84-41a8-b0ea-4022dfef8106",
                "birthDate": "1995-06-11",
                "honorific": null,
                "firstName": "Zach",
                "lastName": "Kamphuis",
                "company": null,
                "phone": "+16047553518",
                "address": "#103 - 1051 Broughton Street",
                "address2": null,
                "city": "Vancouver",
                "stateCode": "BC",
                "zipCode": "V6G0B6",
                "countryCode": "CA",
                "isDefault": true,
                "metaData": null,
                "appData": null,
                "appSync": null,
                "createdAt": "2020-07-27T16:46:25.868Z",
                "updatedAt": "2020-07-27T16:46:25.868Z"
            },
            {
                "id": "58f55899-9534-40c5-909d-10cf6da7d089",
                "customerId": "6220b7bc-1182-4071-8502-8f1491e725b3",
                "birthDate": "1980-04-01",
                "honorific": null,
                "firstName": "Carisen",
                "lastName": "Randing",
                "company": null,
                "phone": "+17075555555",
                "address": "123 Test",
                "address2": "test",
                "city": "test",
                "stateCode": "CA",
                "zipCode": "90210",
                "countryCode": "US",
                "isDefault": false,
                "metaData": {},
                "appData": null,
                "appSync": null,
                "createdAt": "2020-10-02T19:42:06.575Z",
                "updatedAt": "2020-10-02T19:42:06.575Z"
            },
            {
                "id": "85ef2078-2a93-4b14-a31c-7fe609985c68",
                "customerId": "85ef2078-2a93-4b14-a31c-7fe609985c68",
                "birthDate": "1960-05-01",
                "honorific": "Mr",
                "firstName": "Carisen",
                "lastName": "Randing",
                "company": null,
                "phone": "+17783187789",
                "address": "123 Test",
                "address2": "test",
                "city": "test",
                "stateCode": "CA",
                "zipCode": "90210",
                "countryCode": "US",
                "isDefault": true,
                "metaData": {},
                "appData": null,
                "appSync": null,
                "createdAt": "2020-10-21T18:09:39.810Z",
                "updatedAt": "2020-10-21T18:09:39.810Z"
            }
        ],
        "total": 5
    }
