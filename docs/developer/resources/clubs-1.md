# Clubs

**Source:** [https://developer.commerce7.com/docs/clubs-1](https://developer.commerce7.com/docs/clubs-1)

**Section:** resources

---
[Clubs](https://documentation.commerce7.com/clubs) are essentially a product/subscription that customers sign up for to become a member and receive orders on a recurring basis. Club memberships below to a club.
  * Club object & ENUMs
  * Create club
  * Retrieve club
  * Update club
  * Delete club
  * List clubs


* * *
# 
Club object
Object
    
    {
      "id": "17324e27-5db7-43ae-8aff-d46ac74f5dd6",
      "title": "Red Case Club",
      "type": "Traditional",
      "content": null,
      "publishDate": "2019-12-15T20:56:00.000Z",
      "slug": "red-case-club",
      "createdAt": "2019-12-15T20:56:23.614Z",
      "updatedAt": "2019-12-15T20:56:23.614Z",
      "seo": {
        "title": "Red Case Club",
        "description": null
      }
    }
## 
ENUMs
Field| Value  
---|---  
`type`| 
  * `Traditional`
  * `Subscription`

  
`webStatus`| 
  * `Available`
  * `Not Available`

  
`adminStatus`| 
  * `Available`
  * `Not Available`

  
* * *
# 
Create club
**`POST`** `/club`
**Request**
JSON
    
    {
      "title": "Red Case Club",
      "slug": "red-case-club",
      "type": "Traditional",
      "seo": {
      	"title": "Red Case Club"
      },
      "webStatus": "Available",
      "adminStatus": "Available"
    }
**Response**  
`club` object
* * *
# 
Retrieve club
**`GET`** : `/club/{:id}`
**Response**  
`club` object
* * *
# 
Update club
**`PUT`** `/club/{:id}`
**Request**  
Include only the fields that you wish to update. Example below demonstrates an update to birthDate.
JSON
    
    {
      "title": "Red Case Club",
      "content": "<p>Content here</p>",
      "slug": "red-case-club",
      "publishDate": "2019-12-15T20:56:00.000Z",
      "seo": {
    		"title": "Red Case Club",
    		"description": "Content here"
       }
    }
**Response**  
`club` object
* * *
# 
Delete club
**`DELETE`** `/club/{:id}`
**Response**  
Blank object with 204 status
* * *
# 
List clubs
**`GET`** `/club`
**Optional query parameters**
Param| Description  
---|---  
`?q=n`| Club name  
Ex. `/club?q=red`  
**Response**  
Array of `club` objects and total count
Response
    
    {
        "clubs": [
        {
            "id": "2b27f3cd-3984-47a0-98c1-24d22c15e225",
            "title": "Mixed Club",
            "type": "Traditional",
            "content": "<p>Mixed wine club.</p>",
            "publishDate": "2018-05-22T16:21:00.000Z",
            "slug": "mixed-club",
            "createdAt": "2018-05-22T16:21:34.940Z",
            "updatedAt": "2018-05-22T16:23:56.381Z",
            "seo": {
                "title": "Mixed Club",
                "description": "Mixed wine club."
            }
            },
            {
            "id": "17324e27-5db7-43ae-8aff-d46ac74f5dd6",
            "title": "Red Case Club",
            "type": "Traditional",
            "content": "<p>Content here</p>",
            "publishDate": "2019-12-15T20:56:00.000Z",
            "slug": "red-case-club",
            "createdAt": "2019-12-15T20:56:23.614Z",
            "updatedAt": "2019-12-15T21:02:14.331Z",
            "seo": {
                "title": "Red Case Club",
                "description": "Content here"
            }
            },
            {
            "id": "138cc09d-62d7-4298-8bfc-fd2fc3fddc79",
            "title": "Red Club",
            "type": "Traditional",
            "content": null,
            "publishDate": "2018-05-18T17:00:00.000Z",
            "slug": "red-club",
            "createdAt": "2018-05-18T17:00:38.114Z",
            "updatedAt": "2018-05-18T17:00:38.114Z",
            "seo": {
                "title": "Red Club",
                "description": null
            }
            },
            {
            "id": "194cc50a-e324-4f21-8e52-98500a4b751c",
            "title": "White Club",
            "type": "Traditional",
            "content": null,
            "publishDate": "2018-05-18T17:00:00.000Z",
            "slug": "white-club",
            "createdAt": "2018-05-18T17:00:45.726Z",
            "updatedAt": "2018-05-18T17:00:45.726Z",
            "seo": {
                "title": "White Club",
                "description": null
            }
        }
        ],
        "total": 4
    }
