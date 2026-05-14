# App Sync

**Source:** [https://developer.commerce7.com/docs/app-sync](https://developer.commerce7.com/docs/app-sync)

**Section:** app platform

---
Keep your app in sync by ensuring that all data received via an API or webhook is received and processed successfully, and then push those details back into the original object in Commerce7.
There are two API endpoints to facilitate this:
  1. Check webhook logs
  2. App sync to push the status back to Commerce7


* * *
## 
1\. Webhook logs
If you utilize webhook logs to receive data, you want to ensure you don't miss any data. Best practice would be to use **GET** : `/web-hook-log` and check for any `isSuccess=false`. You can also include date ranges to only check since the last time you checked.
The list response is an array of web-hook-log objects, and each object contains the full payload of the original webhook call that failed. This allows you to process and consume any missing data with a single call to get the failed webhook sends.
**Webhook log object**
JSON
    
    {
    "id": "4317d7e7-9098-4aa9-b703-3dc714109cad",
    "url": "https://apigateway.commerce7.com/lambdas/coolwines-post-order",
    "object": "Order",
    "action": "Create",
    "payload": { ** Full Object **},
    "user": "[[email protected]](/cdn-cgi/l/email-protection)",
    "isSuccess": false,
    "error": {
     "data": {
      "message": "Missing Authentication Token"
     },
     "status": 403,
     "message": "Request failed with status code 403"
    },
    "createdAt": "2020-01-03T18:08:50.635Z",
    "updatedAt": "2020-01-03T18:08:50.635Z"
    }
**Parameters**
  * object: `['Allocation', 'Cart', 'Club', 'ClubPackage', 'ClubMembership', 'Collection', 'Coupon', 'Customer', 'CustomerAddress', 'CustomerCreditCard', 'Group', 'Product', 'Promotion', 'Order', 'TransactionEmail']`
  * action: `['Create', 'Update', 'Delete', 'Send']`
  * isSuccess: `boolean`
  * updatedAt: `['gte', 'gt', 'lte', 'lt', 'btw']`


JSON
    
    {
    "webHookLogs": [{
    "id": "4317d7e7-9098-4aa9-b703-3dc714109cad",
    "url": "https://apigateway.commerce7.com/lambdas/coolwines-post-order",
    "object": "Order",
    "action": "Create",
    "payload": { ** Full Object ** },
    "user": "[[email protected]](/cdn-cgi/l/email-protection)",
    "isSuccess": false,
    "error": {
     "data": {
      "message": "Missing Authentication Token"
     },
     "status": 403,
     "message": "Request failed with status code 403"
    },
    "createdAt": "2020-01-03T18:08:50.635Z",
    "updatedAt": "2020-01-03T18:08:50.635Z"
    },
    {
    "id": "d087e10c-c92b-4679-83d6-a76848b1c24d",
    "url": "https://webhook.site/699f413c-556f-49ae-919d-87536715ee75",
    "object": "Order",
    "action": "Update",
    "payload": { ** Full Object **},
    "user": null,
    "isSuccess": false,
    "error": {
     "data": {
      "error": {
       "id": null,
       "message": "Token not found"
      },
      "success": false
     },
     "status": 404,
     "message": "Request failed with status code 404"
    },
    "createdAt": "2019-10-17T23:17:43.723Z",
    "updatedAt": "2019-10-17T23:17:43.723Z"
    }
    ],
    "total": 2
    }
## 
2\. App sync
App sync is an API endpoint that allows you to push the status of the data in your app back to the object in Commerce7. You can post as many syncs as you want per object. App sync data is public but only writable by your appId. To create the app sync use **POST:** `/app-sync` and to list use **Get:** `/app-syncs/:objectId`.
**ENUMS**  
objectType:  
`['Order', 'Customer', 'Customer Address', 'Club Membership', 'Product', 'Reservation'] status: ['Error', 'Success']`
**Create app sync**
JSON
    
    {
    "objectType": "Order",
    "objectId": "",
    "status": "Error",
    "issues": ["Issue 1", "Issue 2"],
    "actions": [{
     "httpType": "Get",
     "url": "https://",
     "label": "Resolve"
    }]
    }
**List app sync**
JSON
    
    {
    "appSyncs": [{
    "id": "07e8d129-e6ff-4df8-bca4-c4c84a3ecef4",
    "appId": "acme-order-fulfillment",
    "objectType": "Order",
    "objectId": "9b6e6e43-d163-4cbe-8e66-8e0783332f8e",
    "status": "Error",
    "lastActivityDate": "2020-02-07T17:11:21.400Z",
    "createdAt": "2020-02-05T23:48:00.469Z",
    "updatedAt": "2020-02-07T17:11:21.408Z",
    "actions": [{
     "id": "a7193b6b-9678-4641-bbd3-622845af2ebe",
     "httpType": "Get",
     "url": "https://api.acmefulfillment.com/orders",
     "label": "Resolve"
    }],
    "attempts": [{
     "id": "8293ae6c-2428-44c5-98c2-de9a8a296d3d",
     "status": "Error",
     "activityDate": "2020-02-07T17:11:21.400Z",
     "issues": [{
      "id": "d8d2175a-ffc6-4a07-bfef-9eecc28fcf61",
      "appSyncAttemptId": "8294be6b-2428-44c5-98c2-de9a8a296d3d",
      "issue": "{\"error\":\"Weather Hold. Order could not be shipped.\"}"
     }]
    }, {
     "id": "c8401b46-9685-4fb9-b845-e2c5368edeb9",
     "status": "Error",
     "activityDate": "2020-02-08T02:04:57.564Z",
     "issues": [{
      "id": "609c35b1-c992-44f7-b31a-504b090fc5bd",
      "appSyncAttemptId": "c8401a46-9685-4fb9-b845-e2c5368edeb9",
      "issue": "{\"error\":\"Weather Hold. Order could not be shipped.\"}"
     }]
    }]
    }],
    "total": 1
    }
Want to learn more about how APIs & Webhooks work with apps, read more [here](app-apis-webhooks.md).
