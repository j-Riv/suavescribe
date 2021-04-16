# Suavescribe

Embedded Shopify Subscription app made with Node, [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/) , [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components).

Under Development

## Environmental Variables
/app/.env

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

## Setup

Install Docker.

Create Data `/data` directory for persistent data.

Create database.env

```bash
POSTGRES_USER=THE_USERNAME
POSTGRES_PASSWORD=THE_PASSWORD
POSTGRES_DB=THE_DATABASE_NAME
```

```bash
docker-compose up -d
```

Connect to Postgres Container & Create Tables

```sql
# using psql
psql -h localhost -U <username> -d postgres
# Or Create a new Bash Session inside the container
docker container exec -it postgres /bin/bash
psql postgres -U <username>
# Now connected to DB
# Create Active Shops Table
CREATE TABLE active_shops (id varchar NOT NULL PRIMARY KEY, scope varchar NOT NULL, access_token varchar NOT NULL);
# Create Sessions Table
CREATE TABLE sessions (id varchar NOT NULL PRIMARY KEY, session json NOT NULL);
# Create Contracts Table
CREATE TABLE subscription_contracts (id varchar NOT NULL PRIMARY KEY, shop varchar NOT NULL, status varchar NOT NULL, next_billing_date date NOT NULL, interval varchar NOT NULL, interval_count integer NOT NULL, contract json NOT NULL);
```

Build App Image
```bash
docker build --tag jriv/suavescribe:latest .
```

Run
```bash
docker-compose up -d
```

## Logs
Logs can be found at /app/logs
