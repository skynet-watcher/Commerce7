# Create an App

**Source:** [https://developer.commerce7.com/docs/creating-an-app](https://developer.commerce7.com/docs/creating-an-app)

**Section:** getting started

---
1. Getting started is pretty simple, log into the [App Development Center](https://dev-center.platform.commerce7.com/) or you can log in to [Commerce7](https://admin.platform.commerce7.com/) and go to Developers > App Dev Center. (Don't have an account yet? Learn more [here](commerce7-developer-docs.md).)
  2. On the Dashboard, click **Add App**
  3. Enter a **Title** for your app. This is how it'll display in the app store. Make sure it's descriptive, but it shouldn't be more than a couple of words. It will also need to be unique.
  4. Select if you want to add a **Full Application** or an **Integration** or a **Private App or Integration** based on if it displays or has a function within Commerce7. You won't be able to edit this later.
     1. **Full Application:** Users will be able to interact with the app inside Commerce7, and that app will be listed on the [App Store](https://commerce7.com/partners/apps/). Whether that's through an added action on a page, or a page added to the main menu.
     2. **Integration:** Users cannot see or interact with the app inside Commerce7, but the integration will be listed in the App Store, and it will give you access to all APIs and webhooks. The app works behind the scenes once it's been installed.
     3. **Private App** or Integration: Once the app is published, it will not be available to the public on the App Store. You can enter in the tenant ID to one or more clients to grant them access to see and install the app.
  5. Create an **App Secret Key**. Create a unique key for your app and save it for later. You won't be able to view it in plain text again. You'll use this for authenticating any API endpoints you use.
  6. Lastly, enter your **Company Name** and the **Contact Email** that will Commerce7 will use for notifications about your app. This will not be client facing.

  

* * *
# 
App dashboard
Here is where you'll manage your app and app versions.
  * **Version** : Contains most of the settings for your app (see more below). You can have multiple app versions for a single app. After your app is created, you'll see a blank "Version 1" created automatically.
  * **Listing** : Details to market your app in the App Store such description and images


From here, you'll also submit your app for approval, whether it's the first time or you're just submitting a change after it's live. You'll see this option once the app version is configured and the listing is created.
* * *
# 
What are app versions?
App settings are managed through "Versions". They contain the configuration details of your app. This is where you'll manage the majority of your app including API endpoints needed, webhook events, and more. After your app is launched, versions are also how you can make changes and release updates for your app. You'll simply create a new version (ie. "Version 2"), make your changes and then it can be updated on the App Store.
* * *
# 
Next steps
Here's a quick rundown of what some of the next steps for building your app can look like.
  * Reference the API docs that you need
  * Configure your app's [APIs & Webhooks](../app-platform/app-apis-webhooks.md) for everything you will need permission to access or listen to in a client's account
  * Display your app in Commerce7 through [App Extensions](../app-platform/app-extensions.md) and build and style pages quickly using our [UI Component Library](../app-platform/ui-component-library.md)
  * Verify requests taking place through your app with [Authenticate App Requests](../app-platform/authenticate-app.md)
  * Add fields for clients to complete on installation through [Client Settings](../resources/client-settings.md)


**Think you 're ready to publish?** [Read here](../app-store/pricing.md) for the final steps
