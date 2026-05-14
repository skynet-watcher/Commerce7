# Client Settings

**Source:** [https://developer.commerce7.com/docs/client-settings](https://developer.commerce7.com/docs/client-settings)

**Section:** resources

---
When clients install your app, you may need them to provide additional information. For example, if you integrate with another software you may need their account ID or password. Through the Client Settings section, you can add the fields that you need to collect and specify if they're required or not before the client is able to install your app.
If you're looking for how to collect data from the client's Commerce7 account, go to [Configure your App Version](../app-platform/configure-your-app-version.md).
![2000](https://files.readme.io/d77ad8f-createApp-version-clientSettings-1.jpg)
  1. In your app version, click on **Step 2. Client Settings**
  2. Click **Add Field**
  3. Enter a **Title**. This will be the label of the field.
  4. Enter a **Code**. This will be used to reference the field and cannot be edited after the field has been added.
  5. Select the **Data Type**.  
Options include: String, TextArea, Integer, Number, HTML, True / False, Yes / No, Radio, Checkbox, Select, Date Picker.
  6. Click the toggle to make the field **Required**
  7. Click **Add Field**
  8. If you have multiple fields, you can drag and drop to re-arrange the order that they're displayed to the client.
  9. When a client installs your app from the App Store, they will be prompted with a modal for them to enter all of the data that you've specified. In this example, the client setting fields are:


  * Mode
  * Customer Number
  * Sync WineShipping Inventory with Web Shipping Inventory
  * Email Notifications on Inventory Sync

![2000](https://files.readme.io/e726b93-createApp-version-clientSettings-2.jpg)
  10. Once they confirm, Commerce7 will POST this information to the **Install URL** set under your version's Installation tab, so make sure that one is added.


In addition, you'll receive information on who installed the app; tenant ID, first name, last name and email address.
![2000](https://files.readme.io/9a0cf43-createApp-version-installation.jpg)
