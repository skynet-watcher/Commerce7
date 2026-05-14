# API Overview

**Source:** https://developer.commerce7.com/docs/commerce7-apis

---

Here's an overview of what you need to know when getting started with our REST APIs and making your first request. If you plan to develop an app, this is a good place to get a basic understanding of how it works before taking a look at the [app development guides](/docs/app-development-center) .
  * Endpoint
  * Authentication
  * API Requests
  * Pagination
  * Data formatting
  * Put Requests
  * Rate limiting


* * *
# 
Endpoint
API| Base URL  
---|---  
REST| `https://api.commerce7.com/v1/{endpoint}`  
* * *
# 
Authentication
All API requests require authentication. You must be granted access in one of 2 ways: by a client installing your app, or by having an active user in their tenant/account.
  * **If you 're developing an app or integration:** When creating your app in the [App Development Center](https://dev-center.platform.commerce7.com), you'll select the API endpoints that you need access to. When the app is installed (either in a development or live state), you'll be granted access to that specific tenant account. [Learn more](/docs/app-apis-webhooks).
  * **If you 're migrating data for a single (onboarding) client:** They need to [send you an invite](https://documentation.commerce7.com/creating-staff-accounts) and set your account role to "Data". The username must be an email address and you will be able to configure the password from the invite email notification that you receive.


* * *
# 
API requests
Making a request looks a little different based on if you are working on an app or dealing with only a single client's data.
## 
App or integration
For every API request, you'll authenticate using Basic Auth with the username as your app's ID and the password your "App Secret Key".
> ❗️
> **Do not** place your **App Secret Key** in your javascript as this can be found by other users. Your key must be added through your backend files.
  1. Log into the [App Development Center](https://dev-center.platform.commerce7.com) and select the specific app. (If you don't have an app yet, you'll need to create one first. Learn more [here](/docs/creating-an-app).)
  2. The `appID` is the first part of the the URL. For example, the appID for `demo-app.dev-center.platform.commerce7.com` is`demo-app`.
  3. The App Secret Key was created when you initially added the app. If you've lost it or need to generate a new one, you can do so from the app dashboard. Under the list of Versions, click edit on the App Secret Key.
  4. Then you'll pass the `tenantID` for the client. This is the first part of the URL when you are logged in. For example, in `https://spectrawinery.admin.platform.commerce7.com`, the tenant ID is `spectrawinery`.
  5. The last step is dependant on your app, but if you choose to display your app inside of Commerce7, we also need to authenticate the person using it. You can set this up later as needed, but instructions can be found [here](/docs/authenticate-app).


Username| Password  
---|---  
demo-app|  _App Secret Key string_  
tenant|  _spectrawinery_  
## 
Single client (data migration)
> 🚧
> Please note that this is only intended for clients who are currently in onboarding mode. If the client is live, please use the alternate method above. (If you are already using this method, please note that this method will be blocked as of Jun 3 for clients live for 60+ days. Read more about how this will affect you [here](https://developer.commerce7.com/docs/announcements).
  1. Log into the [Commerce7 Admin](https://admin.platform.commerce7.com/) to obtain the tenant (you'll need an account).
  2. Pass in the `tenantID` for the specific client that you're working with. This is the first part of the URL when you are logged in. For example, in `https://spectrawinery.admin.platform.commerce7.com`, the tenant ID is `spectrawinery`.
  3. If your request sends JSON to the API endpoint, you must also send the `Content-Type` to `application/json`.


Header| Value  
---|---  
tenant|  _spectrawinery_  
Content-Type| application/json  
* * *
# 
Pagination
The response is an object with an array of the objects your listing and a total, which is the total record count.
## 
Standard
  * GET requests for lists have a limit of **50 records per page**.
  * After 100 pages, pagination is limited to 1 request per 60 seconds.


Param| Description  
---|---  
`?page=n`| Request next page  
`?limit=n`| Limit results per page (n is between 1 and 50)  
**Example**
Query
    
    Request:
    https://api.commerce7.com/v1/customer?page=1&limit=10
    
    Response:
    {
        "customers": [
            { .... customer objects .... }
        ],
        "total": 79318
    }
In this example, the total requests you need to make to retrieve all data: 79318 / 10 = 7932
## 
Cursor
Several endpoints allow you to use our new cursor based pagination. These endpoints have no rate limits.
  1. To utilize cursor pagination, start first request with `?cursor=start` instead of passing the parameter `?page=`.
  2. This will trigger the endpoint to return the same objects as you normally receive, but instead of the total number of objects being returned you will see the next cursor id to use in your next request.
  3. Continue making requests until you receive a request with no cursor id in the response, at this point you have received all the records.


### 
Available endpoints
  * `/v1/cart`
  * `/v1/club-membership`
  * `/v1/customer`
  * `/v1/customer-address`
  * `/v1/note`
  * `/v1/order`
  * `/v1/product`
  * `/v1/reservation`
  * `/v1/trash`


**Example**
Query
    
    Get Request:
    https://api.commerce7.com/v1/customer?cursor=start
    
    Response:
    {
        "customers": [
            { .... customer objects .... }
        ],
        "cursor": "584a97d0-3276-11ea-a64c-062a616166d8"
    }
Query
    
    Get Request:
    https://api.commerce7.com/v1/customer?cursor=584a97d0-3276-11ea-a64c-062a616166d8
    
    Response:
    {
        "customers": [
            { .... customer objects .... }
        ],
        "cursor": "97de82ee-3276-11ea-a64c-062a616166d8"
    }
* * *
# 
Data formatting
  * **Currency** amounts are stored in Commerce7 in cents. eg. If you pass in a request to update a product price to $100.00 the amount should be sent as 10000.
  * **Dates** are all stored in UTC time and most are in ISO datetime format. If the system you are integrating works in a timezone other than UTC you will need to convert the time for your requests and responses to UTC time.


* * *
# 
Put Requests
  * When making a put request, to any endpoint, the root object elements can be selectively updated by passing in just the elements you want to update. Any sub objects included do not take partial updates, you must pass in all elements, any elements not passed in will be overwritten with a null value.
  * Updating a product price for example, you would need to include the entire variant sub object including the variant id element, any elements not passed in will be overwritten with null values.


* * *
# 
Rate limiting
API rate limits are 100 requests per minute, per tenant (client account).
  * Page style pagination is limited to 100 pages maximum at the standard rate limit. Greater than 100 pages is rate limited to 1 page per 60 seconds. Page style pagination should only be used for endpoints with mostly static data that will never have more than 10 pages of data OR for apps with a UI that needs to list data with page numbers (up to 10 pages).
  * Integrations retrieving data for core data objects, like customers, orders, and club memberships should use cursor based pagination, which has no rate limits and much better response times.
