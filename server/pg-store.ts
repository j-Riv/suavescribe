import { Session } from '@shopify/shopify-api/dist/auth/session';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { toUpper } from 'lodash';
dotenv.config();

class PgStore {
  private client: Client;

  constructor() {
    // Create a new pg client
    this.client = new Client({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: Number(process.env.PG_PORT) || 5432,
    });
    this.client.connect();
  }

  /* 
    This loads all Active Shops
  */
  loadActiveShops = async () => {
    console.log('LOADING ACTIVE SHOPS');
    const query = `
      SELECT * FROM active_shops;  
    `;
    try {
      const reply = await this.client.query(query);
      const shops = {};
      reply.rows.forEach(row => {
        shops[row.id] = {
          shop: row.id,
          scope: row.scope,
          accessToken: row.access_token,
        };
      });
      return shops;
    } catch (err) {
      throw new Error(err);
    }
  };

  /* 
    This takes in the Store Name and loads the stored Token and Scopes from the database.
  */
  loadCurrentShop = async (name: string) => {
    console.log('LOADING ACTIVE SHOP', name);
    const query = `
      SELECT * FROM active_shops WHERE id = '${name}';  
    `;
    try {
      const res = await this.client.query(query);
      return res.rows[0];
    } catch (err) {
      throw new Error(err);
    }
  };

  /*
   This removes a store from Active Shops.
  */
  deleteActiveShop = async (name: string) => {
    console.log('DELETING ACTIVE SHOP', name);
    const query = `
      DELETE FROM active_shops WHERE id = '${name}';
    `;
    try {
      const res = await this.client.query(query);
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  /*
    This stores a new Shop to the database.
  */
  storeActiveShop = async (data: {
    shop: string;
    scope: string;
    accessToken: string;
  }) => {
    console.log('STORING ACTIVE SHOP', JSON.stringify(data));
    const { shop, scope, accessToken } = data;
    const query = `
      INSERT INTO active_shops (id, scope, access_token) VALUES ('${shop}', '${scope}', '${accessToken}') RETURNING *;
    `;
    const updateQuery = `
      UPDATE active_shops SET access_token = '${accessToken}' WHERE id = '${shop} RETURNING *';
    `;
    try {
      const exists = await this.client.query(
        `SELECT * FROM active_shops WHERE id = '${shop}';`
      );

      if (exists.rowCount > 0) {
        const res = await this.client.query(updateQuery);
        if (res.rows[0]) {
          return res.rows[0];
        } else {
          return false;
        }
      } else {
        const res = await this.client.query(query);
        if (res.rows[0]) {
          return res.rows[0];
        } else {
          return false;
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  /*
    The storeCallback takes in the Session, and saves a stringified version of it.
    This callback is used for BOTH saving new Sessions and updating existing Sessions.
    If the session can be stored, return true
    Otherwise, return false
  */
  storeCallback = async (session: Session) => {
    console.log('STORING SESSION', JSON.stringify(session));
    const query = `
      INSERT INTO sessions (id, session) VALUES ('${
        session.id
      }', '${JSON.stringify(session)}' ) RETURNING *
    `;
    const updateQuery = `
      UPDATE sessions SET session = '${JSON.stringify(session)}' WHERE id = '${
      session.id
    }' RETURNING *;
    `;
    try {
      const exists = await this.client.query(
        `SELECT * FROM sessions WHERE id = '${session.id}';`
      );

      console.log('EXISTS', exists);

      if (exists.rowCount > 0) {
        console.log('UPDATING ===>', session.id);
        const res = await this.client.query(updateQuery);
        console.log('UPDATED', JSON.stringify(res), 4);
        if (res.rows[0]) {
          return res.rows[0];
        } else {
          return false;
        }
      } else {
        console.log('CREATING ===>', session.id);
        const res = await this.client.query(query);
        console.log('CREATED', JSON.stringify(res), 4);
        if (res.rows[0]) {
          return res.rows[0];
        } else {
          return false;
        }
      }
    } catch (err) {
      // throw errors, and handle them gracefully in your application
      throw new Error(err);
    }
  };

  /*
    The loadCallback takes in the id, and accesses the session data
     If a stored session exists, it's parsed and returned
     Otherwise, return undefined
  */
  loadCallback = async (id: string) => {
    console.log('LOADING SESSION', JSON.stringify(id));
    const query = `
      SELECT * FROM sessions WHERE id = '${id}';
    `;
    try {
      const res = await this.client.query(query);
      console.log('REPLY ======>', JSON.stringify(res.rows[0].session));
      if (res.rows[0].session) {
        const json = res.rows[0].session;
        console.log(JSON.stringify(json), 4);
        const newSession = new Session(json.id);
        const keys = Object.keys(json);
        keys.forEach(key => {
          newSession[key] = json[key];
        });
        newSession.expires = json.expires ? new Date(json.expires) : new Date();
        return newSession;
      } else {
        return undefined;
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  /*
    The deleteCallback takes in the id, and deletes it from the database
    If the session can be deleted, return true
    Otherwise, return false
  */
  deleteCallback = async (id: string) => {
    console.log('DELETING', id);
    const query = `
      DELETE FROM sessions WHERE id = '${id}';
    `;
    try {
      const res = await this.client.query(query);
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new Error(err);
    }
  };
}

export default PgStore;
