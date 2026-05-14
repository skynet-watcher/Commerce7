# Club Memberships

**Source:** https://developer.commerce7.com/docs/club-memberships

---

Club memberships belong to a club and customer.
  * Club membership object & ENUMs
  * Create club membership
  * Retrieve club membership
  * Update club membership
  * Delete club membership
  * List club memberships


* * *
# 
Club membership object
Object
    
    {
        "status": "Active",
        "id": "28e4c85b-2834-4370-82d9-582cd0069250",
        "customerId": "9065172d-79e8-4900-93d1-7a2916ffcce2",
        "clubId": "194cc50a-e324-4f21-8e52-98500a4b751c",
        "billToCustomerAddressId": "0eaa6fd0-3f30-4bf0-9c8e-55ae204c06b0",
        "orderDeliveryMethod": "Ship",
        "shipToCustomerAddressId": "0eaa6fd0-3f30-4bf0-9c8e-55ae204c06b0",
        "customerCreditCardId": "c7f4e032-3d59-4626-a27b-144f753ebd40",
        "signupDate": "2018-05-18T17:02:59.777Z",
        "cancelDate": null,
        "lastProcessedDate": null,
        "currentNumberOfShipments": 0,
        "createdAt": "2018-05-18T17:02:59.778Z",
        "updatedAt": "2018-05-18T22:17:54.774Z",
        "customer": {
            "id": "9065172d-79e8-4900-93d1-7a2916ffcce2",
            "avatar": "https://en.gravatar.com/userimage/135718310/8cda1f2ce8b774c9a6ca5e666eec4d89.jpeg",
            "firstName": "Jason",
            "lastName": "Andres",
            "birthDate": null,
            "city": "Mission",
            "stateCode": "BC",
            "countryCode": "CA",
            "acceptsMarketing": true,
            "lastActivityDate": "2018-05-18T16:53:56.691Z",
            "facebookId": null,
            "metaData": {
            "vip-code": 12345,
            "spouse-name": null
        },
            "createdAt": "2018-05-18T16:53:47.131Z",
            "updatedAt": "2018-05-18T22:17:54.840Z",
            "orderInformation": {
                "lastOrderId": "6fa9cf58-0c53-4831-b5df-e05e091c8935",
                "lastOrderDate": "2018-05-18T16:53:54.100Z",
                "orderCount": 5,
                "lifetimeValue": 24110,
                "currentClubTitle": "Red Club",
                "daysInCurrentClub": 4
            },
            "clubs": [{
                "clubId": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
                "clubTitle": "Red Club",
                "cancelDate": null,
                "signupDate": "2018-05-18T22:12:38.111Z",
                "clubMembershipId": "dfac1c20-9e1d-4954-a6ee-0ed44e0007d1"
            }, {
                "clubId": "194cc50a-e324-4f21-8e52-98500a4b751c",
                "clubTitle": "White Club",
                "cancelDate": null,
                "signupDate": "2018-05-18T17:02:59.777Z",
                "clubMembershipId": "28e4c85b-2834-4370-82d9-582cd0069250"
            }]
        },
        "club": {
            "id": "194cc50a-e324-4f21-8e52-98500a4b751c",
            "title": "White Club",
            "content": null,
            "publishDate": "2018-05-18T17:00:00.000Z",
            "slug": "white-club",
            "createdAt": "2018-05-18T17:00:45.726Z",
            "updatedAt": "2018-05-18T17:00:45.726Z",
            "seo": {
                "title": "White Club",
                "description": null
            }
        },
        "onHolds": []
    }
## 
ENUMs
The enumerated club membership fields and their values.
Field| Value  
---|---  
`status`| \- `Active` \- `Cancelled` \- `On Hold`  
`orderDeliveryMethod`| \- `Pickup` \- `Ship`  
`cancellationReason`| \- `Too much wine` \- `Financial reasons` \- `Health reasons` \- `Pregnant` \- `Moving` \- `Switching to another club` \- `Other`  
`holdReason`| \- `Too much wine` \- `Financial reasons` \- `Health reasons` \- `Away from home` \- `Other`  
|   
* * *
# 
Create club membership
**`POST`** `/club-membership`
**Request**
  * Note: Pass `isSendEmailConfirmation` of `false` if you don't want an email to be sent to the customer


JSON
    
    {
      "customerId": "acb21fe8-5de6-11e8-831d-02cdf1ea4656",
      "clubId": "c217e0e0-5de6-11e8-831d-02cdf1ea4656",
      "billToCustomerAddressId": "d39128cd-5de6-11e8-831d-02cdf1ea4656",
      "orderDeliveryMethod": "Ship",
      "shipToCustomerAddressId": "0ff27272-5de7-11e8-831d-02cdf1ea4656",
      "customerCreditCardId": "16ac16e9-5de7-11e8-831d-02cdf1ea4656",
      "signupDate": "2017-01-01T00:00:00-08:00",
      "cancelDate": null
    }
**Response**  
`club-membership` object
## 
Create subscription club membership
**`POST`** `/club-membership`
**Request**
  * Note: Pass `isSendTransactionEmail` of `false` if you don't want an email to be sent to customers.


JSON
    
    {
      "customerId": "acb21fe8-5de6-11e8-831d-02cdf1ea4656",
      "clubId": "c217e0e0-5de6-11e8-831d-02cdf1ea4656",
      "billToCustomerAddressId": "d39128cd-5de6-11e8-831d-02cdf1ea4656",
      "shipToCustomerAddressId": "0ff27272-5de7-11e8-831d-02cdf1ea4656",
      "customerCreditCardId": "16ac16e9-5de7-11e8-831d-02cdf1ea4656",
      "orderDeliveryMethod": "Ship",
      "signupDate": "2017-01-01T00:00:00-08:00",
      "cancelDate": null,
      "subscription": {
        "frequency": "3",
        "nextProcessDate": "2017-02-01T00:00:00-08:00"
      }
    }
**Response**  
`club-membership` object
* * *
# 
Retrieve club membership
**`GET`** `/club-membership/{:id}`
**Response**  
Club membership object
* * *
# 
Update club membership
**`PUT`** `/club-membership/{:id}`
**Request**
  * Include only the fields that you wish to update. Example below demonstrates an update to `customerCreditCardId`.
  * Note: Pass `isSendEmailConfirmation` of `false` if you don't want an email to be sent to the customer


JSON
    
    {
     "customerCreditCardId": "f9c2f3d0-2547-4ef8-8d24-ff236c32ebbb"
    }
**Response**  
`club-membership` object
* * *
# 
Delete club membership
**`DELETE`** `/club-membership/:id`
**Response**  
Blank object and 204 status
* * *
# 
List club memberships
**`GET`** `/club-membership`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`.
Param | Description  
---|---  
`q=n` | Club name  
Ex. `/club-membership?p=red`  
`clubId=n` | Club ID  
**Response**  
Array of `club-membership` objects and total count
JSON
    
    {
        "clubMemberships": [{
        "status": "Active",
        "id": "28e4c85b-2834-4370-82d9-582cd0069250",
        "customerId": "9065172d-79e8-4900-93d1-7a2916ffcce2",
        "clubId": "194cc50a-e324-4f21-8e52-98500a4b751c",
        "billToCustomerAddressId": "0eaa6fd0-3f30-4bf0-9c8e-55ae204c06b0",
        "orderDeliveryMethod": "Ship",
        "shipToCustomerAddressId": "0eaa6fd0-3f30-4bf0-9c8e-55ae204c06b0",
        "customerCreditCardId": "c7f4e032-3d59-4626-a27b-144f753ebd40",
        "signupDate": "2018-05-18T17:02:59.777Z",
        "cancelDate": null,
        "lastProcessedDate": null,
        "currentNumberOfShipments": 0,
        "createdAt": "2018-05-18T17:02:59.778Z",
        "updatedAt": "2018-05-18T22:17:54.774Z",
        "customer": {
            "id": "9065172d-79e8-4900-93d1-7a2916ffcce2",
            "avatar": "https://en.gravatar.com/userimage/135718310/8cda1f2ce8b774c9a6ca5e666eec4d89.jpeg",
            "firstName": "Jason",
            "lastName": "Andres",
            "birthDate": null,
            "city": "Mission",
            "stateCode": "BC",
            "countryCode": "CA",
            "acceptsMarketing": true,
            "lastActivityDate": "2018-05-18T16:53:56.691Z",
            "facebookId": null,
            "metaData": {
                "vip-code": 12345,
                "spouse-name": null
            },
            "createdAt": "2018-05-18T16:53:47.131Z",
            "updatedAt": "2018-05-18T22:17:54.840Z",
            "orderInformation": {
                "lastOrderId": "6fa9cf58-0c53-4831-b5df-e05e091c8935",
                "lastOrderDate": "2018-05-18T16:53:54.100Z",
                "orderCount": 5,
                "lifetimeValue": 24110,
                "currentClubTitle": "Red Club",
                "daysInCurrentClub": 4
            },
            "clubs": [{
                "clubId": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
                "clubTitle": "Red Club",
                "cancelDate": null,
                "signupDate": "2018-05-18T22:12:38.111Z",
                "clubMembershipId": "dfac1c20-9e1d-4954-a6ee-0ed44e0007d1"
                }, {
                "clubId": "194cc50a-e324-4f21-8e52-98500a4b751c",
                "clubTitle": "White Club",
                "cancelDate": null,
                "signupDate": "2018-05-18T17:02:59.777Z",
                "clubMembershipId": "28e4c85b-2834-4370-82d9-582cd0069250"
            }]
        },
        "club": {
            "id": "194cc50a-e324-4f21-8e52-98500a4b751c",
            "title": "White Club",
            "content": null,
            "publishDate": "2018-05-18T17:00:00.000Z",
            "slug": "white-club",
            "createdAt": "2018-05-18T17:00:45.726Z",
            "updatedAt": "2018-05-18T17:00:45.726Z",
            "seo": {
                "title": "White Club",
                "description": null
            }
        },
        "onHolds": []
        }, {
        "status": "Active",
        "id": "dfac1c20-9e1d-4954-a6ee-0ed44e0007d1",
        "customerId": "9065172d-79e8-4900-93d1-7a2916ffcce2",
        "clubId": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
        "billToCustomerAddressId": "0eaa6fd0-3f30-4bf0-9c8e-55ae204c06b0",
        "orderDeliveryMethod": "Ship",
        "shipToCustomerAddressId": "0eaa6fd0-3f30-4bf0-9c8e-55ae204c06b0",
        "customerCreditCardId": "c7f4e032-3d59-4626-a27b-144f753ebd40",
        "signupDate": "2018-05-18T22:12:38.111Z",
        "cancelDate": null,
        "lastProcessedDate": null,
        "currentNumberOfShipments": 0,
        "createdAt": "2018-05-18T22:12:38.112Z",
        "updatedAt": "2018-05-18T22:12:38.112Z",
        "customer": {
            "id": "9065172d-79e8-4900-93d1-7a2916ffcce2",
            "avatar": "https://en.gravatar.com/userimage/135718310/8cda1f2ce8b774c9a6ca5e666eec4d89.jpeg",
            "firstName": "Jason",
            "lastName": "Andres",
            "birthDate": null,
            "city": "Mission",
            "stateCode": "BC",
            "countryCode": "CA",
            "acceptsMarketing": true,
            "lastActivityDate": "2018-05-18T16:53:56.691Z",
            "facebookId": null,
            "metaData": {
                "vip-code": 12345,
                "spouse-name": null
            },
            "createdAt": "2018-05-18T16:53:47.131Z",
            "updatedAt": "2018-05-18T22:17:54.840Z",
            "orderInformation": {
                "lastOrderId": "6fa9cf58-0c53-4831-b5df-e05e091c8935",
                "lastOrderDate": "2018-05-18T16:53:54.100Z",
                "orderCount": 5,
                "lifetimeValue": 24110,
                "currentClubTitle": "Red Club",
                "daysInCurrentClub": 4
            },
            "clubs": [{
                "clubId": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
                "clubTitle": "Red Club",
                "cancelDate": null,
                "signupDate": "2018-05-18T22:12:38.111Z",
                "clubMembershipId": "dfac1c20-9e1d-4954-a6ee-0ed44e0007d1"
                }, {
                "clubId": "194cc50a-e324-4f21-8e52-98500a4b751c",
                "clubTitle": "White Club",
                "cancelDate": null,
                "signupDate": "2018-05-18T17:02:59.777Z",
                "clubMembershipId": "28e4c85b-2834-4370-82d9-582cd0069250"
            }]
        },
        "club": {
            "id": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
            "title": "Red Club",
            "content": null,
            "publishDate": "2018-05-18T17:00:00.000Z",
            "slug": "red-club",
            "createdAt": "2018-05-18T17:00:38.114Z",
            "updatedAt": "2018-05-18T17:00:38.114Z",
            "seo": {
                "title": "Red Club",
                "description": null
            }
        },
        "onHolds": []
        }],
        "total": 2
    }
