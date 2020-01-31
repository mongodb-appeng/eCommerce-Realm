# MongoDB eCommerce reference app – backend

This is an example of how to build an eCommerce app using MongoDB Atlas and MongoDB Stitch/Realm. This repo contains the code and data for the backend part of the application; the [am-MongoDB-eCommerce](https://github.com/am-MongoDB/eCommerce) contains the reference frontend web app.

[Try out the app](https://ecommerce-iukkg.mongodbstitch.com/#/) before recreating it for yourself.

## Stack

This application backend doesn't require an application or web server.

The database is MongoDB Atlas, a fully managed cloud database.

Access to Atlas and other services is through MongoDB Stitch/Realm – the serverless platform from MongoDB.

The application frontend uses these technologies:

- Vue.js
- Bulmer
- Buefy
- SaaS

The frontend code can be hosted on Stich/Realm static hosting.

## Application setup

This backend application stores data in MongoDB Atlas and uses MongoDB Stitch as a serverless platform for all of the backend functionality.

### Configure database and load sample data
If you don't already have a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, you'll need to [create one](https://www.mongodb.com/cloud/atlas/register) – while the code runs on a free M0 cluster an M10 or higher is needed to import the product data set, an M30 (or higher) cluster is needed if you want to use [Atlas full-text search](https://docs.atlas.mongodb.com/full-text-search/) for the product search.

To setup the collection indexes and sample product catalog (13K+ products):

1. Add your IP address to your [Atlas whitelist](https://docs.atlas.mongodb.com/security-whitelist/)
2. [Create Atlas database user](https://docs.atlas.mongodb.com/security-add-mongodb-users/)
3. Download the [`dump`](https://github.com/am-MongoDB/eCommerce/tree/master/dump) folder
4. Restore the data:
```
mongorestore --uri="mongodb+srv://your-username:your-password@your-cluster-name.mongodb.net/ecommerce" dump/
```
5. (If running on M30+) enable full-text-search using the configuration from [fts.json](https://github.com/am-MongoDB/eCommerce-Realm/blob/master/fts.json)

### Create the Stitch app
1. Download this repo
```
git clone https://github.com/am-MongoDB/eCommerce-Realm.git
```
2. Use the [Stitch CLI](https://docs.mongodb.com/stitch/deploy/stitch-cli-reference/) to install the Stitch app – **the first attempt will fail**:

```
cd eCommerce-Realm-master
stitch-cli import --strategy=replace
```
3. Add Stitch secrets (you get these from your other cloud service providers):
```
stitch-cli secrets add --name=AWS_private_key --value="my-secret-key"
stitch-cli secrets add --name=stripeSecretKey --value="my-secret-key"
stitch-cli secrets add --name=TwilioAuthToken --value="my-secret-key"
stitch-cli secrets add --name=AWS-personal-private-key --value="my-secret-key"

stitch-cli import --strategy=replace
```
4. Configure the Stitch App (through the Stitch UI)
- Link Stitch app to your Atlas cluster.  In the Atlas UI, select `clusters` from the left-side, then click on `mongodb-atlas` and then select your Atlas cluster from the dropdown and save.
- Set your own values for each of the `values` (and `secrets` if you didn't use the real values when importing the app) through the Stitch UI.

5. Add frontend app to Stitch static hosting 
Build the [frontend app](https://github.com/am-MongoDB/eCommerce) and drag the files onto the `Hosting` panel in the Stitch UI.
6. Copy the link from the Hosting panel and browse to that page
