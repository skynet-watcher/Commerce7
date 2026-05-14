# Products

**Source:** https://developer.commerce7.com/docs/products

---

[Manage products](https://documentation.commerce7.com/adding-products-to-commerce7) in a client tenant. Product must have at least one variant, but they can have more than one per product. SKUs must be unique.
  * Product object & ENUMs
  * Retrieve product
  * Update product
  * Delete product
  * List products


* * *
# 
Product object
Object
    
    {
        "id": "94d672d2-b9aa-4c2e-8c28-37fbc3a12f73",
        "title": "2014 Spectra Cabernet Sauvignon",
        "subTitle": "",
        "image": "https://images.commerce7.com/spectrawinery/images/original/spectra-red-1522094480333.png",
        "type": "Wine",
        "departmentId": "ff78df8d-f7db-429a-9271-42e79aace894",
        "vendorId": null,
        "teaser": "A dense, mid-palate richness, complexity and a delicious finish. Dark red cherry fruit and sinfully deep mocha flavors that finish with a spicy note of black pepper.",
        "content": "<p>This wine has everything we love about Oakville cabernet sauvignon: a dense, mid-palate richness, complexity and a delicious finish. Dark red cherry fruit and sinfully deep mocha flavors that finish with a spicy note of black pepper. 76% Cabernet Sauvignon, 13% Cabernet Franc, 4% Malbec, 4% Petit Verdot, 3% Merlot Vineyard Notes The low fertility, well-drained soils and optimal sun exposure yield rich, complex flavors and impeccable fruit maturity. Winemaker Notes The grapes were hand-harvested into small bins and carefully sorted in our gravity-flow cellar.</p>\n<p>The clusters were destemmed directly into traditional French oak tanks for cold soak, fermentation and extended maceration &ndash; a total of 33 days of wine to skin contact &ndash; maximizing the extraction of varietal character and complexity while keeping the tannins fleshy and supple. The new wine was drained and gently pressed into 78% new French-oak barrels for malolactic fermentation, assuring seamless integration of fruit and oak.</p>\n<p>The final blend was assembled through repeated tasting trials over the 20 months of barrel aging. The wine was bottled in July of 2014.</p>",
        "webStatus": "Available",
        "adminStatus": "Available",
        "slug": "2014-spectra-cabernet-sauvignon",
        "metaData": {
        "your-club-pricing": "Club Members Save 30% = 31.50$"
        },
        "productTemplateId": null,
        "createdAt": "2018-05-15T05:27:33.246Z",
        "updatedAt": "2019-09-11T15:48:23.011Z",
        "images": [{
            "id": "20b845ab-17c1-4677-ac75-2b6b41a33d07",
            "src": "https://images.commerce7.com/spectrawinery/images/original/spectra-red-1522094480333.png",
            "sortOrder": 0
        }],
        "bundleItems": [],
        "variants": [{
            "id": "f43b751f-1124-472c-b94b-0ea8aebf011b",
            "title": "750ml",
            "sku": "2014-CS",
            "upcCode": "0-12345-00006-1",
            "volumeInML": 750,
            "costOfGood": 700,
            "price": 4500,
            "comparePrice": null,
            "bottleDeposit": 0,
            "sortOrder": 1,
            "hasInventory": true,
            "inventoryPolicy": "Dont Sell",
            "hasShipping": true,
            "taxType": "Wine",
            "weight": 21,
            "inventory": [{
                "reserveCount": 0,
                "allocatedCount": 110,
                "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
                "inventoryLocationId": "45bbbb1c-ebdd-4b37-b325-2c822b6bf1ef",
                "availableForSaleCount": 990
            }, {
            "reserveCount": 0,
            "allocatedCount": 0,
            "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
            "inventoryLocationId": "7d4b0835-d898-4153-bfd6-489207463281",
            "availableForSaleCount": 0
            }, {
            "reserveCount": 0,
            "allocatedCount": 6,
            "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
            "inventoryLocationId": "ad186bfd-a248-4917-8994-e9bb00b833a5",
            "availableForSaleCount": 992
            }, {
            "reserveCount": 0,
            "allocatedCount": 0,
            "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
            "inventoryLocationId": "e80713c3-42b3-466a-b290-807e3012e3b5",
            "availableForSaleCount": 0
            }, {
            "reserveCount": 0,
            "allocatedCount": 42,
            "productVariantId": "f43b751f-1124-472c-b94b-0ea8aebf011b",
            "inventoryLocationId": "fc3ff2dd-27d3-4cf2-94b5-e9c0442c0df5",
            "availableForSaleCount": 953
            }]
        }],
        "tenantIds": [],
        "collections": [{
            "id": "2b294b22-c664-443e-9319-b8c9855ba811",
            "title": "Library",
            "content": "",
            "publishDate": "2019-04-17T23:07:00.000Z",
            "slug": "library",
            "productTemplateId": null,
            "type": "Manual",
            "productCount": null,
            "appliesToCondition": null,
            "onlyShowProductsWithInventory": false,
            "createdAt": "2019-04-17T23:07:24.421Z",
            "updatedAt": "2019-04-17T23:07:24.421Z",
            "seo": {
                "title": "Library",
                "description": null
            }
        }, {
            "id": "3e18ab3f-c84b-4ace-9590-9560e749a50a",
            "title": "Wine",
            "content": "<p>Dolorem qui et velit. Magnam itaque minus est non vel sint. Quaerat quia accusamus. Sunt vel maxime voluptatem autem eaque. In provident quasi magni sit voluptas hic fuga sed. Rerum quas est laboriosam quod eligendi eum illum aspernatur sed.</p>",
            "publishDate": "2018-03-26T19:25:00.000Z",
            "slug": "wine",
            "productTemplateId": "5229a14d-44e7-4eb3-87c9-1218c3ce6280",
            "type": "Manual",
            "productCount": null,
            "appliesToCondition": null,
            "onlyShowProductsWithInventory": false,
            "createdAt": "2018-03-26T19:01:39.434Z",
            "updatedAt": "2019-10-02T16:43:49.341Z",
            "seo": {
            "title": "Wine",
            "description": "Wine"
        }
        }, {
            "id": "6c02552a-e393-4d62-835c-e0314505115e",
            "title": "Homepage",
            "content": "Featured Products",
            "publishDate": "2018-03-27T13:18:00.000Z",
            "slug": "home",
            "productTemplateId": null,
            "type": "Manual",
            "productCount": null,
            "appliesToCondition": null,
            "onlyShowProductsWithInventory": false,
            "createdAt": "2018-03-27T13:18:23.252Z",
            "updatedAt": "2018-03-27T17:23:44.089Z",
            "seo": {
                "title": "Homepage",
                "description": "Featured Products"
            }
        }],
        "seo": {
            "title": "2014 Spectra Cabernet Sauvignon",
            "description": "This wine has everything we love about Oakville cabernet sauvignon: a dense, mid-palate richness, complexity and a delicious finish. Dark red cherry fruit..."
        },
        "wine": {
            "type": "Red",
            "varietal": "Cabernet Sauvignon",
            "countryCode": "US",
            "region": "California",
            "appellation": "Oakville",
            "vintage": 2012
        },
        "security": {
            "availableTo": "Public"
        },
        "overrideOperatingRegions": {
            "isOverride": false,
            "operatingStateCodes": null,
            "operatingCountryCodes": null
        }
    }
## 
ENUMs
The product enumerated fields and their values.
Field| Value  
---|---  
`type`| 
  * `General Merchandise`
  * `Tasting`
  * `Wine`
  * `Cannabis`
  * `Bundle`
  * `Reservation`
  * `Event Ticket`
  * `Gift Card`
  * `Collateral`
  * `Rebate`

  
`taxType`| 
  * `Food`
  * `General Merchandise`
  * `Wine`
  * `Not Taxable`
  * `Cannabis`

  
`webStatus`| 
  * `Available`
  * `Not Available`
  * `Retired`

  
`adminStatus`| 
  * `Available`
  * `Not Available`
  * `Hidden`

  
`securityAvailableTo`| 
  * `Public` (default)
  * `Allocation`
  * `Group`
  * `Club`

  
`securityDisplayOption`| 
  * `Display Product / Show Login` (default)
  * `Dont Display Product`

  
`inventoryPolicy`| 
  * `Back Order`
  * `Dont Sell`

  
* * *
# 
Create product
**`POST`** `/product`
**Request**
JSON
    
    {
        "type": "Wine",
        "title": "Spectra Red",
        "subTitle": "Blend of the best!",
        "slug": "spectra-red",
        "webStatus": "Available",
        "adminStatus": "Available",
        "collections": [],
        "wine": {
            "type": "Red",
            "varietal": "Blend",
            "countryCode": "US",
            "region": "California",
            "appellation": "Alexander Valley",
            "vintage": 2019
        },
        "seo": {
            "title": "Spectra Red"
        },
        "variants": [{
            "title": "750ml",
            "sku": "458392858",
            "upcCode": "294837564810",
            "price": 1500,
            "comparePrice": 1700,
            "sortOrder": 1,
            "hasShipping": true,
            "weight": 3,
            "costOfGood": 300,
            "hasInventory": false,
            "inventoryPolicy": "Back Order",
            "taxType": "Wine",
            "volumeInML": 750,
            "bottleDeposit": 0
        }],
        "security": {
            "availableTo": "Public"
        }
    }
**Response**  
`product` object
* * *
# 
Retrieve product
**`GET`** `/product/{:id}
**Response**  
`product` object
* * *
# 
Update product
**`PUT`** `/product/{:id}`
**Request**  
When updating the root object elements, you only need to include the values being updated, any sub objects like variants for example, you need to pass all elements in the request, any missing elements will be overwritten with null values. In the example `slug` is being updated.
JSON
    
    {
        "slug": "spectra-red"
    }
**Response**  
`product` object
* * *
# 
Delete product
**`DELETE`** `/product/:id`
**Response**  
Blank object with a 204 status
* * *
# 
List products
**`GET`** `/product`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`. Example: `/product?q=cab&adminStatus=Available`
Param| Description  
---|---  
`q=n`| Name  
`updatedAt=n`| Date format: YYYY-MM-DD  
Date options: `=`, `=gt:`, `gte:`, `=lt:`, `=lte:`  
`webStatus=n`| 
  * `Available`
  * `Not Available`
  * `Retired`

  
`adminStatus=n`| 
  * `Available`
  * `Not Available`
  * `Hidden`

  
`collectionId=n`| Products in a specific Collection (based on Collection ID)  
**Response**  
Array of `product` objects and total count
