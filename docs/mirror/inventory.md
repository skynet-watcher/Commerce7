# Inventory

**Source:** https://developer.commerce7.com/docs/inventory

---

[Inventory](https://documentation.commerce7.com/how-do-i-initialize-inventory) can be enabled on products to track how many of each product SKU is available and in the various statuses.
  * Inventory object & ENUMs
  * Retrieve inventory
  * Initialize inventory
  * Inventory transaction
  * List inventory


* * *
# 
Inventory object
Object
    
    {
      "id": "26194448-f662-11e8-a80a-06d2aa911ccc",
      "inventoryLocationTitle": "Website Shipping",
      "inventoryLocationId": "b6208900-bf87-42e6-a590-9ef9a901a8db",
      "productVariantId": "025652a7-11ea-4236-a042-1463b8bc4bfd",
      "productVariantTitle": "750ml",
      "sku": "2017-R",
      "upcCode": null,
      "hasInventory": true,
      "availableForSaleCount": 799,
      "reserveCount": 50,
      "allocatedCount": 200,
      "inventoryPolicy": "Dont Sell",
      "productId": "47e09ed7-0d5e-45d9-be4b-5ad9e1ddbc1e",
      "productTitle": "2017 Spectra Rosé"
    }
## 
ENUMs
Field| Value  
---|---  
`action`| 
  * `Reset`
  * `Adjust`

  
* * *
# 
Retrieve inventory
**`GET`** `/inventory/{:id}`
**Response**  
`inventory` object
* * *
# 
Initialize inventory
Turns on inventory for a specific product SKU
**`POST`** `/inventory`
**Request**
JSON
    
    {
      "sku": "83747572",
      "initialInventory": [{
      "inventoryLocationId": "88145cdc-f5a6-11e8-a80a-06d2aa911ccc",
      "availableForSale": 10
      }],
      "inventoryPolicy": "Back Order"
    }
**Response**  
`inventory` object
* * *
## 
Inventory transaction
Adjusts or resets inventory count for a specific SKU.
**`POST`** `/inventory-transaction`
**Request**
JSON
    
    {
      "action": "Reset",
      "sku": "83747572",
      "notes": "Reset count to match fulfillment",
      "availableForSaleCount": 30,
      "reserveCount": 5,
      "inventoryLocationId": "88145cdc-f5a6-11e8-a80a-06d2aa911ccc"
    }
**Response**  
Inventory transaction
JSON
    
    {
     "inventoryLocationId": "88145cdc-f5a6-11e8-a80a-06d2aa911ccc",
     "sku": "83747572",
     "productVariantId": "d7fc72a1-45f4-4c63-910c-37fc16edc809",
     "transactionType": "Manual",
     "transactionDetails": "Manual Reset of 83747572",
     "notes": "Reset count to match fulfillment",
     "availableForSaleCount": 20,
     "reserveCount": 5,
     "allocatedCount": 0,
     "id": "244fa12b-fb4b-4b42-ad4e-2bd1f4d07022",
     "transactionDate": "2019-02-12T18:50:51.476Z",
     "updatedAt": "2019-02-12T18:50:51.476Z",
     "createdAt": "2019-02-12T18:50:51.476Z",
     "searchText": "Manual Reset of 83747572"
    }
* * *
# 
List inventory
**`GET`** `/inventory`
**Optional query parameters**
Param| Description  
---|---  
`q=n`| Where n equals value  
**Response**  
An array of `inventory` objects and total count
JSON
    
    {
        "inventories": [{
            "id": "26194602-f662-11e8-a80a-06d2aa911ccc",
            "inventoryLocationTitle": "Website Shipping",
            "inventoryLocationId": "b6208900-bf87-42e6-a590-9ef9a901a8db",
            "productVariantId": "75239967-cfe3-4e0f-b196-5a9c6f9a5938",
            "productVariantTitle": "750ml",
            "sku": "2017-SB",
            "upcCode": "0-12345-00003-1",
            "hasInventory": 1,
            "availableForSaleCount": 0,
            "reserveCount": 0,
            "allocatedCount": 0,
            "inventoryPolicy": "Dont Sell",
            "productId": "2676016d-29eb-4ddb-a9f0-0f7e01cabe69",
            "productTitle": "2017 Spectra Sauvignon Blanc"
        }, {
            "id": "333c4070-f662-11e8-a80a-06d2aa911ccc",
            "inventoryLocationTitle": "Club Shipping",
            "inventoryLocationId": "fc3ff2dd-27d3-4cf2-94b5-e9c0442c0df5",
            "productVariantId": "75239967-cfe3-4e0f-b196-5a9c6f9a5938",
            "productVariantTitle": "750ml",
            "sku": "2017-SB",
            "upcCode": "0-12345-00003-1",
            "hasInventory": 1,
            "availableForSaleCount": 0,
            "reserveCount": 0,
            "allocatedCount": 0,
            "inventoryPolicy": "Dont Sell",
            "productId": "2676016d-29eb-4ddb-a9f0-0f7e01cabe69",
            "productTitle": "2017 Spectra Sauvignon Blanc"
        }, {
            "id": "41e7663e-f662-11e8-a80a-06d2aa911ccc",
            "inventoryLocationTitle": "Victoria Tasting Room",
            "inventoryLocationId": "6f8dd1a1-445d-4b88-8f89-9733df1de175",
            "productVariantId": "75239967-cfe3-4e0f-b196-5a9c6f9a5938",
            "productVariantTitle": "750ml",
            "sku": "2017-SB",
            "upcCode": "0-12345-00003-1",
            "hasInventory": 1,
            "availableForSaleCount": 0,
            "reserveCount": 0,
            "allocatedCount": 0,
            "inventoryPolicy": "Dont Sell",
            "productId": "2676016d-29eb-4ddb-a9f0-0f7e01cabe69",
            "productTitle": "2017 Spectra Sauvignon Blanc"
        }, {
            "id": "8a8313ef-f5a6-11e8-a80a-06d2aa911ccc",
            "inventoryLocationTitle": "Vancouver Tasting Room",
            "inventoryLocationId": "88142351-f5a6-11e8-a80a-06d2aa911ccc",
            "productVariantId": "75239967-cfe3-4e0f-b196-5a9c6f9a5938",
            "productVariantTitle": "750ml",
            "sku": "2017-SB",
            "upcCode": "0-12345-00003-1",
            "hasInventory": 1,
            "availableForSaleCount": 739,
            "reserveCount": 0,
            "allocatedCount": 11,
            "inventoryPolicy": "Dont Sell",
            "productId": "2676016d-29eb-4ddb-a9f0-0f7e01cabe69",
            "productTitle": "2017 Spectra Sauvignon Blanc"
        }, {
            "id": "9d56fd6f-f668-11e8-a80a-06d2aa911ccc",
            "inventoryLocationTitle": "Whistler Tasting Room",
            "inventoryLocationId": "d6fddd3d-d63d-4cf6-b20c-e5cc2feaf340",
            "productVariantId": "75239967-cfe3-4e0f-b196-5a9c6f9a5938",
            "productVariantTitle": "750ml",
            "sku": "2017-SB",
            "upcCode": "0-12345-00003-1",
            "hasInventory": 1,
            "availableForSaleCount": 0,
            "reserveCount": 0,
            "allocatedCount": 0,
            "inventoryPolicy": "Dont Sell",
            "productId": "2676016d-29eb-4ddb-a9f0-0f7e01cabe69",
            "productTitle": "2017 Spectra Sauvignon Blanc"
        }],
        "total": 5
    }
