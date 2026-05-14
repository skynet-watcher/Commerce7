# Reservations

**Source:** [https://developer.commerce7.com/docs/reservations-2](https://developer.commerce7.com/docs/reservations-2)

**Section:** resources

---
Reservations are booking by customers to visit your winery.
  * Reservation object
  * Create reservation
  * Retrieve reservation
  * Update reservation
  * List reservations


* * *
# 
Reservation object
JSON
    
    {
        "id": "1a4ce7c6-2959-48d1-92ba-c6ce63c75e01",
        "channel": "Web",
        "externalReservationNumber": null,
        "externalReservationVendor": null,
        "reservationNumber": 1028,
        "reservationSource": "Internal",
        "customerId": "276b24c1-ba72-4af7-a82f-df819e1010de",
        "reservationDate": "2023-04-29T21:30:00.000Z",
        "reservationCloseOutDate": "2023-04-29T22:00:00.000Z",
        "reservationTypeId": "72863684-dcb9-4af6-b4a8-d63623a1585b",
        "reservationTypeOptionId": "ad914bd3-55e6-4cb5-b8c0-f47c4913a7fb",
        "guestCount": 2,
        "reservationLocationId": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
        "reservationLocationTableId": "a7b14954-ae18-492b-81b2-c779ee20fb7a",
        "reservationStaffId": null,
        "experienceType": "Communal",
        "isRequiresAHost": true,
        "status": "Paid",
        "paymentStatus": "Paid",
        "paymentCharge": "On Reservation Booking",
        "lastProcessAttemptDate": null,
        "orderId": "76ab1fdd-5bb1-4f69-b568-7a2ab9b73bd2",
        "orderNumber": 1358,
        "reservationPaidDate": "2023-04-25T20:18:34.217Z",
        "reminderEmailSendStatus": "Pending",
        "reminderEmailSendDate": null,
        "sku": "GT",
        "price": 1500,
        "isPriceOverride": false,
        "isReservationDateOverride": false,
        "isReservationLocationOverride": false,
        "isGuestCountOverride": false,
        "customerCreditCardId": "eb1c9070-d2c7-4dc6-83df-74eb4e1f3ee6",
        "tenderType": "Credit Card",
        "reservationThirdPartyId": null,
        "inventoryLocationId": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
        "notes": "",
        "checkInTime": null,
        "closeOutTime": null,
        "systemNote": null,
        "metaData": null,
        "appData": null,
        "appSync": null,
        "flags": [],
        "createdAt": "2023-04-25T20:18:30.567Z",
        "updatedAt": "2023-04-25T20:18:34.217Z",
        "reservationStaff": null,
        "reservationType": {
            "id": "72863684-dcb9-4af6-b4a8-d63623a1585b",
            "inventoryLocationId": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
            "title": "Spectra Tasting",
            "content": "<p>Experience a variety of Spectra&rsquo;s wines hand-selected by our winemaker while taking in the spectacular views. Explore new profiles and flavors by adding food pairing to your experience. This experience is approximately 30 minutes in length.</p>",
            "emailInstructions": null,
            "image": "https://images.commerce7.com/spectra-winery-demo-v2/images/original/theme-photos-mr_lv_g7xcy-unsplash-1629260444535.jpg",
            "tourType": "Tasting",
            "type": "Communal",
            "paymentCharge": "On Reservation Booking",
            "minGuestCount": 1,
            "maxGuestCount": 20,
            "maxGroupCount": 0,
            "minutesAllotted": 30,
            "minutesBeforeLocationInUse": 5,
            "leadTimeInHours": 0,
            "isRequiresAHost": true,
            "isAlwaysOccursInDefaultLocation": true,
            "defaultReservationLocationId": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
            "startDate": "2021-06-15T07:00:00.000Z",
            "endDate": null,
            "departmentId": null,
            "slug": "spectra-tasting",
            "seoTitle": "Spectra Tasting",
            "seoDescription": "Experience a variety of Spectra&rsquo;s wines hand-selected by our winemaker while taking in the spectacular views. Explore new profiles and flavors by...",
            "metaData": null,
            "allowOnlineCancel": false,
            "onlineCancelDeadlineInHours": 0,
            "createdAt": "2021-06-15T19:04:03.529Z",
            "updatedAt": "2021-08-18T04:20:45.729Z",
            "seo": {
                "title": "Spectra Tasting",
                "description": "Experience a variety of Spectra&rsquo;s wines hand-selected by our winemaker while taking in the spectacular views. Explore new profiles and flavors by..."
            },
            "security": {
                "availableTo": "Public"
            }
        },
        "reservationTypeOption": {
            "id": "ad914bd3-55e6-4cb5-b8c0-f47c4913a7fb",
            "reservationTypeId": "72863684-dcb9-4af6-b4a8-d63623a1585b",
            "title": "Tasting",
            "sku": "GT",
            "price": 1500,
            "costOfGood": 0,
            "taxType": "Wine",
            "sortOrder": 1,
            "createdAt": "2021-06-15T19:04:03.542Z",
            "updatedAt": "2021-06-15T19:04:03.542Z"
        },
        "location": {
            "id": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
            "title": "Tasting Bar",
            "type": "Communal",
            "startDate": "2021-06-01T07:00:00.000Z",
            "endDate": null,
            "createdAt": "2021-06-15T18:34:06.030Z",
            "updatedAt": "2021-06-15T18:47:26.090Z"
        },
        "table": {
            "id": "a7b14954-ae18-492b-81b2-c779ee20fb7a",
            "reservationLocationId": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
            "code": "tasting-bar",
            "tableNumber": null,
            "title": "Tasting Bar",
            "minGuests": 1,
            "maxGuests": 30,
            "createdAt": "2021-06-15T18:34:06.041Z",
            "updatedAt": "2021-06-15T18:47:36.252Z"
        },
        "inventoryLocation": {
            "id": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
            "title": "Tasting Room 2",
            "address": "1234 Main Street",
            "address2": null,
            "city": "Vancouver",
            "stateCode": "BC",
            "zipCode": "V6A1B2",
            "countryCode": "CA",
            "phone": "+16047553518",
            "isWebShipLocation": false,
            "isInboundShipLocation": false,
            "isClubShipLocation": false,
            "isAPickupLocation": false,
            "createdAt": "2021-06-14T22:58:44.132Z",
            "updatedAt": "2023-05-11T18:36:25.164Z"
        },
        "customer": {
            "id": "276b24c1-ba72-4af7-a82f-df819e1010de",
            "avatar": "https://images.commerce7.com/images/accounts/profile-1527527695219.jpg",
            "honorific": null,
            "firstName": "Andrew",
            "lastName": "Kamphuis",
            "birthDate": null,
            "city": "Vancouver",
            "stateCode": "BC",
            "zipCode": "V6A1C2",
            "countryCode": "CA",
            "emailMarketingStatus": "Subscribed",
            "flags": [],
            "notifications": [],
            "createdAt": "2021-06-14T22:58:44.983Z",
            "updatedAt": "2023-10-31T07:08:04.501Z",
            "orderInformation": {
                "currentWebCartId": "47cec886-9638-489d-bce7-82d59625cd42",
                "lastOrderId": "b0b52b35-229b-4c2f-b410-6f9b3a2bc7ab",
                "lastOrderDate": "2023-10-31T07:07:59.559Z",
                "orderCount": 30,
                "lifetimeValue": 458830,
                "lifetimeValueSeedAmount": 0,
                "yearlyValue": {
                    "2021": 83490,
                    "2022": 266356,
                    "2023": 108984
                },
                "grossProfit": 361035,
                "acquisitionChannel": null,
                "currentClubTitle": "Spectra Club 2023",
                "daysInCurrentClub": 409,
                "daysInClub": 766,
                "isActiveClubMember": true
            },
            "loyalty": {
                "tier": "Silver Tier",
                "loyaltyTierId": "78c940c2-22c9-4b4d-9097-8dadd71d4631",
                "points": 8911
            },
            "emails": [
                {
                    "id": "d094a2ff-2063-49b6-952b-4b945c4af72e",
                    "email": "[[email protected]](/cdn-cgi/l/email-protection)",
                    "status": "Ok"
                },
                {
                    "id": "d838b66b-343b-4ace-ba27-d12c429fc296",
                    "email": "[[email protected]](/cdn-cgi/l/email-protection)",
                    "status": "Ok"
                }
            ],
            "phones": [
                {
                    "id": "f8108408-2695-4b0c-b9da-7dbeea228782",
                    "phone": "+16046135343"
                }
            ],
            "clubs": [
                {
                    "clubId": "ac13f29f-d46a-4b46-8714-f83329220d5b",
                    "clubTitle": "Spectra Club 2023",
                    "cancelDate": null,
                    "signupDate": "2021-10-07T14:01:57.614Z",
                    "clubMembershipId": "a89c562b-dea2-4a0d-99fe-1ffe66fea9ae"
                },
                {
                    "clubId": "ac13f29f-d46a-4b46-8714-f83329220d5b",
                    "clubTitle": "Spectra Club 2023",
                    "cancelDate": null,
                    "signupDate": "2022-09-29T20:07:50.541Z",
                    "clubMembershipId": "4bcc4274-17cc-4074-9d65-faa5ad1f6cea"
                }
            ],
            "hasAccount": true,
            "loginActivity": {
                "lastLoginAt": "2023-01-08T18:32:02.867Z",
                "loginIP": "102.38.93.71",
                "lastLogoutAt": "2023-08-11T14:26:11.840Z"
            }
        },
        "customerCreditCard": {
            "id": "eb1c9070-d2c7-4dc6-83df-74eb4e1f3ee6",
            "cardBrand": "Visa",
            "gateway": "Stripe",
            "maskedCardNumber": "************4242",
            "bin": null,
            "expiryMo": 8,
            "expiryYr": 2024,
            "cardHolderName": null,
            "tokenOnFile": "eb1c9070-d2c7-4dc6-83df-74eb4e1f3ee6",
            "customerId": "276b24c1-ba72-4af7-a82f-df819e1010de",
            "isDefault": true,
            "lastCCAUUpdatedDate": null,
            "createdAt": "2021-10-07T14:01:55.831Z",
            "updatedAt": "2023-08-09T23:22:54.815Z"
        },
        "secondaryCustomers": [],
        "carts": [],
        "tags": [],
        "connectionInformation": {
            "customerIpAddress": "165.225.243.31",
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
        }
    }
* * *
# 
Create reservation
**`POST`** `/reservation`
> ❗️
> Pass `isSendTransactionEmail` of `false` if you don't want an email to be sent to customers
**Request**
JSON
    
    {
      "channel": "Web",
      "customerId": "07b41e01-1a65-4f69-be38-7287269cac1c",
      "reservationDate": "2017-01-01T00:00:00.000Z",
      "reservationTypeId": "247ad15f-0d9b-4960-bdc1-afe5bb4d9fb3",
      "reservationTypeOptionId": "5ee29b60-7a8a-49cd-a96a-bd41760b1cfe",
      "guestCount": 2,
      "reservationLocationId": "69927997-c370-439a-b388-97da1d04e8f8",
      "reservationStaffId": "59feb33f-6ad3-4931-9abd-996a954eaca7",
      "customerCreditCardId": "7e20385f-c4fa-499c-877f-3a739b751274",
      "billToAddressId": "62cbbd28-5f43-4544-8649-112be0fb3d1b",
      "reservationThirdPartyId": "115433de-5201-4199-b37d-01e58259ef99",
      "notes": "This is my notes"
    }
**Response**  
`reservation` object
* * *
# 
Retrieve reservation
**`GET`** `/reservation/{:id}`
**Response**  
`reservation` object
* * *
# 
Update reservation
**`PUT`** `/reservation/{:id}`
**Request**
  * Pass `isSendEmailConfirmation` of `false` if you don't want an email to be sent to the customer


JSON
    
    { 
      "reservationTypeId": "247ad15f-0d9b-4960-bdc1-afe5bb4d9fb3",
      "reservationTypeOptionId": "5ee29b60-7a8a-49cd-a96a-bd41760b1cfe",
      "guestCount": 5,
      "notes": "This is my notes"
    }
**Response**  
`reservation` object
* * *
# 
Delete reservation
**`DELETE`** `/reservation/{:id}`
**Response**  
`reservation` object
* * *
# 
List reservations
**`GET`** `/reservation`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`.
Param| Description  
---|---  
`q=n`|   
`customerId=n`| Specific customer ID  
`reservationTypeId=n`| Specific reservationType IDreservation type Id options: `=, =in:`  
`tagId=n`| Specific tag ID  
`createdAt=`| Date and time the reservation was createdDate format: YYYY-MM-DD  
Date options: `=, =gt:, gte:, =lt:, =lte:`  
`updatedAt=`| Last date and time the reservation was changedDate format: YYYY-MM-DD  
Date options:` =, =gt:, gte:, =lt:, =lte:`  
`reservationDate=`| Date and time that the reservation is forDate format: YYYY-MM-DD  
Date options: `=, =gt:, gte:, =lt:, =lte: =btw:`  
`status=`| Matching a status:`- Incomplete
  * Hold
  * Reserved
  * Processing
  * Paid
  * Checked In
  * Closed Out
  * Cancelled
  * No Show`

  
`paymentStatus=`| Matching a payment status:`- Paid
  * Declined
  * Pending`

  
`channel=`| Matching a channel:`- Web
  * Inbound`

  
**Response**  
An array of `reservation` objects and total count
JSON
    
    {
        "reservations": [{
        "id": "1a4ce7c6-2959-48d1-92ba-c6ce63c75e01",
        "channel": "Web",
        "externalReservationNumber": null,
        "externalReservationVendor": null,
        "reservationNumber": 1028,
        "reservationSource": "Internal",
        "customerId": "276b24c1-ba72-4af7-a82f-df819e1010de",
        "reservationDate": "2023-04-29T21:30:00.000Z",
        "reservationCloseOutDate": "2023-04-29T22:00:00.000Z",
        "reservationTypeId": "72863684-dcb9-4af6-b4a8-d63623a1585b",
        "reservationTypeOptionId": "ad914bd3-55e6-4cb5-b8c0-f47c4913a7fb",
        "guestCount": 2,
        "reservationLocationId": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
        "reservationLocationTableId": "a7b14954-ae18-492b-81b2-c779ee20fb7a",
        "reservationStaffId": null,
        "experienceType": "Communal",
        "isRequiresAHost": true,
        "status": "Paid",
        "paymentStatus": "Paid",
        "paymentCharge": "On Reservation Booking",
        "lastProcessAttemptDate": null,
        "orderId": "76ab1fdd-5bb1-4f69-b568-7a2ab9b73bd2",
        "orderNumber": 1358,
        "reservationPaidDate": "2023-04-25T20:18:34.217Z",
        "reminderEmailSendStatus": "Pending",
        "reminderEmailSendDate": null,
        "sku": "GT",
        "price": 1500,
        "isPriceOverride": false,
        "isReservationDateOverride": false,
        "isReservationLocationOverride": false,
        "isGuestCountOverride": false,
        "customerCreditCardId": "eb1c9070-d2c7-4dc6-83df-74eb4e1f3ee6",
        "tenderType": "Credit Card",
        "reservationThirdPartyId": null,
        "inventoryLocationId": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
        "notes": "",
        "checkInTime": null,
        "closeOutTime": null,
        "systemNote": null,
        "metaData": null,
        "appData": null,
        "appSync": null,
        "flags": [],
        "createdAt": "2023-04-25T20:18:30.567Z",
        "updatedAt": "2023-04-25T20:18:34.217Z",
        "reservationStaff": null,
        "reservationType": {
            "id": "72863684-dcb9-4af6-b4a8-d63623a1585b",
            "inventoryLocationId": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
            "title": "Spectra Tasting",
            "content": "<p>Experience a variety of Spectra&rsquo;s wines hand-selected by our winemaker while taking in the spectacular views. Explore new profiles and flavors by adding food pairing to your experience. This experience is approximately 30 minutes in length.</p>",
            "emailInstructions": null,
            "image": "https://images.commerce7.com/spectra-winery-demo-v2/images/original/theme-photos-mr_lv_g7xcy-unsplash-1629260444535.jpg",
            "tourType": "Tasting",
            "type": "Communal",
            "paymentCharge": "On Reservation Booking",
            "minGuestCount": 1,
            "maxGuestCount": 20,
            "maxGroupCount": 0,
            "minutesAllotted": 30,
            "minutesBeforeLocationInUse": 5,
            "leadTimeInHours": 0,
            "isRequiresAHost": true,
            "isAlwaysOccursInDefaultLocation": true,
            "defaultReservationLocationId": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
            "startDate": "2021-06-15T07:00:00.000Z",
            "endDate": null,
            "departmentId": null,
            "slug": "spectra-tasting",
            "seoTitle": "Spectra Tasting",
            "seoDescription": "Experience a variety of Spectra&rsquo;s wines hand-selected by our winemaker while taking in the spectacular views. Explore new profiles and flavors by...",
            "metaData": null,
            "allowOnlineCancel": false,
            "onlineCancelDeadlineInHours": 0,
            "createdAt": "2021-06-15T19:04:03.529Z",
            "updatedAt": "2021-08-18T04:20:45.729Z",
            "seo": {
                "title": "Spectra Tasting",
                "description": "Experience a variety of Spectra&rsquo;s wines hand-selected by our winemaker while taking in the spectacular views. Explore new profiles and flavors by..."
            },
            "security": {
                "availableTo": "Public"
            }
        },
        "reservationTypeOption": {
            "id": "ad914bd3-55e6-4cb5-b8c0-f47c4913a7fb",
            "reservationTypeId": "72863684-dcb9-4af6-b4a8-d63623a1585b",
            "title": "Tasting",
            "sku": "GT",
            "price": 1500,
            "costOfGood": 0,
            "taxType": "Wine",
            "sortOrder": 1,
            "createdAt": "2021-06-15T19:04:03.542Z",
            "updatedAt": "2021-06-15T19:04:03.542Z"
        },
        "location": {
            "id": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
            "title": "Tasting Bar",
            "type": "Communal",
            "startDate": "2021-06-01T07:00:00.000Z",
            "endDate": null,
            "createdAt": "2021-06-15T18:34:06.030Z",
            "updatedAt": "2021-06-15T18:47:26.090Z"
        },
        "table": {
            "id": "a7b14954-ae18-492b-81b2-c779ee20fb7a",
            "reservationLocationId": "4f457036-6344-4a1a-b89d-a84db3ff3d87",
            "code": "tasting-bar",
            "tableNumber": null,
            "title": "Tasting Bar",
            "minGuests": 1,
            "maxGuests": 30,
            "createdAt": "2021-06-15T18:34:06.041Z",
            "updatedAt": "2021-06-15T18:47:36.252Z"
        },
        "inventoryLocation": {
            "id": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
            "title": "Tasting Room 2",
            "address": "1234 Main Street",
            "address2": null,
            "city": "Vancouver",
            "stateCode": "BC",
            "zipCode": "V6A1B2",
            "countryCode": "CA",
            "phone": "+16047553518",
            "isWebShipLocation": false,
            "isInboundShipLocation": false,
            "isClubShipLocation": false,
            "isAPickupLocation": false,
            "createdAt": "2021-06-14T22:58:44.132Z",
            "updatedAt": "2023-05-11T18:36:25.164Z"
        },
        "customer": {
            "id": "276b24c1-ba72-4af7-a82f-df819e1010de",
            "avatar": "https://images.commerce7.com/images/accounts/profile-1527527695219.jpg",
            "honorific": null,
            "firstName": "Andrew",
            "lastName": "Kamphuis",
            "birthDate": null,
            "city": "Vancouver",
            "stateCode": "BC",
            "zipCode": "V6A1C2",
            "countryCode": "CA",
            "emailMarketingStatus": "Subscribed",
            "flags": [],
            "notifications": [],
            "createdAt": "2021-06-14T22:58:44.983Z",
            "updatedAt": "2023-10-31T07:08:04.501Z",
            "orderInformation": {
                "currentWebCartId": "47cec886-9638-489d-bce7-82d59625cd42",
                "lastOrderId": "b0b52b35-229b-4c2f-b410-6f9b3a2bc7ab",
                "lastOrderDate": "2023-10-31T07:07:59.559Z",
                "orderCount": 30,
                "lifetimeValue": 458830,
                "lifetimeValueSeedAmount": 0,
                "yearlyValue": {
                    "2021": 83490,
                    "2022": 266356,
                    "2023": 108984
                },
                "grossProfit": 361035,
                "acquisitionChannel": null,
                "currentClubTitle": "Spectra Club 2023",
                "daysInCurrentClub": 409,
                "daysInClub": 766,
                "isActiveClubMember": true
            },
            "loyalty": {
                "tier": "Silver Tier",
                "loyaltyTierId": "78c940c2-22c9-4b4d-9097-8dadd71d4631",
                "points": 8911
            },
            "emails": [
                {
                    "id": "d094a2ff-2063-49b6-952b-4b945c4af72e",
                    "email": "[[email protected]](/cdn-cgi/l/email-protection)",
                    "status": "Ok"
                },
                {
                    "id": "d838b66b-343b-4ace-ba27-d12c429fc296",
                    "email": "[[email protected]](/cdn-cgi/l/email-protection)",
                    "status": "Ok"
                }
            ],
            "phones": [
                {
                    "id": "f8108408-2695-4b0c-b9da-7dbeea228782",
                    "phone": "+16046135343"
                }
            ],
            "clubs": [
                {
                    "clubId": "ac13f29f-d46a-4b46-8714-f83329220d5b",
                    "clubTitle": "Spectra Club 2023",
                    "cancelDate": null,
                    "signupDate": "2021-10-07T14:01:57.614Z",
                    "clubMembershipId": "a89c562b-dea2-4a0d-99fe-1ffe66fea9ae"
                },
                {
                    "clubId": "ac13f29f-d46a-4b46-8714-f83329220d5b",
                    "clubTitle": "Spectra Club 2023",
                    "cancelDate": null,
                    "signupDate": "2022-09-29T20:07:50.541Z",
                    "clubMembershipId": "4bcc4274-17cc-4074-9d65-faa5ad1f6cea"
                }
            ],
            "hasAccount": true,
            "loginActivity": {
                "lastLoginAt": "2023-01-08T18:32:02.867Z",
                "loginIP": "102.38.93.71",
                "lastLogoutAt": "2023-08-11T14:26:11.840Z"
            }
        },
        "customerCreditCard": {
            "id": "eb1c9070-d2c7-4dc6-83df-74eb4e1f3ee6",
            "cardBrand": "Visa",
            "gateway": "Stripe",
            "maskedCardNumber": "************4242",
            "bin": null,
            "expiryMo": 8,
            "expiryYr": 2024,
            "cardHolderName": null,
            "tokenOnFile": "eb1c9070-d2c7-4dc6-83df-74eb4e1f3ee6",
            "customerId": "276b24c1-ba72-4af7-a82f-df819e1010de",
            "isDefault": true,
            "lastCCAUUpdatedDate": null,
            "createdAt": "2021-10-07T14:01:55.831Z",
            "updatedAt": "2023-08-09T23:22:54.815Z"
        },
        "secondaryCustomers": [],
        "carts": [],
        "tags": [],
        "connectionInformation": {
            "customerIpAddress": "165.225.243.31",
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
        }
    }],
        "total": 1
    }
