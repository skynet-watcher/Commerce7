# App Pricing and Fees

**Source:** [https://developer.commerce7.com/docs/pricing](https://developer.commerce7.com/docs/pricing)

**Section:** app store

---
Charge for your app by setting a price in your app's version.
For pricing you have 2 options; you can either use "Flat monthly price" or "Custom pricing". When using "Flat monthly price", Commerce7 handles all of the client billing for apps, retains a 20% fee, and pays the balance out to the partner once a month. Learn more about how payouts work [here](getting-paid.md). If you choose to use "Custom pricing", you handle all of the billing and no price is directly displayed to customers in the App Store. For apps that are billed externally, Commerce7 charges a monthly fee for each app installation for developers that have 25 or more total app installs. The fee is variable based on client plan type, and is $5 for Basic, $10 for Pro, $15 for Experience, and $20 for Enterprise customers.
  1. To set up your pricing, select your app and click into the version
  2. Click **Step 4. Installation**
  3. For Commerce7 to bill on your behalf, under **Pricing Model** select **Flat monthly price**
     1. Enter prices below:
        1. Enter a price for each plan level and currency. Clients will pay the price for their country/currency.
        2. Entering a price of "$0.00" will list it as free in the App Store.
        3. Make sure that you are happy with this amount as you won't be able to edit it once the app is published without releasing a new version. Clients will pay the price that they agreed to when they installed the app. If you release a new version with a new price, existing clients won't receive any updates or price changes until they upgrade their app to the latest version. They will see a prompt that an update is available.
     2. Select a **Payout Currency**. Commerce7 converts all client payment to your preferred currency.
  4. To bill customers yourselves, under **Pricing Model** select **Custom pricing**
