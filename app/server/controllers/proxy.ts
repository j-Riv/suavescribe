import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import mailgun from 'mailgun-js';
import {
  commitSubscriptionDraft,
  createClient,
  getCustomerSubscriptionContractsById,
  getSubscriptionContract,
  updateSubscriptionContract,
  updateSubscriptionDraft,
  updatePaymentMethod,
} from '../handlers';
import PgStore from '../pg-store';
dotenv.config();

const pgStorage = new PgStore();

const readFileThunk = (src: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(src, { encoding: 'utf8' }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

const verifyToken = (shop: string, customer_id: string, token: string) => {
  try {
    const decoded: any = jwt.verify(token, process.env.APP_PROXY_SECRET);
    console.log('DECODED', decoded);
    if (
      decoded &&
      decoded.customer_id === customer_id &&
      decoded.shop === shop
    ) {
      return true;
    }
  } catch (e) {
    console.log('ERROR VERIFYING TOKEN', e.message);
    return false;
  }
};

export const getCustomerSubscriptions = async (ctx: Context) => {
  const params = ctx.request.query;
  console.log('TYPE OF', typeof ctx.request.body);
  const body = ctx.request.body as {
    customerId: string;
    token: string;
  };
  const { token, customerId } = body;
  if (customerId) {
    try {
      const shop = params.shop as string;
      console.log(`SHOP: ${shop}, TOKEN: ${token}, CUSTOMER_ID: ${customerId}`);
      if (shop && token) {
        const verified = verifyToken(shop, customerId, token);
        console.log('VERIFIED', verified);
        if (verified) {
          const res = await pgStorage.loadCurrentShop(shop);
          if (res) {
            ctx.client = createClient(shop, res.accessToken);
            const subscriptions = await getCustomerSubscriptionContractsById(
              ctx,
              customerId
            );
            if (subscriptions.length > 0) {
              ctx.body = subscriptions;
            } else {
              ctx.body = { msg: 'No Subs Found' };
            }
          } else {
            return (ctx.status = 401);
          }
        } else {
          ctx.status = 403;
          ctx.redirect('/accounts');
        }
      }
    } catch (e) {
      console.log('ERROR', e.message);
      return (ctx.status = 403);
    }
  } else {
    ctx.body = `
      <a href="/apps/app_proxy/?customerId={{ customer.id}}">View Subscriptions</a>
    `;
  }
};

export const updateCustomerSubscription = async (ctx: Context) => {
  const params = ctx.request.query;
  console.log('TYPE OF', typeof ctx.request.body);
  const body = ctx.request.body as {
    token: string;
    customerId: string;
    shop: string;
    subscriptionContractId: string;
    status: string;
  };
  const { token, customerId, subscriptionContractId, status } = body;
  try {
    const shop = params.shop as string;
    if (shop && token) {
      const verified = verifyToken(shop, customerId, token);
      if (verified) {
        const res = await pgStorage.loadCurrentShop(shop);
        if (res) {
          const client = createClient(shop, res.accessToken);
          let draftId = await updateSubscriptionContract(
            client,
            subscriptionContractId
          );
          draftId = await updateSubscriptionDraft(client, draftId, {
            status: status,
          });
          const subscriptionId = await commitSubscriptionDraft(client, draftId);
          // send data
          ctx.body = { updatedSubscriptionContractId: subscriptionId };
        } else {
          return (ctx.status = 401);
        }
      }
    } else {
      ctx.status = 403;
      ctx.redirect('/accounts');
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

export const updateSubscriptionPaymentMethod = async (ctx: Context) => {
  const params = ctx.request.query;
  console.log('TYPE OF', typeof ctx.request.body);
  const body = ctx.request.body as {
    token: string;
    customerId: string;
    paymentMethodId: string;
  };
  const { token, customerId, paymentMethodId } = body;
  try {
    const shop = params.shop as string;
    if (shop && token) {
      const verified = verifyToken(shop, customerId, token);
      if (verified) {
        const res = await pgStorage.loadCurrentShop(shop);
        if (res) {
          const client = createClient(shop, res.accessToken);
          const customerId = await updatePaymentMethod(client, paymentMethodId);
          // send data
          ctx.body = { customerId: customerId };
        } else {
          return (ctx.status = 401);
        }
      } else {
        ctx.status = 403;
        ctx.redirect('/accounts');
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

export const updateSubscriptionShippingAddress = async (ctx: Context) => {
  const params = ctx.request.query;
  const body = ctx.request.body as {
    token: string;
    customerId: string;
    subscriptionContractId: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
  };
  const {
    token,
    customerId,
    subscriptionContractId,
    address1,
    address2,
    city,
    province,
    country,
    zip,
    firstName,
    lastName,
    company,
    phone,
  } = body;
  try {
    const shop = params.shop as string;
    if (shop && token) {
      const verified = verifyToken(shop, customerId, token);
      if (verified) {
        const res = await pgStorage.loadCurrentShop(shop);
        if (res) {
          const client = createClient(shop, res.accessToken);
          let draftId = await updateSubscriptionContract(
            client,
            subscriptionContractId
          );
          draftId = await updateSubscriptionDraft(client, draftId, {
            deliveryMethod: {
              shipping: {
                address: {
                  address1,
                  address2,
                  city,
                  province,
                  country,
                  zip,
                  firstName,
                  lastName,
                  company,
                  phone,
                },
              },
            },
          });
          if (typeof draftId !== 'string') {
            return (ctx.body = { errors: draftId });
          }
          const subscriptionId = await commitSubscriptionDraft(client, draftId);
          // send data
          ctx.body = { updatedSubscriptionContractId: subscriptionId };
        } else {
          return (ctx.status = 401);
        }
      } else {
        ctx.status = 403;
        ctx.redirect('/accounts');
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 401);
  }
};

const sendMailGun = async (email: string, link: string) => {
  console.log('SENDING EMAIL VIA MAILGUN');
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
  const data = {
    from: 'Suavecito Pomade <no-reply@suavescribe.suavecito.com>',
    to: `${email}, jriv@suavecito.com`,
    subject: 'Subscription Authorization Link',
    html: `
      <p>Hello,<br>Below is your secure login link:</p>
      <p>${link}</p>
      <p>This link will expire in 15 minutes. To generate a new link please visit: <a href="https://suavecito.com/account">suavecito.com/account</a> and select Manage Subscriptions.</p>
    `,
  };
  mg.messages().send(data, function (error, body) {
    if (error) console.error('ERROR', error);
    console.log('MAILGUN RESPONSE', body);
    return body.message;
  });
};

export const generateCustomerAuth = async (ctx: Context) => {
  // get customer id from body
  const params = ctx.request.query;
  console.log('TYPE OF', typeof ctx.request.body);
  const body = ctx.request.body as {
    customerId: string;
    customerEmail: string;
  };
  if (body.customerId && params.shop) {
    // generate auth token
    const shop = params.shop as string;
    const customer_id = body.customerId as string;
    const customer_email = body.customerEmail as string;
    const token = jwt.sign(
      {
        shop: shop,
        customer_id: customer_id,
      },
      process.env.APP_PROXY_SECRET,
      { expiresIn: '15m' }
    );
    const url = `https://${shop}/apps/app_proxy?shop=${shop}&customer_id=${customer_id}&token=${token}`;
    // generate email
    const emailResponse = await sendMailGun(customer_email, url);
    ctx.status = 200;
    ctx.body = { message: emailResponse };
  } else {
    console.log('NO SHOP OR CUSTOMER ID SUPPLIED');
    ctx.body = { error: 'No Shop or Customer ID Supplied' };
  }
};

const verificationFailure = `
  <div style="text-align:center;">
    <p>ERROR: Verification Failed</p>
    <p><a href="/account">Go Back to Account</a></p>
  </div>
`;

export const liquidApplicationProxy = async (ctx: Context) => {
  const params = ctx.request.query;
  if (params.token && params.shop && params.customer_id) {
    const token = params.token as string;
    const shop = params.shop as string;
    const customer_id = params.customer_id as string;
    const verified = verifyToken(shop, customer_id, token);
    ctx.set('Content-Type', 'application/liquid');
    if (verified) {
      const app = await readFileThunk(
        `${process.env.APP_PROXY}/build/index.html`
      );
      ctx.body = `
        {% if customer %}
          {% if customer.id == ${params.customer_id} %}
            <script>
            const currentCustomer = {{ customer.id }};
            console.log(currentCustomer);
            </script>
            ${app}
          {% else %}
          <div style="text-align: center;">
            <p>Something went wrong ...</p>
            <p><a href="/account">Go Back to Account</a></p>
          </div>
          {% endif %}
        {% else %}
        <p>Please Login!</p>
        {% endif %}
      `;
    } else {
      ctx.body = verificationFailure;
    }
  } else {
    console.log('ERROR', 'Missing Token, Shop or Customer Id.');
    ctx.body = verificationFailure;
  }
};

export const applicationProxy = async (ctx: Context) => {
  const params = ctx.request.query;
  if (params.token && params.shop && params.customer_id) {
    const token = params.token as string;
    const shop = params.shop as string;
    const customer_id = params.customer_id as string;
    const verified = verifyToken(shop, customer_id, token);
    if (verified) {
      ctx.set('Content-Type', 'text/html');
      ctx.body = fs.createReadStream(
        `${process.env.APP_PROXY}/build/index.html`
      );
    } else {
      ctx.set('Content-Type', 'application/liquid');
      ctx.body = verificationFailure;
    }
  } else {
    console.log('ERROR', 'Missing Token, Shop or Customer Id.');
    ctx.body = verificationFailure;
  }
};
