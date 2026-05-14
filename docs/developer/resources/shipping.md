# Shipping

**Source:** [https://developer.commerce7.com/docs/shipping](https://developer.commerce7.com/docs/shipping)

**Section:** resources

---
[Shipping](https://documentation.commerce7.com/setting-up-shipping-in-commerce7) defines the zones that clients ship to, the types of delivery methods offered for each, and the rates that are charged to the customer on a shipping order made online, in Admin, or on the POS.
* * *
# 
Shipping object
JSON
    
    {
        "id": "decc66da-3bb9-4471-955e-80d61dd1f72a",
        "title": "Western USA",
        "createdAt": "2018-05-18T16:53:46.606Z",
        "updatedAt": "2018-05-18T16:53:46.606Z",
        "regions": [{
            "id": "0308f826-34a4-4a66-9568-97a29cdaa6cd",
            "countryCode": "US",
            "stateCode": "AZ"
            }, {
            "id": "25f6fde6-4164-4a5d-85c2-6c13cbb3eae3",
            "countryCode": "US",
            "stateCode": "NV"
            }, {
            "id": "34222b90-bb4c-4e36-9826-62f60e1dfe0a",
            "countryCode": "US",
            "stateCode": "NM"
            }, {
            "id": "73da4ff0-f634-4d2c-a31e-ca085dca13b5",
            "countryCode": "US",
            "stateCode": "CA"
            }, {
            "id": "96b1f677-fc7a-4be1-8e12-9421f46c0b38",
            "countryCode": "US",
            "stateCode": "CO"
            }, {
            "id": "eef0aca4-1749-4b9e-925c-ee1d617d1a03",
            "countryCode": "US",
            "stateCode": "WY"
            }, {
            "id": "03bc27b6-13d4-406f-94cf-d78cfdefa714",
            "countryCode": "US",
            "stateCode": "MT"
            }, {
            "id": "306f70a0-6ebb-4318-85d7-f038a8032ae1",
            "countryCode": "US",
            "stateCode": "ID"
            }, {
            "id": "3e037969-ecee-4645-ad8c-95e5ae1d4a96",
            "countryCode": "US",
            "stateCode": "WA"
            }, {
            "id": "7cb81f92-8fa0-4c91-87ca-18e93603ceb8",
            "countryCode": "US",
            "stateCode": "UT"
            }, {
            "id": "d29496bd-76cf-480a-8516-70b460973e0c",
            "countryCode": "US",
            "stateCode": "OR"
            }],
        "services": [{
            "id": "e1c20ffe-bb4e-4aa4-a415-246b140d3e0a",
            "title": "Ground",
            "code": "FEX",
            "isActive": true,
            "isDefault": true,
            "sortOrder": 1,
            "rates": [{
                "id": "5eed158b-cb3d-4b3e-bb48-13bf213508da",
                "toWeight": 5000,
                "price": 10,
                "weightUnits": "Lbs"
            }],
            "topRate": {
                "id": "3beddb2f-8238-4644-98bd-1a878d2e99f8",
                "isWrapShipping": true,
                "forEveryXWeight": null,
                "weightUnits": null,
                "price": null
            }
        }]
    }
* * *
# 
Create shipping
**`POST`** `/shipping`
**Request**
JSON
    
    {
     "title": "Eastern USA",
     "regions": [{
      "countryCode": "US",
      "stateCode": "NY"
     }],
     "services": [{
      "title": "Ground",
      "code": "FEX",
      "carrier": "FedEx",
      "isActive": true,
      "isDefault": true,
      "sortOrder": 1,
      "rates": [{
       "toWeight": 10,
       "price": 10,
      }, {
       "toWeight": 20,
       "price": 20,
      }],
      "topRate": {
       "isWrapShipping": false,
       "forEveryXWeight": 10,
       "price": 10
      }
     }, {
      "title": "Airport",
      "code": "FEX",
      "carrier": "FedEx",
      "isActive": true,
      "isDefault": false,
      "sortOrder": 2,
      "rates": [{
       "toWeight": 10,
       "price": 10,
      }, {
       "toWeight": 20,
       "price": 20,
      }],
      "topRate": {
       "isWrapShipping": true
      }
     }]
    }
**Response**  
`shipping` object
* * *
# 
Retrieve shipping
**`GET`** `/shipping/{:id}`
**Response**  
`shipping` object
* * *
# 
Update shipping
**`PUT`** `/shipping/{:id}`
**Request**
JSON
    
    {
     "title": "Eastern USA",
     "regions": [{
      "countryCode": "US",
      "stateCode": "NY"
     }],
     "services": [{
      "title": "Ground",
      "code": "FEX",
      "isActive": true,
      "isDefault": true,
      "sortOrder": 1,
      "rates": [{
       "toWeight": 10,
       "price": 10,
       "weightUnits": "Lbs"
      }, {
       "toWeight": 20,
       "price": 20,
       "weightUnits": "Lbs"
      }],
      "topRate": {
       "isWrapShipping": false,
       "forEveryXWeight": 10,
       "weightUnits": "Lbs",
       "price": 10
      }
     }, {
      "title": "Airport",
      "code": "FEX",
      "isActive": true,
      "isDefault": false,
      "sortOrder": 2,
      "rates": [{
       "toWeight": 10,
       "price": 10,
       "weightUnits": "Lbs"
      }, {
       "toWeight": 20,
       "price": 20,
       "weightUnits": "Lbs"
      }],
      "topRate": {
       "isWrapShipping": true
      }
     }]
    }
**Response**  
`shipping` object
* * *
# 
Delete shipping
**`DELETE`** `/shipping/{:id}`
**Response**  
`shipping` object and 204 status
* * *
# 
List shipping
**`GET`** `/shipping`
**Response**  
An array of `shipping` objects and total count
JSON
    
    {
        "shippings": [{
            "id": "0915b356-eb85-44e2-a8e6-6c9a0b9e9898",
            "title": "Canada",
            "createdAt": "2018-05-18T16:53:46.615Z",
            "updatedAt": "2018-05-18T16:53:46.615Z",
            "regions": [{
                "id": "acc2d24d-f726-4c3e-b3cd-25044ddfb842",
                "countryCode": "CA",
                "stateCode": "NL"
                }, {
                "id": "39569d67-3b07-4ada-81b5-34562845832f",
                "countryCode": "CA",
                "stateCode": "NB"
                }, {
                "id": "b4c3976f-d21c-458b-9c9a-a040f7bb687a",
                "countryCode": "CA",
                "stateCode": "AB"
                }, {
                "id": "3d267f8c-8ba6-43d0-9c5e-f8e1368b7b2a",
                "countryCode": "CA",
                "stateCode": "BC"
            }],
            "services": [{
                "id": "b626d68b-a8ec-4a15-ac81-945124eb48b1",
                "title": "Ground",
                "code": "FEX",
                "isActive": true,
                "isDefault": true,
                "sortOrder": 1,
                "rates": [{
                    "id": "eec07768-8643-4304-bd2a-8e1fdc66a36d",
                    "toWeight": 10,
                    "price": 15,
                    "weightUnits": "Lbs"
                    }, {
                    "id": "92459748-7796-451a-9d2d-32c3c27cb35a",
                    "toWeight": 20,
                    "price": 30,
                    "weightUnits": "Lbs"
                    }],
                "topRate": {
                    "id": "74cb9a43-6956-4d3f-aec0-66f9fab33e4e",
                    "isWrapShipping": false,
                    "forEveryXWeight": 10,
                    "weightUnits": "Lbs",
                    "price": null
                }
                }, {
                "id": "12775cee-6657-4867-b7c1-7519e9081b91",
                "title": "Air",
                "code": "FEX",
                "isActive": true,
                "isDefault": false,
                "sortOrder": 2,
                "rates": [{
                    "id": "411754be-0f31-4fdb-995b-d8f4daa17442",
                    "toWeight": 10,
                    "price": 20,
                    "weightUnits": "Lbs"
                }, {
                    "id": "eba3d761-583d-464a-8bfb-c89be09ef63b",
                    "toWeight": 20,
                    "price": 40,
                    "weightUnits": "Lbs"
                }],
                "topRate": {
                    "id": "1ecababa-d746-47be-a878-c7c9c340ad44",
                    "isWrapShipping": true,
                    "forEveryXWeight": null,
                    "weightUnits": null,
                    "price": null
                }
            }]
        }, {
            "id": "99ae2ce8-2290-46e2-bc7c-39da81df1c1c",
            "title": "Mid/South/East USA",
            "createdAt": "2018-05-18T16:53:46.614Z",
            "updatedAt": "2018-05-18T16:53:46.614Z",
            "regions": [{
                "id": "85a07ef3-5a85-4287-9175-920cc9efb2a5",
                "countryCode": "US",
                "stateCode": "NJ"
                }, {
                "id": "e4261316-bab0-4c5c-963c-480f383c6ca3",
                "countryCode": "US",
                "stateCode": "MO"
                }, {
                "id": "5fd78417-162f-402e-b6b4-6897b9f8d112",
                "countryCode": "US",
                "stateCode": "VT"
                }, {
                "id": "ff52387c-c233-4e46-8767-b6bfc7570552",
                "countryCode": "US",
                "stateCode": "AK"
                }, {
                "id": "8074d3cc-65ca-40c9-af7d-1050684d1852",
                "countryCode": "US",
                "stateCode": "ME"
                }, {
                "id": "d665454c-65a0-4a17-ba99-096a5bfb3d99",
                "countryCode": "US",
                "stateCode": "MI"
                }, {
                "id": "59b5a066-5bf1-4a9c-a16e-47a6498d91f1",
                "countryCode": "US",
                "stateCode": "TX"
                }, {
                "id": "493df772-b623-4191-a90b-7edf3ab1df41",
                "countryCode": "US",
                "stateCode": "OK"
                }, {
                "id": "88f1a5ea-c303-4c2c-95e3-24747c5486d2",
                "countryCode": "US",
                "stateCode": "FL"
            }],
            "services": [{
                "id": "88325067-da7b-4fe9-86be-55c11821b274",
                "title": "Ground",
                "code": "FEX",
                "isActive": true,
                "isDefault": true,
                "sortOrder": 1,
                "rates": [{
                    "id": "ed51ae51-7e40-4d0d-9ea8-fa059061bd6b",
                    "toWeight": 10,
                    "price": 10,
                    "weightUnits": "Lbs"
                }, {
                    "id": "ff31cf73-f66c-4f11-a06c-73c79ffae133",
                    "toWeight": 20,
                    "price": 20,
                    "weightUnits": "Lbs"
                }],
                "topRate": {
                    "id": "846b0644-6eed-4373-bcee-6ae94df3359a",
                    "isWrapShipping": false,
                    "forEveryXWeight": 10,
                    "weightUnits": "Lbs",
                    "price": null
                }
                }, {
                "id": "3c519111-6fcd-4065-b70a-eec654206d77",
                "title": "Air",
                "code": "FEX",
                "isActive": true,
                "isDefault": false,
                "sortOrder": 2,
                "rates": [{
                    "id": "9fe3c836-d1f9-4d16-9489-e3129a11c98d",
                    "toWeight": 10,
                    "price": 20,
                    "weightUnits": "Lbs"
                    }, {
                    "id": "6985d741-e471-4581-8b95-531962471c32",
                    "toWeight": 20,
                    "price": 40,
                    "weightUnits": "Lbs"
                }],
                "topRate": {
                    "id": "35c1ea68-e7c7-46c9-8805-6c284e563705",
                    "isWrapShipping": true,
                    "forEveryXWeight": null,
                    "weightUnits": null,
                    "price": null
                }
            }]
        }, {
            "id": "fc2d8812-8868-4027-a383-7a7a57985ac8",
            "title": "International",
            "createdAt": "2018-05-18T16:53:46.616Z",
            "updatedAt": "2018-05-18T16:53:46.616Z",
            "regions": [{
                "id": "9ce85b81-c8b0-45c9-b00b-aa1ee8063dd6",
                "countryCode": "JP",
                "stateCode": null
                }, {
                "id": "abd2edb1-3f7f-4f90-a0e6-b064de6f3067",
                "countryCode": "CH",
                "stateCode": null
                }],
                "services": [{
                "id": "44da227a-8f53-4d5a-987a-9d0d38e486ae",
                "title": "Ground",
                "code": "FEX",
                "isActive": true,
                "isDefault": true,
                "sortOrder": 1,
                "rates": [{
                    "id": "d441169f-9450-4c12-a4f3-f27a5b111562",
                    "toWeight": 10,
                    "price": 25,
                    "weightUnits": "Lbs"
                    }, {
                    "id": "e122850a-de35-4c66-a27c-fb06c9ff5962",
                    "toWeight": 20,
                    "price": 50,
                    "weightUnits": "Lbs"
                }],
                "topRate": {
                    "id": "db8a3964-0acf-40ff-83f3-aa87e2f81f2d",
                    "isWrapShipping": false,
                    "forEveryXWeight": 10,
                    "weightUnits": "Lbs",
                    "price": null
                }
                }, {
                "id": "c04cf08a-d5f0-41d5-b884-71a894769d89",
                "title": "Air",
                "code": "FEX",
                "isActive": true,
                "isDefault": false,
                "sortOrder": 2,
                "rates": [{
                    "id": "483c5bb4-a1de-4d8b-bdc9-7368522ffc00",
                    "toWeight": 5000,
                    "price": 100,
                    "weightUnits": "Lbs"
                }],
                "topRate": {
                    "id": "41b504cf-6e3c-48b9-844b-3cc10eda1f64",
                    "isWrapShipping": true,
                    "forEveryXWeight": null,
                    "weightUnits": null,
                    "price": null
                }
            }]
        }, {
            "id": "decc66da-3bb9-4471-955e-80d61dd1f72a",
            "title": "Western USA",
            "createdAt": "2018-05-18T16:53:46.606Z",
            "updatedAt": "2018-05-18T16:53:46.606Z",
            "regions": [{
                "id": "25f6fde6-4164-4a5d-85c2-6c13cbb3eae3",
                "countryCode": "US",
                "stateCode": "NV"
                }, {
                "id": "d29496bd-76cf-480a-8516-70b460973e0c",
                "countryCode": "US",
                "stateCode": "OR"
                }, {
                "id": "3e037969-ecee-4645-ad8c-95e5ae1d4a96",
                "countryCode": "US",
                "stateCode": "WA"
                }, {
                "id": "03bc27b6-13d4-406f-94cf-d78cfdefa714",
                "countryCode": "US",
                "stateCode": "MT"
                }, {
                "id": "96b1f677-fc7a-4be1-8e12-9421f46c0b38",
                "countryCode": "US",
                "stateCode": "CO"
                }, {
                "id": "34222b90-bb4c-4e36-9826-62f60e1dfe0a",
                "countryCode": "US",
                "stateCode": "NM"
                }, {
                "id": "73da4ff0-f634-4d2c-a31e-ca085dca13b5",
                "countryCode": "US",
                "stateCode": "CA"
            }],
            "services": [{
                "id": "e1c20ffe-bb4e-4aa4-a415-246b140d3e0a",
                "title": "Ground",
                "code": "FEX",
                "isActive": true,
                "isDefault": true,
                "sortOrder": 1,
                "rates": [{
                    "id": "5eed158b-cb3d-4b3e-bb48-13bf213508da",
                    "toWeight": 5000,
                    "price": 10,
                    "weightUnits": "Lbs"
                }],
                "topRate": {
                    "id": "3beddb2f-8238-4644-98bd-1a878d2e99f8",
                    "isWrapShipping": true,
                    "forEveryXWeight": null,
                    "weightUnits": null,
                    "price": null
            }
            }]
        }],
        "total": 4
    }
