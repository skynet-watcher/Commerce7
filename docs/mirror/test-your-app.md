# Test Your App

**Source:** https://developer.commerce7.com/docs/test-your-app

---

In your app version, under "Test Your App", you can grant access to any account on Commerce7 to use and test your app before it is live.
**Note:** If you're working with specific clients, by using this tool you can grant them access to your app without ever publishing it on the app store. You _will_ need to publish your app if you want it to appear on the app store for installable by any Commerce7 clients and/or automatically charge a monthly fee.
![](https://files.readme.io/dde0bd0-createApp-version-testing.jpg)
* * *
  1. Before you can add the tenantID, you must have a user account on the client's tenant. So the first step is to ask the client (or other tenant) to add you with a role of "Partner" to their tenant.
  2. In [Commerce7](https://admin.platform.commerce7.com/) (not the App Development Center), find your account's **tenantID** from the URL. The first part of the URL is what we need (see screenshot below).
  3. Go back to the App Development Center and in your app version, enter the tenantID text and click **Add**. This will allow only this specific account to view your app in the app store and install it.
  4. To install, the client can then open Commerce7 Admin. Go to the App Store under [Apps & Extensions](https://admin.platform.commerce7.com/app) and they'll be able to see your unpublished app.
  5. They should select your app and click **Install**. To install the app on a client's tenant, they must have Admin Owner access.

![](https://files.readme.io/e66a236-createApp-version-testing-2.jpg)
As you test and make updates to your app, they will take effect for the account. This allows you to make sure that everything is working as intended and update your app in real-time.
> ❗️
> **Please note** : Although this is called "Test your App", any changes made to the account with your app installed, will be take effect just as if it were a published app. We recommending testing with your sandbox account and if you wish to give clients access before your app is published, you can do so after the initial test is complete.
