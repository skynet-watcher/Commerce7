# Vendors

**Source:** [https://developer.commerce7.com/docs/vendors](https://developer.commerce7.com/docs/vendors)

**Section:** resources

---
Vendors are attributes that can be created and assigned on products.
* * *
# 
Vendor object
JSON
    
    {
      "id": "1a8a9f3c-b420-4cbf-9089-449819a1c4b0",
      "title": "Spectra Winery",
      "createdAt": "2018-05-20T07:30:55.045Z",
      "updatedAt": "2018-05-20T07:30:55.045Z"
    }
* * *
# 
Create vendor
**`POST`** `/vendor`
**Request**
JSON
    
    {
     "title": "Spectra Winery"
    }
**Response**  
`vendor` object
* * *
# 
Retrieve vendor
**`GET`** `/vendor/{:id}
**Response**  
`vendor` object
* * *
# 
Update vendor
**`PUT`** `/vendor/{:id}`
**Request**
JSON
    
    {
     "title": "Spectra Vineyards"
    }
**Response**  
`vendor` object
* * *
# 
Delete vendor
**`DELETE`** `/vendor/{:id}`
**Response**  
`vendor` object
* * *
# 
List vendors
**`POST`** `/vendor`
**Optional query parameters**
Param| Description  
---|---  
`q=n`| Ex. `/vendor?q=spectra`  
**Response**  
An array of `vendor` objects and total count
JSON
    
    {
      "vendors": [{
        "id": "1a8a9f3c-b420-4cbf-9089-449819a1c4b0",
        "title": "Spectra Winery",
        "createdAt": "2018-05-20T07:30:55.045Z",
        "updatedAt": "2018-05-21T23:55:21.456Z"
        }, {
        "id": "dfecc0d4-e2d8-4f72-aa31-3db5c1394666",
        "title": "Wonderful Winery",
        "createdAt": "2018-05-21T23:47:45.450Z",
        "updatedAt": "2018-05-21T23:55:28.277Z"
      }],
      "total": 2
    }
