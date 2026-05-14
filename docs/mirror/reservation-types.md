# Reservation Types (Experiences)

**Source:** https://developer.commerce7.com/docs/reservation-types

---

Reservations Types (Experiences) are the products/offerings that define what a reservation is booked as or for. They have one or more option.
  * Reservation type object
  * Create reservation type
  * Retrieve reservation type
  * Update reservation type
  * Delete reservation type
  * List reservation types


* * *
# 
Reservation Type object
JSON
    
    {
        "id": "9f1e7e1a-dd6d-47c1-abf7-7f2e40baaf2a",
        "inventoryLocationId": "c5787aeb-159f-4fd3-a0d8-ef6ff046d2c6",
        "title": "Estate Tour & Tasting",
        "content": "<p>Enjoy a walking tour of the land, learning about the history of Spectra Winery and ending with a Spectra Tasting. This experience is approximately 1 hour and 45 minutes in length.</p>",
        "emailInstructions": null,
        "image": "https://images.commerce7.com/spectra-winery-demo-v2/images/original/dave-lastovskiy-rygidtavhkq-unsplash-1629260412290.jpg",
        "tourType": "Tour",
        "type": "Table",
        "paymentCharge": "On Check In",
        "minGuestCount": 1,
        "maxGuestCount": 4,
        "maxGroupCount": 1,
        "minutesAllotted": 105,
        "minutesBeforeLocationInUse": 15,
        "leadTimeInHours": 48,
        "isRequiresAHost": true,
        "isAlwaysOccursInDefaultLocation": true,
        "defaultReservationLocationId": "9dfd554b-508d-4461-96c1-2ad3a56aa366",
        "startDate": "2021-06-14T07:00:00.000Z",
        "endDate": null,
        "departmentId": null,
        "slug": "estate-tour",
        "seoTitle": "Estate Tour & Tasting",
        "seoDescription": "Enjoy a walking tour of the land, learning about the history of Spectra Winery and ending with a Spectra Tasting.",
        "metaData": null,
        "allowOnlineCancel": true,
        "onlineCancelDeadlineInHours": 24,
        "createdAt": "2021-06-14T22:58:44.433Z",
        "updatedAt": "2023-10-25T14:09:30.723Z",
        "options": [
            {
                "id": "aad57f25-1fd8-44e4-b355-cfa468b226ed",
                "reservationTypeId": "9f1e7e1a-dd6d-47c1-abf7-7f2e40baaf2a",
                "title": "Tour",
                "sku": "ET",
                "price": 1500,
                "costOfGood": 0,
                "taxType": "General Merchandise",
                "sortOrder": 1,
                "createdAt": "2021-06-14T22:58:44.445Z",
                "updatedAt": "2023-08-03T18:03:52.865Z"
            }
        ],
        "timeSlots": [
            {
                "id": "02abce92-50c9-487f-a90c-be7827da237a",
                "reservationTypeId": "9f1e7e1a-dd6d-47c1-abf7-7f2e40baaf2a",
                "dayOfWeek": 0,
                "createdAt": "2021-06-15T18:58:34.862Z",
                "updatedAt": "2021-06-15T18:58:34.862Z",
                "times": [
                    {
                        "id": "3ccde56f-feac-417f-b3f5-6aea72a18454",
                        "reservationTypeTimeSlotId": "02abce92-50c9-487f-a90c-be7827da237a",
                        "time": "11:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.872Z",
                        "updatedAt": "2021-06-15T18:58:34.872Z"
                    },
                    {
                        "id": "1f8de853-6de0-483e-8f33-0c686de1ca81",
                        "reservationTypeTimeSlotId": "02abce92-50c9-487f-a90c-be7827da237a",
                        "time": "13:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.872Z",
                        "updatedAt": "2021-06-15T18:58:34.872Z"
                    },
                    {
                        "id": "1934a2d8-7e61-4dfe-be2c-d34038b2a774",
                        "reservationTypeTimeSlotId": "02abce92-50c9-487f-a90c-be7827da237a",
                        "time": "15:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.872Z",
                        "updatedAt": "2021-06-15T18:58:34.872Z"
                    }
                ]
            },
            {
                "id": "511d4e48-14e7-4a8f-a4de-472bb5054c59",
                "reservationTypeId": "9f1e7e1a-dd6d-47c1-abf7-7f2e40baaf2a",
                "dayOfWeek": 6,
                "createdAt": "2021-06-15T18:58:34.862Z",
                "updatedAt": "2021-06-15T18:58:34.862Z",
                "times": [
                    {
                        "id": "ea7a3b8f-984b-4d26-8e74-ea79747711ff",
                        "reservationTypeTimeSlotId": "511d4e48-14e7-4a8f-a4de-472bb5054c59",
                        "time": "11:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.878Z",
                        "updatedAt": "2021-06-15T18:58:34.878Z"
                    },
                    {
                        "id": "3bec04d7-d66b-445b-866a-f9df511ee596",
                        "reservationTypeTimeSlotId": "511d4e48-14e7-4a8f-a4de-472bb5054c59",
                        "time": "13:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.878Z",
                        "updatedAt": "2021-06-15T18:58:34.878Z"
                    },
                    {
                        "id": "20dd350c-b921-4b0e-a08a-cb784c3ef050",
                        "reservationTypeTimeSlotId": "511d4e48-14e7-4a8f-a4de-472bb5054c59",
                        "time": "15:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.878Z",
                        "updatedAt": "2021-06-15T18:58:34.878Z"
                    }
                ]
            },
            {
                "id": "e9c5606a-c25e-46a8-bf9c-39a36fa561b5",
                "reservationTypeId": "9f1e7e1a-dd6d-47c1-abf7-7f2e40baaf2a",
                "dayOfWeek": 5,
                "createdAt": "2021-06-15T18:58:34.862Z",
                "updatedAt": "2021-06-15T18:58:34.862Z",
                "times": [
                    {
                        "id": "84558181-dc85-489e-9f08-d8c996ef7b8c",
                        "reservationTypeTimeSlotId": "e9c5606a-c25e-46a8-bf9c-39a36fa561b5",
                        "time": "11:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.874Z",
                        "updatedAt": "2021-06-15T18:58:34.874Z"
                    },
                    {
                        "id": "3e398db3-20c0-4d0a-ba4e-bc8543a31ec1",
                        "reservationTypeTimeSlotId": "e9c5606a-c25e-46a8-bf9c-39a36fa561b5",
                        "time": "13:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.874Z",
                        "updatedAt": "2021-06-15T18:58:34.874Z"
                    },
                    {
                        "id": "437c6942-ea9c-40b0-a003-b72b49a31573",
                        "reservationTypeTimeSlotId": "e9c5606a-c25e-46a8-bf9c-39a36fa561b5",
                        "time": "15:00:00",
                        "allowCustomersToReserveOnline": true,
                        "createdAt": "2021-06-15T18:58:34.874Z",
                        "updatedAt": "2021-06-15T18:58:34.874Z"
                    }
                ]
            }
        ],
        "seo": {
            "title": "Estate Tour & Tasting",
            "description": "Enjoy a walking tour of the land, learning about the history of Spectra Winery and ending with a Spectra Tasting."
        },
        "security": {
            "availableTo": "Public"
        }
    }
* * *
# 
Create reservation type
**`POST`** `/reservation-type`
**Request**
JSON
    
    {
      "title": "My First Reservation Type",
      "type": "Table",
      "inventoryLocationId": "d0382827-e486-41e6-bbcb-38bcee616cd0",
      "tourType": "Tour",
      "minGuestCount": 1,
      "maxGuestCount": 5,
      "maxGroupCount": 2,
      "minutesAllotted": 90,
      "minutesBeforeLocationInUse": 30,
      "leadTimeInHours": 2,
      "isRequiresAHost": false,
      "isAlwaysOccursInDefaultLocation": true,
      "defaultReservationLocationId": "a76552b1-bf87-465d-bc46-6259b628922f",
      "departmentId": "c2eafee3-03ea-41aa-96df-2a6e4f0c237d",
      "startDate": "2017-01-01T00:00:00.000Z",
      "endDate": "2040-01-02T00:00:00.000Z",
      "slug": "my-first-reservation-type",
      "options": [
        {
          "title": "My Product",
          "sku": "1234",
          "costOfGood": 20,
          "price": 1000,
          "productVariantId": null,
          "taxType": "General Merchandise",
          "sortOrder": 1
        }
      ],
      "timeSlots": [
        {
          "dayOfWeek": 1,
          "times": [
            {
              "time": "10:00:00",
              "allowCustomersToReserveOnline": true
            },
            {
              "time": "12:00:00",
              "allowCustomersToReserveOnline": false
            }
          ]
        },
        {
          "dayOfWeek": 2,
          "times": [
            {
              "time": "10:00:00",
              "allowCustomersToReserveOnline": false
            },
            {
              "time": "12:00:00",
              "allowCustomersToReserveOnline": false
            }
          ]
        }
      ]
    }
**Response**  
`reservationType` object
* * *
# 
Retrieve reservation type
**`GET`** `/reservation-type/{:id}`
**Response**  
`reservationType` object
* * *
# 
Update reservation type
**`PUT`** `/reservation-type/{:id}`
**Request**
JSON
    
    { 
            "title": 'My Update',
            "paymentCharge": 'On Reservation Booking',
            "allowOnlineCancel": true,
            "onlineCancelDeadlineInHours": 4,
            "security": {
              "availableTo": 'Loyalty Tier',
              "displayOption": 'Display Reservation Type / Show Login',
              "availableToObjectIds": ["d0382827-e486-41e6-bbcb-38bcee616cd0"]
            }
    }
**Response**  
`reservationType` object
* * *
# 
Delete reservation type
**`DELETE`** `/reservation-type/{:id}`
**Response**  
empty
* * *
# 
List reservation types
**`GET`** `/reservation-type`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`.
Param| Description  
---|---  
`q=n`|   
`status=n`| Matching a status`- Active`  
`id=n`| Specific reservationType IDreservation type Id options: `=, =in:`  
**Response**  
An array of `reservationType` objects and total count
JSON
    
    {
        "reservationTypes": [{
      "title": "My First Reservation Type",
      "type": "Table",
      "inventoryLocationId": "d0382827-e486-41e6-bbcb-38bcee616cd0",
      "tourType": "Tour",
      "minGuestCount": 1,
      "maxGuestCount": 5,
      "maxGroupCount": 2,
      "minutesAllotted": 90,
      "minutesBeforeLocationInUse": 30,
      "leadTimeInHours": 2,
      "isRequiresAHost": false,
      "isAlwaysOccursInDefaultLocation": true,
      "defaultReservationLocationId": "a76552b1-bf87-465d-bc46-6259b628922f",
      "departmentId": "c2eafee3-03ea-41aa-96df-2a6e4f0c237d",
      "startDate": "2017-01-01T00:00:00.000Z",
      "endDate": "2040-01-02T00:00:00.000Z",
      "slug": "my-first-reservation-type",
      "options": [
        {
          "title": "My Product",
          "sku": "1234",
          "costOfGood": 20,
          "price": 1000,
          "productVariantId": null,
          "taxType": "General Merchandise",
          "sortOrder": 1
        }
      ],
      "timeSlots": [
        {
          "dayOfWeek": 1,
          "times": [
            {
              "time": "10:00:00",
              "allowCustomersToReserveOnline": true
            },
            {
              "time": "12:00:00",
              "allowCustomersToReserveOnline": false
            }
          ]
        },
        {
          "dayOfWeek": 2,
          "times": [
            {
              "time": "10:00:00",
              "allowCustomersToReserveOnline": false
            },
            {
              "time": "12:00:00",
              "allowCustomersToReserveOnline": false
            }
          ]
        }
      ]
    }],
        "total": 1
    }
