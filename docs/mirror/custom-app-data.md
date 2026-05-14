# App Data

**Source:** https://developer.commerce7.com/docs/custom-app-data

---

If you have additional information that you want to save, you can create and add data to an object that will only be available to your app. This can be used to extend Commerce7's data to make it more specific to your need. Custom app data is public, but is only writable by your app's ID.
* * *
# 
Adding app data to an object
To add app data to an object in Commerce7, when you create or update the object via Commerce7 APIs you can include the additional `appData` node.
**Available object types**  
`['Order', 'Cart', 'Customer', 'Customer Address', 'Club Membership', 'Product', 'Reservation']`
**Request**
JSON
    
    "appData": {
      "myLabel": "My Variable"
    }
**Response**  
Once data has been attached, the object will include the `appData` node and your `appId`.
JSON
    
    "appData": {
      "yourAppId": {
        "myLabel": "My Variable"
      }
    }
