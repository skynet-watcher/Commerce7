# User Authentication

**Source:** [https://developer.commerce7.com/docs/authenticate-app](https://developer.commerce7.com/docs/authenticate-app)

**Section:** app platform

---
> 📘
> If you're making any API requests to your app from the Commerce7 interface or from a frontend website, we need to check and ensure that the request is coming from a valid/active user.
> This is only needed if your app is using an [App Extension](app-extensions.md). Learn more about standard authentication for API requests [here](../api/commerce7-apis.md).
### 
1\. Request from Commerce7
If your app makes a request from its extension inside Commerce7, Commerce7 will pass a JWT Token as an account variable in the URL. (If your app displays on a frontend website as opposed to inside of the Commerce7 Admin, you'll receive an "appToken" in place of the "account" parameter.)
**Example request**  
`https://yourapp-url/app?tenantId=some-tenant&customerId=20218381-2b91-4a73-a38cbc5dc546f4c5&**account**=**ayJ0eXAiOiJKV1QiLBJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxNjlmOGYwZi02MTQxLTQzOTQtOWU5OC0wNzU4NWRiNmFhNTciLCJmaXJzdE5hbWUiOiJBbmRyZXciLCJsYXN0TmFtZSI6IkthbTBodWlzIiwiaWF0IjoxATg3MjY2NDY1NDU2LCJlbWFpbDI6ImFuZHJld0Bjb21tZXJjZTcuY29tIn0.1aaUcb1DGHw5t5jSRsue9neoExnqX2_RBg2dpeqLY2o**`
### 
2\. Retrieve account detail
  * Take that account token (or appToken if using Frontend) and send it back to us by making a GET request.  
**`GET`** `https://api.commerce7.com/v1/account/user`
  * In the header pass the `tenant` (just like a normal call) and then pass an `Authorization` header with the account token.


JSON
    
    GET /account/user
    --header 'Authorization: ayJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyBzdWIiOiJkMWU5YjY3Ni0yNzA2LTRlMzYtYmNmNS01N2E5MjQ4ZWRjZGYiLCJmaXJzdE5hbWUiOiJKYXNvbiIsImxhc3QOYW1lIjoiQW5kcmVzIiwiaWF0IjoxNTg4NzkxMzk4MDQ2LCJlbWFpbMI6Imphc29uQGNvbW1lcmNlNy4jb20ifQ.dpEYVql3bWp4uIrwfsFIeNx6Wlrtmr3Y3Hn32HCoD1c' \
    --header 'tenant: some-tenant'
### 
3\. Response
This will respond with more information on the user including their accountId, firstname, lastname, email, and account role.
**Example response - Authorized access**
JSON
    
    {
        "id": "12211212-2706-4e36-bcf5-57a9248edcdf",
        "firstName": "Jason",
        "lastName": "Andres",
        "email": "[[email protected]](/cdn-cgi/l/email-protection)",
        "role": "Admin Owner"  	
    }
If this user doesn't have an account or doesn't have access to that tenant it will respond with a 401 response, and your application should then respond with a 401 and a friendly message with a link to your application support docs.
**Example response - Unathorized access**
JSON
    
    {
        "statusCode": 401,
        "type": "unauthorized",
        "message": "Unauthorized user",
        "errors": []
    }
