# Inventory Location

**Source:** https://developer.commerce7.com/docs/inventory-location

---

[Inventory locations](https://documentation.commerce7.com/inventory-locations-overview) are set up by the client and are the locations that they fulfill inventory from.
  * Inventory location object
  * Create inventory location
  * Retrieve inventory location
  * List inventory locations


* * *
# 
Inventory location object
JSON
    
    {
      "id": "88145cdc-f5a6-11e8-a80a-06d2aa911ccc",
      "title": "Default",
      "address": "3425 Solano Ave",
      "address2": "",
      "city": "Napa",
      "stateCode": "CA",
      "zipCode": "95251",
      "countryCode": "US",
      "phone": "+17075557874",
      "isWebShipLocation": true,
      "isInboundShipLocation": true,
      "isClubShipLocation": true,
      "isAPickupLocation": true,
      "createdAt": "2018-12-01T20:20:23.000Z",
      "updatedAt": "2019-01-23T22:23:28.157Z"
    }
* * *
# 
Create inventory location
**`POST`** `/inventory-location`
**Request**
JSON
    
    {
    	"title": "Tasting Room 2",
    	"address": "3425 Solano Ave",
    	"city": "Napa",
    	"stateCode": "CA",
    	"zipCode": "94558",
    	"countryCode": "US",
    	"phone": "+17075555555",
    	"isWebShipLocation": false,
    	"isClubShipLocation": false,
    	"isAPickupLocation": false
    }
**Response**  
`inventory-location` object
* * *
# 
Retrieve inventory location
**`GET`** `/inventory-location/:id`
**Response**  
`inventory-location` object
* * *
# 
List inventory locations
**`GET`** `/inventory-location`
**Response**  
An array of `inventory-location` objects and total count
JSON
    
    {
    "inventoryLocations": [{
     "id": "478e20f6-f48e-4c54-b06d-bf370c5f4158",
     "title": "Tasting Room 1",
     "address": "3425 Solano Ave",
     "address2": null,
     "city": "Napa",
     "stateCode": "CA",
     "zipCode": "94558",
     "countryCode": "US",
     "phone": "+17075557874",
     "isWebShipLocation": false,
     "isInboundShipLocation": false,
     "isClubShipLocation": false,
     "isAPickupLocation": true,
     "createdAt": "2019-02-12T19:38:08.104Z",
     "updatedAt": "2019-02-12T19:38:08.104Z"
    }, {
     "id": "0a958dd3-fa44-49b2-8f33-3ee681d390c8",
     "title": "Tasting Room 2",
     "address": "202 Colonial Drive",
     "address2": null,
     "city": "Horseheads",
     "stateCode": "NY",
     "zipCode": "14845",
     "countryCode": "US",
     "phone": "+16075555555",
     "isWebShipLocation": false,
     "isInboundShipLocation": false,
     "isClubShipLocation": false,
     "isAPickupLocation": true,
     "createdAt": "2019-02-12T19:41:11.041Z",
     "updatedAt": "2019-02-12T19:41:11.041Z"
    }, {
     "id": "88145cdc-f5a6-11e8-a80a-06d2aa911ccc",
     "title": "WEB",
     "address": "3425 Solano Ave",
     "address2": "",
     "city": "Napa",
     "stateCode": "CA",
     "zipCode": "95251",
     "countryCode": "US",
     "phone": "+17075557874",
     "isWebShipLocation": true,
     "isInboundShipLocation": true,
     "isClubShipLocation": true,
     "isAPickupLocation": true,
     "createdAt": "2018-12-01T20:20:23.000Z",
     "updatedAt": "2019-02-12T19:37:36.593Z"
    }],
    "total": 3
    }
