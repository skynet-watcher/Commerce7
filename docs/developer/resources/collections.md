# Collections

**Source:** [https://developer.commerce7.com/docs/collections](https://developer.commerce7.com/docs/collections)

**Section:** resources

---
[Collections](https://documentation.commerce7.com/what-are-collections-and-how-do-they-work) are used to group and display products online and on the POS.
* * *
# 
Collection object
JSON
    
    {
        "id": "dfdd3929-5a24-4340-b9e1-eedfe25e8a63",
        "title": "Wine",
        "type": "Manual",
        "content": "Collection of all wines",
        "webStatus": "Available",
        "adminStatus": "Available",
        "slug": "wine",
        "featureImage":
        "https://images.commerce7.com/images/collection/gold_library_wines-1526928166546.png",
        "createdAt": "2018-05-18T16:53:47.913Z",
        "updatedAt": "2018-05-18T16:53:47.913Z",
        "seo": {
          "title": "Wine",
          "description": "Collection of all wines"
        }
    }
* * *
# 
Create collection
**`POST`** `/collection`
**Request**
JSON
    
    {
        "title": "Gold Library Wines",
        "content": "Library wines reserved for gold club members",
        "type": "Manual",
        "webStatus": "Available",
        "adminStatus": "Available"
    }
**Response**  
`collection` object
* * *
# 
Retrieve collection
**`GET`** `/collection/{:id}`
**Response**  
`collection` object
* * *
# 
Update collection
**`PUT`** `/collection/{:id}`
**Request**
JSON
    
    {
        "title": "Gold Library Wines",
        "content": "<p>Library wines reserved for gold club members.</p>",
        "slug": "gold-library-wines",
        "webStatus": "Available",
        "adminStatus": "Available",
        "seo": {
            "title": "Gold Library Wines",
            "description": "Library wines reserved for gold club members."
        }
    }
**Response**  
`collection` object
* * *
# 
Delete collection
**`DELETE`** `/collection/{:id}`
**Response**  
`collection` object
* * *
# 
List collections
**`GET`** `/collection`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`.
Param| Description  
---|---  
`q=n`|   
`webStatus=n`| 
  * `Available`
  * `Not Available`
  * `Retired`

Ex: `/collection?webStatus=Available`  
**Response**  
An array of `collection` objects and total count
JSON
    
    {
        "collections": [{
            "id": "30d4f4b1-eb3a-4dae-87f2-1289bd61bda6",
            "title": "Gold Library Wines",
            "content": "<p>Library wines reserved for gold club members.</p>",
            "type": "Manual",
            "webStatus": "Available",
            "adminStatus": "Available",
            "slug": "gold-library-wines",
            "createdAt": "2018-05-21T18:41:34.703Z",
            "updatedAt": "2018-05-21T18:42:52.653Z",
            "seo": {
            "title": "Gold Library Wines",
            "description": "Library wines reserved for gold club members."
            }
        }, {
            "id": "dfdd3929-5a24-4340-b9e1-eedfe25e8a63",
            "title": "Wine",
            "content": "All Wines",
            "type": "Manual",
            "webStatus": "Available",
            "adminStatus": "Available",
            "slug": "wine",
            "createdAt": "2018-05-18T16:53:47.913Z",
            "updatedAt": "2018-05-18T16:53:47.913Z",
            "seo": {
            "title": "Wine",
            "description": "All Wines"
            }
        }],
        "total": 2
    }
