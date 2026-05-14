# App Extensions

**Source:** [https://developer.commerce7.com/docs/app-extensions](https://developer.commerce7.com/docs/app-extensions)

**Section:** app platform

---
Extensions are what allow your app to display inside the Commerce7 interface. The extension type that you should choose will depend on the app that you're offering and what it does. Play around with the different extension types and think about where it's most relevant for your app to appear. Extensions area added in your app version.
**App extensions are available for full applications only. If you 're building an integration only app, you won't see this area.**
  1. Choose the area + extension type you want to use
  2. Set up the extension in your app
  3. Authenticate the user
  4. Style your app


* * *
# 
Extension types
Extensions can appear as pages, within a page as an action or block, on the frontend website (online store) or as reports. The extensions available will depend on the area that you're wanting to add it to.
  * **Page**: Standalone page in admin, POS, or reservations.  
Location options: Marketing Menu, Store Menu, Report Menu, POS Menu, Reservations Menu, Frontend Profile
  * **Context Menu**: Adds an item to the "More Actions" menu. On click, the item can perform an action, link, or open a modal. (On the POS, this will add an action to the cart actions)  
Location options: Order List, Order Detail, Cart Detail, Product List, Product Detail, Corporate Order Detail, POS Cart Summary
  * **Tab Menu**: Adds a tab to an existing page.  
Location options: Order Detail, Product Detail
  * **Report**: Adds a report to one of Commerce7's existing report categories.  
Location options: Order Report, Finance Report, Customer Report, Club Report, Inventory Report
  * **iFrame**: Displays as a block within a page.  
Location options: Frontend Receipt Primary, Frontend Receipt Secondary, Frontend Dashboard Primary, Frontend Dashboard Secondary.
  * **Card** : Adds a stat card to an existing page.  
Location options: Order Detail


## 
Summary by application
Looking to add an extension to a specific application? Here you can find a list of your options based on the application. See above to learn more about each type. Note that some extensions will appear in multiple applications by default if the same data is accessible. ie. Since orders are accessible in both Admin and POS, if you were to add a "Context Menu" extension for "Order Detail", it'll appear in both automatically.
**Admin**
  * Page: Marketing Menu, Store Menu, Report Menu
  * Context Menu: Order List, Order Detail, Cart Detail, Product List, Product Detail, Corporate Order Detail
  * Tab Menu: Order Detail, Product Detail
  * Report: Order Report, Finance Report, Customer Report, Club Report, Inventory Report
  * Card: Order Detail


**POS**
  * Page: POS Menu
  * Context Menu: Order List, Order Detail, Cart Detail, Corporate Order Detail, POS Cart Summary
  * Tab Menu: Product Detail
  * Report: Order Report
  * Card: Order Detail


**Reservation**
  * Page: Reservations Menu


**Frontend V2 (online store)**
  * Page: Frontend Profile
  * iFrame: Frontend Receipt Primary, Frontend Receipt Secondary, Frontend Dashboard Primary, Frontend Dashboard Secondary


* * *
# 
Adding an extension
Extensions are added in your app version. Feel free to play around with the settings to determine the type of extension that will work best.
  1. In your app version, under **Step 3. Extensions** , click **Add Extension**
  2. Select a **Location** for your extension
  3. Based on the location and type of extension that you're adding, the following fields to complete will be slightly different. Once you've selected a location, a **Display Type** will appear. There could be one or multiple display types. Based on the Display Type that appears, follow that set of instructions below.

![](https://files.readme.io/26be429-app-version-extensions.jpg)
* * *
## 
Page
  1. To add a Page, after clicking **Add Extension** , for **Location** , select one of the following: Marketing Menu, Store Menu, Report Menu, POS Menu, Reservations Menu, Frontend Profile.
  2. Upload an **Icon**
  3. Enter a **Title**
  4. Add in a **Page iFrame URL** and optionally set a **iFrame Height**. A scroll will display if the height exceeds this.
  5. Click **Add Extension**
  6. On your page, you'll need to include the following Commerce7 javascript. It will allow the iFrame and the Commerce7 platform to communicate sizes properly.  
`<script type="text/javascript" src="https://dev-center.platform.commerce7.com/v2/commerce7.js"></script>`
  7. Now that the extension is setup, there's one more step to ensure that the user accessing the iFrame inside of Commerce7 is authenticated. View instructions [here](authenticate-app.md).


**Example**
![](https://files.readme.io/4213ca7-appExtensions-page.png)
* * *
## 
Context Menu
  1. To add a Context Menu, after clicking **Add Extension** , for **Location** , select one of the following: Order List, Order Detail, Cart Detail, POS Cart Summary, Product List, Product Detail, Corporate Order Detail.
  2. If you have an option to select a **Display Type** , select **Context Menu**
  3. Select a **Format** of **Action** , **Link** , or **Modal**


  * Action: Will perform an action on click
  * Link: Will link to another URL on click
  * Modal: Have your page display in a modal on click.


  4. Upload the **Icon** that will display on the menu item
  5. Add a **Label** indicating what the item does
  6. Enter a **URL**
  7. If you selected **Action** :


  * Actions send a GET and require a specific JSON response.
  * Use the following format for the JSON response:  
`{id: 'anything unique', type: '', message: ''}`  
"Type" ENUMs: `error`, `info`, `success`


  8. If you selected **Modal** :


  * This should be an iFrame URL for the page that will display in the modal.
  * Include the following Commerce7 javascript on your page to allow the iFrame and Commerce7 to communicate size properly.  
`<script type="text/javascript" src="https://dev-center.platform.commerce7.com/v2/commerce7.js"></script>`


  9. Click **Add Extension**
  10. Now that the extension is setup, there's one more step to ensure that the user performing the action inside of Commerce7 is authenticated. View instructions [here](authenticate-app.md).


**Example - Admin**
This extension type will be added to the bottom of the "Actions" dropdown. As an example, this is how the Product List Context Menu appears.
![](https://files.readme.io/480ad12e75ed88181e55cc1c08d54496ee53be6d53b17f520aa9b1acf7a8ce81-product-context.png)
**Example - POS**
This extension type is added to the POS Cart actions at the top right of the page.
![](https://files.readme.io/2d3e7228b14dd086f030a9b8e259f9d46900e68a3850468e20f66ff59b990d77-context-pos.png)
* * *
## 
Tab Menu
  1. To add a Tab Menu, after clicking **Add Extension** , for **Location** , select one of the following: Order Detail, Product Detail.
  2. Select a **Display Type** of **Tab Menu**
  3. Add a **Label**
  4. Add in an **iFrame URL** to your app page that should display as the tab content.
  5. Click **Add Extension**
  6. On your page, you'll need to include the following Commerce7 javascript. It will allow the iFrame and the Commerce7 platform to communicate sizes properly.  
`<script type="text/javascript" src="https://dev-center.platform.commerce7.com/v2/commerce7.js"></script>`
  7. Now that the extension is setup, there's one more step to ensure that the user accessing the iFrame inside of Commerce7 is authenticated. View instructions [here](authenticate-app.md).


**Example**
![](https://files.readme.io/e7c5968-appExtensions-tab.png)
* * *
## 
Report
  1. To add a Report, after clicking **Add Extension** , for **Location** , select one of the following: Order Report, Finance Report, Customer Report, Club Report, Inventory Report.
  2. Upload an **Icon**. This will display in the linked card for the report.
  3. Enter a **Title**. Please make this descriptive for the type of the data.
  4. Add in a **Page iFrame URL** and optionally set a **iFrame Height**. A scrollbar will display if the height exceeds this.
  5. Click **Add Extension**
  6. On your page, you'll need to include the following Commerce7 javascript. It will allow the iFrame and the Commerce7 platform to communicate sizes properly.  
`<script type="text/javascript" src="https://dev-center.platform.commerce7.com/v2/commerce7.js"></script>`
  7. Now that the extension is setup, there's one more step to ensure that the user accessing the iFrame inside of Commerce7 is authenticated. View instructions [here](authenticate-app.md).


**Example**
![](https://files.readme.io/8f7107c-appExtensions-report.png)
* * *
## 
iFrame
**Note:** Currently only is available for Frontend V2. Receipt iFrames appear on the order confirmation page. Dashboard iFrames appear on the customer's account dashboard.
  1. To add an iFrame, after clicking **Add Extension** , for **Location** , select one of the following: Frontend Receipt Primary, Frontend Receipt Secondary, Frontend Dashboard Primary, Frontend Dashboard Secondary.
  2. Enter a **Title**. Please make this descriptive for the type of the data.
  3. Add in a **Page iFrame URL** and optionally set a **iFrame Height**. A scrollbar will display if the height exceeds this.
  4. Click **Add Extension**
  5. On your page, you'll need to include the following Commerce7 javascript. It will allow the iFrame and the Commerce7 platform to communicate sizes properly.  
`<script type="text/javascript" src="https://dev-center.platform.commerce7.com/v2/commerce7.js"></script>`


* * *
## 
Card
**Note:** This extension type is not available for all developers. Please email [[email protected]](/cdn-cgi/l/email-protection#62111712120d101622010d0f0f07100107554c010d0f) to request access. If approved, further instructions will be sent on how to format the JSON file.
  1. To add a Cart, after clicking **Add Extension** , for **Location** , select the following: Order Detail.
  2. Enter the **URL of JSON**
  3. Click **Add Extension**


* * *
# 
Authenticating the user
When your app displays in Commerce7 (either in Admin or on a client's Frontend website), you need to authenticate each user to make sure that they have the right permissions to access the permissions to view the page or perform the action.
View the full instructions and what information is passed [here](authenticate-app.md).
* * *
# 
Styling your app
To make your app cohesive with the rest of the Commerce7 we recommend using our [Admin UI library](https://admin-ui-docs.commerce7.com/?path=/story/c7-admin-ui-v1-10-31--page) of components.
You can also include the following CSS to add some basic styling to your iFrame / Page.  
`https://dev-center.platform.commerce7.com/beta/commerce7.css`
* * *
# 
FAQs
  1. **Can I upload a different icon for light vs dark mode?**  
Currently, you can only upload a single icon that will be used for both.
