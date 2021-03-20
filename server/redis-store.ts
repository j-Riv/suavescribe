/* redis-store.ts */

// Import the Session type from the library, along with the Node redis package, and `promisify` from Node
import { Session } from '@shopify/shopify-api/dist/auth/session';
import redis from 'redis';
import { promisify } from 'util';

class RedisStore {
  private client: redis.RedisClient;
  private getAsync;
  private setAsync;
  private delAsync;

  constructor() {
    // Create a new redis client
    this.client = redis.createClient();
    // Use Node's `promisify` to have redis return a promise from the client methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /*
    The storeCallback takes in the Session, and sets a stringified version of it on the redis store
    This callback is used for BOTH saving new Sessions and updating existing Sessions.
    If the session can be stored, return true
    Otherwise, return false
  */
  storeCallback = async (session: Session) => {
    // console.log('STORING SESSION', JSON.stringify(session));
    try {
      // Inside our try, we use the `setAsync` method to save our session.
      // This method returns a boolean (true is successful, false if not)
      return await this.setAsync(session.id, JSON.stringify(session));
    } catch (err) {
      // throw errors, and handle them gracefully in your application
      throw new Error(err);
    }
  };

  /*
    The loadCallback takes in the id, and uses the getAsync method to access the session data
     If a stored session exists, it's parsed and returned
     Otherwise, return undefined
  */
  loadCallback = async (id: string) => {
    // console.log('LOADING SESSION', JSON.stringify(id));
    try {
      // Inside our try, we use `getAsync` to access the method by id
      // If we receive data back, we parse and return it
      // If not, we return `undefined`
      let reply = await this.getAsync(id);
      if (reply) {
        const json = JSON.parse(reply);
        const newSession = new Session(json.id);
        const keys = Object.keys(json);
        keys.forEach(key => {
          newSession[key] = json[key];
        });
        newSession.expires = new Date(json.expires);
        return newSession;
      } else {
        return undefined;
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  /*
    The deleteCallback takes in the id, and uses the redis `del` method to delete it from the store
    If the session can be deleted, return true
    Otherwise, return false
  */
  deleteCallback = async (id: string) => {
    // console.log('DELETING', id);
    try {
      // Inside our try, we use the `delAsync` method to delete our session.
      // This method returns a boolean (true is successful, false if not)
      return await this.delAsync(id);
    } catch (err) {
      throw new Error(err);
    }
  };
}

// Export the class
export default RedisStore;
