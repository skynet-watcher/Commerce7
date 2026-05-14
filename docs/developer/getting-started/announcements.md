# Announcements

**Source:** [https://developer.commerce7.com/docs/announcements](https://developer.commerce7.com/docs/announcements)

**Section:** getting started

---
# 
2024
### 
Aug 29 - Depreciation of API access through Admin Owner accounts
As of Oct 1, 2024, Admin Owner roles will no longer have direct access to data from the APIs using their personal credentials. APls can still be accessed, but a couple of extra steps will be required.
**What does this mean?**
If you're currently making individual API calls using an Admin Owner account role, you'll need to create a private app through our App Development Center. It should take no longer than 15 minutes to create a private Commerce7 app, select the API permissions you require, and use the App ID and Secret Key for authentication in place of your account credentials.
We understand this update may seem like an inconvenience, but it's essential for increasing security across the platform. This change ensures your data remains protected without limiting access to it. Your data security is our priority, and this adjustment helps achieve that goal.
**Steps to take**
  1. **Create an app** through the [Commerce7 App Development Center](https://dev-center.platform.commerce7.com/)
  2. **Select the type of app** : If you don't want your app or integration to be public, select a type of "Private". This will allow you select which Commerce7 account(s) can see and install it through the App Store without making it public for all.
  3. **Update your authentication** : instead of using Basic Auth with a username/email and password, keep using Basic Auth, but with the "App ID" as the username and the "App Secret Key" as the password. You'll still pass the tenant ID in the header like you were doing previously. [Learn more](https://developer.commerce7.com/docs/commerce7-apis#api-requests)
  4. **Select API endpoints required** : In your app version, select which API endpoints you need access to. When the client installs the app, it will grant you this access. [Learn more](../app-platform/app-apis-webhooks.md)
  5. **Submit your app** : Once your app is ready, submit it to the Commerce7 team. You'll be required to add some content for the App Store such as a title, image, and description, but if your app is private, you can put whatever you want here as it will only be viewed by you. Commerce7 will approve the app and it'll be available for private install through the App Store under "Apps & Extensions".
  6. Clients should now install your app and if your Admin Owner role (under Settings > Accounts) was purely used to access the APIs, it can now be removed. Installing the app will grant you the API permissions needed, but in a much more secure way.


### 
Jan 28 - Cart payload structure for guest checkout
We've added a new object to the cart for guest orders. Instead of the email being stored as `cart.email`, it's now stored as `cart.guest.email`.
The change was added to accomodate reservations capturing a first name, last name, and phone.
# 
2023
### 
Dec 12 - Planned discontinuation of the "Data" account role for live clients
As of **June 3, 2024** , we will no longer be allowing the use of the "Data" role for clients that have been live for 60+ days. If you are using the role for data migration purposes, this will give you the opportunity to make adjustments for a brief period of time after launch. If you are currently using the role for your integration, we ask that you create an app before June 3, 2024 to replace it so that your integration will continue to work. After the 60 days, API access through this role will be denied.
**Why are we making changes?**  
The account "Data" role is intended to be used for migrating data for new clients, but we see many developers using it to gain access to client data for integrations. The data role grants full privileges to all of the client's information which increases the security risk for both them and you.
We believe in least privilege access and want to ensure that clients are able to grant you only the access necessary without putting them or yourselves at risk.
**Steps to take**  
If you have an active integration with Commerce7 and are currently using the data role, here's what you need to do before the deadline:
  1. **Create an app** through the [Commerce7 App Development Center](https://dev-center.platform.commerce7.com/)
  2. **Select the type of app** :
     1. For public integrations, choose a type of "Integration". Once the app is published, it will be available on the Commerce7 App Store to install; also allowing you to increase your marketing exposure and grow your clients!
     2. If you don't want your app or integration to be public, select a type of "Private". This will allow you enter which clients can see and install it through the App Store without making it public for all.
  3. **Update your authentication** : Instead of using Basic Auth with a username/email and password, keep using Basic Auth, but with the "App ID" as the username and the "App Secret Key" as the password. You'll still pass the tenant ID in the header like you were doing previously. [Learn more](https://developer.commerce7.com/docs/commerce7-apis#api-requests)
  4. **Select API endpoints required** : In your app version, select which API endpoints you need access to. When the client installs the app, it will grant you this access. [Learn more](../app-platform/app-apis-webhooks.md)
  5. **Submit your app** : Once your app is ready, submit it to the Commerce7 team. You'll also need to add some content for the App Store. Once it's been approved, it will be published and available for clients to install.
  6. Clients should now install your app and remove your Data role access under Settings > Accounts. Installing the app will grant you the permissions needed to integrate, but in a much more secure way.


* * *
### 
Dec 7 - Updates to taxes for California Redemption Value fee
As of **January 1, 2024** , the California Beverage Container Recycling Program is introducing some changes for collection and remittance of a recycling fee for wine and spirits.
Commerce7 will be implementing changes for wineries to automatically collect the California Redemption Value (CRV) fee. Our system will calculate the fee as a tax and it will be output in the tax array for applicable orders. The calculation will be based on the number of bottles and the milliliters included in each order.
If you are currently using the Commerce7 API for taxes, we kindly request that you ensure you are pulling the tax array and/or accounting for the possibility of more than one tax value being returned.
The new setting will be released for wineries on Dec 13, 2023 and enabled automatically for wineries located in California on Jan 1, 2024. If you'd like early access to this feature, simply reply to this email with the name of your account, and we'll be happy to enable it for you.
[Read here](https://documentation.commerce7.com/california-redemption-value-fee) for more information about the changes happening in Commerce7.
