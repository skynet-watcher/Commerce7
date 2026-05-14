# Tags

**Source:** [https://developer.commerce7.com/docs/tags](https://developer.commerce7.com/docs/tags)

**Section:** resources

---
[Tags](https://documentation.commerce7.com/how-do-i-use-notes-tags-flags) can be created and attached to customers, orders, club memberships or reservations.
  * Tag object, ENUMs & tag conditions
  * Create tag
  * Retrieve tag
  * Update tag
  * Delete tag
  * List tags


* * *
# 
Tag object
JSON
    
    {
        "id": "b5a2503f-396b-4f90-85e9-44d39d6c8319",
        "title": "state",
        "objectType": "Customer",
        "type": "Dynamic",
        "appliesToCondition": "One or more conditions",
        "createdAt": "2019-08-15T19:17:50.699Z",
        "updatedAt": "2020-03-01T23:12:41.617Z",
        "conditions": [{
            "id": "c31718c2-7bc7-4bc9-a9de-b68037d5d744",
            "appliesTo": "State",
            "condition": "is equal to",
            "value": "BC"
        }],
        "backPopulate": {
            "currentPage": 5,
            "totalPages": 5,
            "cursor": "fa5c3a28-4058-4506-bdfe-31a22ed8e1e4",
            "status": "Completed",
            "processDate": "2020-03-01T23:12:41.617Z"
        }
    }
## 
ENUMs
Field| Value  
---|---  
`type`| 
  * `manual`
  * `dynamic`

  
`objectType`| 
  * `Order`
  * `Customer`
  * `ClubMembership`
  * `Reservation`

  
`appliesToCondition`| 
  * `All conditions`
  * `One or more conditions`

  
`condition`| 
  * `is equal to`
  * `is greater than`
  * `is less than`

  
## 
Tag conditions
Conditions are used for Dynamic Tags to automatically apply them based on a set of properties. Supported conditions vary based on the type of tag.
Type| Conditions| Value  
---|---|---  
`order`| `is equal to`| 
  * `Channel`
  * `POS Profile`
  * `Sku`
  * `Ship To State`
  * `Ship To Country`
  * `Has Gift Message`

  
`order`| `is greater than`  
`is less than`| 
  * `Order Total`

  
`customer`| `is equal to`| 
  * `State`
  * `Country`
  * `Email Marketing Status`
  * `Birth Month`
  * `Sku Purchased`

  
`customer`| `is greater than`  
`is less than`| 
  * `Lifetime Value`
  * `Birthdate`
  * `Order Count`
  * `Last Order Date`
  * `Rank`

  
* * *
# 
Create tag
**`POST`** `/tag/{:objectType(customer|club-membership|order|reservation)}`
**Request**
JSON
    
    {
     "title": "My First Tag",
     "type": "Manual"
    }
**Response**  
`tag` object
* * *
# 
Retrieve tag
**GET** : `/tag/{:objectType(customer|club-membership|order|reservation)}/{:id}`
**Response**  
`tag` object
* * *
# 
Update tag
**`PUT`** `/tag/{:objectType(customer|club-membership|order|reservation)}/{:id}`
**Request**
JSON
    
    {
     "title": "My First Tag Update",
     "type": "Manual"
    }
**Response**  
`tag` object
* * *
# 
Delete tag
**`DELETE`** `/tag/{:objectType(customer|club-membership|order|reservation)}/{:id}`
**Response**  
Blank object and 204 status
* * *
# 
List tags
**`GET`** `/tag/{:objectType(customer|club-membership|order|reservation)}`
**Response**  
An array of `tag` objects and total count
JSON
    
    {
        "tags": [{
            "id": "ba333a08-f72c-47f3-bee7-800ae3fe6453",
            "title": "Customer Manual Tag",
            "objectType": "Customer",
            "type": "Manual",
            "appliesToCondition": null,
            "createdAt": "2020-03-23T20:59:32.525Z",
            "updatedAt": "2020-03-23T20:59:32.525Z",
            "conditions": []
        },
        {
            "id": "703d758d-111f-4ecc-a48d-4887758574ee",
            "title": "My First Tag Update",
            "objectType": "Customer",
            "type": "Manual",
            "appliesToCondition": null,
            "createdAt": "2020-03-23T20:59:43.204Z",
            "updatedAt": "2020-03-23T21:22:29.702Z",
            "conditions": []
        },
        {
            "id": "b5a2503f-396b-4f90-85e9-44d39d6c8319",
            "title": "state",
            "objectType": "Customer",
            "type": "Dynamic",
            "appliesToCondition": "One or more conditions",
            "createdAt": "2019-08-15T19:17:50.699Z",
            "updatedAt": "2020-03-01T23:12:41.617Z",
            "conditions": [{
            "id": "c31718c2-7bc7-4bc9-a9de-b68037d5d744",
            "appliesTo": "State",
            "condition": "is equal to",
            "value": "BC"
            }],
            "backPopulate": {
            "currentPage": 5,
            "totalPages": 5,
            "cursor": "fa5c3a28-4058-4506-bdfe-31a22ed8e1e4",
            "status": "Completed",
            "processDate": "2020-03-01T23:12:41.617Z"
            }
        }
        ],
        "total": 3
    }
