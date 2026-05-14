# API Versioning

**Source:** https://developer.commerce7.com/docs/api-versioning

---

Commerce7 considers additive changes as non-breaking. Apps and integrations should be built to accept new attributes in responses and then decide when to consume the new values as needed.
If for whatever reason, Commerce7 needs to introduce a breaking change, we will work with developers to ensure a smooth transition takes place. Breaking changes such as renaming, deleting or changing validation for existing attributes will be handled by one of two methods:
## 
1\. Minor changes
If a change to a small number of endpoints or attributes is needed, Commerce7 will notify via email any API Data role users of the breaking changes and provide a reasonable amount of time based on the scope of the changes to either have the updates completed or a confirmation that the integration for this API user will not be impacted.
_An example of a minor change we are making is updating our order object refundId, this will change from a string with a single refundId to an array of refund objects. This small change is required to allow multiple refunds on an order to reference all refund orders._
## 
2\. Major changes
If multiple endpoints are changing at the same time, or a critical endpoint has significant changes to the object structure Commerce7 will re-version the APIs and maintain both versions running for 90/180/365 days depending on the scope of the changes and the number of API users impacted.
_An example of versioning our APIs was the move from /beta to /v1. Beta APIs were in operation for over a year before moving to V1, and we have maintained both versions for 180 days with the /beta going offline on Dec 31st 2019._
