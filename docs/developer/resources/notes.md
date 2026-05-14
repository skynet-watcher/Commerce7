# Notes

**Source:** [https://developer.commerce7.com/docs/notes](https://developer.commerce7.com/docs/notes)

**Section:** resources

---
[Notes](https://documentation.commerce7.com/how-do-i-use-notes-tags-flags) can be created and attached to customers, orders, or club memberships.
* * *
# 
Note object
JSON
    
    {
        "type": "Note",
        "content": "Test Note",
        "noteDate": "2018-06-07T18:03:56.067Z",
        "customerId": "e6418130-51f4-42f7-b295-c2874d156008"
    }
* * *
# 
Create note
**`POST`** `/note`
**Request**
JSON
    
    {
        "type": "Note",
        "content": "Test Note",
        "noteDate": "2018-06-07T18:03:56.067Z",
        "customerId": "e6418130-51f4-42f7-b295-c2874d156008"
    }
**Response**  
`note` object
* * *
# 
Retrieve note
**`GET`** `/note/{:id}`
**Response**  
`note` object
* * *
# 
Update notes
**`PUT`** `/note/{:id}`
**Request**
JSON
    
    {
        "type": "Note",
        "content": "Test Note Update",
        "customerId": "e6418130-51f4-42f7-b295-c2874d156008"
    }
**Response**  
`note` object
* * *
# 
Delete note
**`DELETE`** `/note/{:id}`
**Response**  
Blank object and 204 status
* * *
# 
List notes
**`GET`** `/note`
**Optional query parameters**  
Start param with `?` and join multiple parameters with `&`. Ex. `/note?customerId=e6418130-51f4-42f7-b295-c2874d156008`
Param| Description  
---|---  
`q=n`|   
`customerId=n`| Notes attached to a specific customer / customer ID  
`orderId=n`| Notes attached to a specific order / order ID  
**Response**  
An array of `note` objects and total count
JSON
    
    {
        "notes": [{
            "id": "edcc43c2-66c7-46a6-a8e0-48878fa72da1",
            "type": "Note",
            "noteDate": "2018-06-07T23:18:06.249Z",
            "content": "Note 2",
            "customerId": "e6418130-51f4-42f7-b295-c2874d156008",
            "createdAt": "2018-06-07T23:18:06.360Z",
            "updatedAt": "2018-06-07T23:18:06.360Z"
        }, {
            "id": "f70e92d8-ae86-4e89-b061-9f9c0f4fb99a",
            "type": "Note",
            "noteDate": "2018-06-07T23:18:03.090Z",
            "content": "Note 1",
            "customerId": "e6418130-51f4-42f7-b295-c2874d156008",
            "createdAt": "2018-06-07T23:18:03.210Z",
            "updatedAt": "2018-06-07T23:18:03.210Z"
        }],
        "total": 2
    }
