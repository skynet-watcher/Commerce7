# Coupons

**Source:** https://developer.commerce7.com/docs/coupons

---

[Coupons](https://documentation.commerce7.com/creating-coupons-in-commere7) are discount applied through a coupon code. Customers or orders must match any criteria to apply.
* * *
# 
Coupon object
JSON
    
    {
     "id": "84b0c0de-afce-4a93-bad0-8dcb2adc0849",
     "code": "50Off",
     "title": "50% Off",
     "actionMessage": null,
     "usageLimitType": "Unlimited",
     "usageLimit": null,
     "appliesTo": "Store",
     "appliesToObjectIds": null,
     "productDiscountType": "Percentage Off",
     "productDiscount": 50,
     "shippingDiscountType": "No Discount",
     "shippingDiscount": null,
     "startDate": "2018-05-18T04:10:38.835Z",
     "endDate": null,
     "status": "Enabled",
     "minimumCartAmount": null,
     "availableTo": "Everyone",
     "availableToObjectIds": null,
     "createdAt": "2018-05-18T16:53:46.157Z",
     "updatedAt": "2018-05-18T16:53:46.157Z",
     "promotionSets": []
    }
* * *
# 
Create coupon
**`POST`** `/coupon`
**Request**
JSON
    
    {
     "title": "$10.00 Off",
     "actionMessage": "$10.00 off orders $50 and over until May 31st",
     "usageLimitType": "Unlimited",
     "appliesTo": "Store",
     "productDiscountType": "Dollar Off",
     "productDiscount": 1000,
     "shippingDiscountType": "No Discount",
     "status": "Enabled",
     "minimumCartAmount": 5000,
     "availableTo": "Everyone",
     "code": "10off",
     "startDate": "2018-05-22T07:00:00.000Z",
     "endDate": "2018-06-01T06:59:00.000Z"
    }
**Response**  
`coupon` object
* * *
# 
Retrieve coupon
**`GET`** `/coupon/{:id}`
**Response**  
`coupon` object
* * *
# 
Update coupon
**`PUT`** `/coupon/{:id}`
**Request**
JSON
    
    {
     "title": "$10.00 Off",
     "actionMessage": "$10.00 off orders $50 and over until May 31st",
     "usageLimitType": "Unlimited",
     "usageLimit": null,
     "appliesTo": "Store",
     "appliesToObjectIds": null,
     "productDiscountType": "Dollar Off",
     "productDiscount": 1000,
     "shippingDiscountType": "No Discount",
     "shippingDiscount": null,
     "status": "Enabled",
     "minimumCartAmount": 5000,
     "availableTo": "Everyone",
     "availableToObjectIds": null,
     "promotionSets": [],
     "code": "10offmay",
     "startDate": "2018-05-22T07:00:00.000Z",
     "endDate": "2018-06-01T06:59:00.000Z"
    }
**Response**  
`coupon` object
* * *
# 
Delete coupon
**`DELETE`** `/coupon/{:id}`
**Response**  
Blank object and 204 status
* * *
# 
List coupons
**`GET`** `/coupon`
**Optional query parameters**
Param| Description  
---|---  
`q=n`| Ex. `/coupon?q=summer`  
**Response**  
An array of `coupon` objects and total count
JSON
    
    {
     "coupons": [{
      "id": "d9e4d110-8c65-4f80-848a-538a4d8dbfd7",
      "code": "10offmay",
      "title": "$10.00 Off",
      "actionMessage": "$10.00 off orders $50 and over until May 31st",
      "usageLimitType": "Unlimited",
      "usageLimit": null,
      "appliesTo": "Store",
      "appliesToObjectIds": null,
      "productDiscountType": "Dollar Off",
      "productDiscount": 1000,
      "shippingDiscountType": "No Discount",
      "shippingDiscount": null,
      "startDate": "2018-05-22T07:00:00.000Z",
      "endDate": "2018-06-01T06:59:00.000Z",
      "status": "Enabled",
      "minimumCartAmount": 5000,
      "availableTo": "Everyone",
      "availableToObjectIds": null,
      "createdAt": "2018-05-22T15:56:29.192Z",
      "updatedAt": "2018-05-22T15:57:39.672Z",
      "promotionSets": []
     }, {
      "id": "84b0c0de-afce-4a93-bad0-8dcb2adc0849",
      "code": "50Off",
      "title": "50% Off",
      "actionMessage": null,
      "usageLimitType": "Unlimited",
      "usageLimit": null,
      "appliesTo": "Store",
      "appliesToObjectIds": null,
      "productDiscountType": "Percentage Off",
      "productDiscount": 50,
      "shippingDiscountType": "No Discount",
      "shippingDiscount": null,
      "startDate": "2018-05-18T04:10:38.835Z",
      "endDate": null,
      "status": "Enabled",
      "minimumCartAmount": null,
      "availableTo": "Everyone",
      "availableToObjectIds": null,
      "createdAt": "2018-05-18T16:53:46.157Z",
      "updatedAt": "2018-05-18T16:53:46.157Z",
      "promotionSets": []
     }],
     "total": 2
    }
