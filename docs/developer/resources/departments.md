# Departments

**Source:** [https://developer.commerce7.com/docs/departments](https://developer.commerce7.com/docs/departments)

**Section:** resources

---
[Departments](https://documentation.commerce7.com/how-to-create-a-department) are groups to separate products for internal purposes. Departments are primarily used for accounting as they are integrated into sales reports. Common departments are "Wine" or "Merchandise".
* * *
# 
Department object
JSON
    
    {
      "id": "5e253ffd-007c-435f-ad56-ff06649d06d5",
      "title": "Wine Product",
      "code": "Wine",
      "createdAt": "2018-05-18T16:53:46.597Z",
      "updatedAt": "2018-05-18T16:53:46.597Z"
    }
* * *
# 
Create department
**`POST`** `/department`
**Request**
JSON
    
    {
     "title": "Glass Products",
     "code": "GlassProducts"
    }
**Response**  
`department` object
* * *
# 
Retrieve department
**`GET`** `/department/{:id}`
**Response**  
`department` object
* * *
# 
Update department
**`PUT`** `/department/{:id}`
**Request**  
You only need to include the fields that are being updated. In this example, we're updating `code`.
JSON
    
    {
      "code": "GlassProducts"
    }
**Response**  
`department` object
* * *
# 
Delete department
**`DELETE`** `/department/:id`
**Response**  
Blank object and 204 status
* * *
# 
List departments
**`POST`** `/department`
**Optional query parameters**
Param| Description  
---|---  
`q=n`| Ex. `/department?q=wine`  
**Response**  
An array of `department` objects and total count
JSON
    
    {
      "departments": [{
        "id": "aec8ab99-cbdd-4f6f-9862-f104e24bdc5f",
        "title": "Glass Products No Lead",
        "code": "GlassProducts",
        "createdAt": "2018-05-21T23:27:25.921Z",
        "updatedAt": "2018-05-21T23:30:35.031Z"
        }, {
        "id": "5e253ffd-007c-435f-ad56-ff06649d06d5",
        "title": "Wine Product",
        "code": "Wine",
        "createdAt": "2018-05-18T16:53:46.597Z",
        "updatedAt": "2018-05-18T16:53:46.597Z"
      }],
      "total": 2
    }
