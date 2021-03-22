# Suavescribe

Embedded Shopify Subscription app made with Node, [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/) , [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components).

Under Development

## Environmental Variables

```javascript
SHOPIFY_API_KEY = 'YOUR_SHOPIFY_API_KEY';
SHOPIFY_API_SECRET = 'YOUR_SHOPIFY_SECRET';
SHOP = 'my-shop-name.myshopify.com';
SCOPES = 'SHOPIFY_API_SCOPES';
HOST = 'YOUR_TUNNEL_URL';
PG_DB = 'DATABASE_NAME';
PG_HOST = 'DATABASE_HOST';
PG_USER = 'DATABASE_USER';
PG_PASSWORD = 'DATABASE_PASSWORD';
PG_PORT = 'DATABASE_PORT';
```

## Database Setup

Create a new user with limited permissions.

```bash
psql postgres
# Create Role with psql
CREATE ROLE username with LOGIN PASSWORD 'my password';
# Add permissons to new user
ALTER ROLE username CREATEDB;
# Check permissions
\du
# Change Default postgres account password
\password postgres
```

Create a new database.

```bash
psql postgres -U username
# Create DB
CREATE DATABASE databasename;
# List Databases and Select
\l
\c databasename;
# Now connected to DB
# Create Active Shops Table
CREATE TABLE active_shops (id varchar NOT NULL PRIMARYKEY, scope varchar NOT NULL, access_token varchar NOT NULL);
# Create Sessions Table
CREATE TABLE sessions (id varchar NOT NULL PRIMARY KEY, session json NOT NULL);
```
