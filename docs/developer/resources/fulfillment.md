# Fulfillment

**Source:** [https://developer.commerce7.com/docs/fulfillment](https://developer.commerce7.com/docs/fulfillment)

**Section:** resources

---
Fulfillment is used to update an order's shipping or pickup status such as when it's been picked up or shipped.
  * Fulfillment object
  * Create fulfillment (all items)
  * Create shipping fulfillment
  * Create pickup fulfillment
  * Delete fulfillment


* * *
# 
Fulfillment object
Object
    
    {
      "fulfillments": [{
        "id": "9a9a8a77-3bfc-4e4f-909b-c09325fddcfc",
        "type": "Shipped",
        "fulfillmentDate": "2018-07-03T07:00:00.000Z",
        "packageCount": 1,
        "items": [{
         "sku": "70010001-01",
         "quantityFulfilled": 1
      }],
        "shipped": {
         "trackingNumbers": ["Z1234231123523234"],
         "carrier": "UPS"
        }
      }]
    }
* * *
# 
Create fulfillment (all items)
**`POST`** `/order/{:id}/fulfillment/all`
**Request**  
This method automatically marks all items on the order as fulfilled. You do not need to provide the items array. See the pickup or shipping method below if you want to fulfill only specific items on an order.
JSON
    
    {
    	"sendTransactionEmail": true,
    	"type": "Shipped",
    	"fulfillmentDate": "2020-05-01T10:59:32.000Z",
    	"shipped": {
    		"trackingNumbers": ["1Z525R5EA803600000"],
    		"carrier": "UPS"
    	},
    	"packageCount": 1
    }
**Response**  
`order` object
## 
Create shipping fulfillment
**`POST`** `/order/{:id}/fulfillment`
**Request**
JSON
    
    {
     "type": "Shipped",
     "packageCount": 1,
     "items": [{
      "sku": "70010001-01",
      "quantityFulfilled": 1
     }],
     "sendTransactionEmail": true,
     "fulfillmentDate": "2018-07-03T07:00:00.000Z",
     "shipped": {
      "trackingNumbers": ["Z1234231123523234"],
      "carrier": "UPS"
     }
    }
**Response**  
`order` object
## 
Create pickup fulfillment
**`POST`** `/order/{:id}/fulfillment`
**Request**
JSON
    
    {
     "type": "Picked Up",
     "packageCount": 1,
     "items": [{
      "sku": "70010001-01",
      "quantityFulfilled": 1
     }],
     "sendTransactionEmail": false,
     "fulfillmentDate": "2018-07-03T07:00:00.000Z",
     "pickedUp": {
      "pickedUpBy": "Jason Andres"
     }
    }
**Response**  
`order` object
## 
Mark as "No Fulfillment Required"
**`POST`** `/order/{:id}/fulfillment`
**Request**
JSON
    
    {
        "type": "No Fulfillment Required",
        "sendTransactionEmail": false,
        "fulfillmentDate": "2022-09-26T10:59:32.000Z",
        "packageCount": 1
    }
**Response**  
`order` object
* * *
# 
Delete fulfillment
**`DELETE`** `/order/{:id}/fulfillment/{:id}`
**Response**  
Blank object and 204 status
