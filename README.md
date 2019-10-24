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

### Configure database and configure database
If you don't already have a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, you'll need to [create one](https://www.mongodb.com/cloud/atlas/register) – the M0 free tier is enough to get started, but an M30 (or higher) cluster is needed if you want to use [Atlas full-text search](https://docs.atlas.mongodb.com/full-text-search/) for the product search.

To setup the collection indexes and sample product catalog (13K+ products):

1. Add your IP address to your [Atlas whitelist](https://docs.atlas.mongodb.com/security-whitelist/)
2. [Create Atlas database user](https://docs.atlas.mongodb.com/security-add-mongodb-users/)
3. Download the [`dump`](https://github.com/am-MongoDB/eCommerce-Realm/tree/master/dump/ecommerce) folder
4. Restore the data:
```
mongorestore --uri="mongodb+srv://your-username:your-password@your-cluster-name.mongodb.net/ecommerce" dump/
```
5. (If running on M30+) enable full-text-search using the configuration from [fts.json](https://github.com/am-MongoDB/eCommerce-Realm/blob/master/fts.json)

### Create the Stitch app
