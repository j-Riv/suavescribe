import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import nodemailer from 'nodemailer';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
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
  };
  const customerId = body.customerId as string;
  if (customerId) {
    try {
      const shop = params.shop as string;
      if (shop) {
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
    subscriptionContractId: string;
    status: string;
  };
  const subscriptionContractId = body.subscriptionContractId;
  const status = body.status;
  try {
    const shop = params.shop as string;
    if (shop) {
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
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

export const updateSubscriptionPaymentMethod = async (ctx: Context) => {
  const params = ctx.request.query;
  console.log('TYPE OF', typeof ctx.request.body);
  const body = ctx.request.body as {
    paymentMethodId: string;
  };
  const paymentMethodId = body.paymentMethodId as string;
  try {
    const shop = params.shop as string;
    if (shop) {
      const res = await pgStorage.loadCurrentShop(shop);
      if (res) {
        const client = createClient(shop, res.accessToken);
        const customerId = await updatePaymentMethod(client, paymentMethodId);
        // send data
        ctx.body = { customerId: customerId };
      } else {
        return (ctx.status = 401);
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

export const updateSubscriptionShippingAddress = async (ctx: Context) => {
  const params = ctx.request.query;
  console.log('TYPE OF', typeof ctx.request.body);
  const body = ctx.request.body as {
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
    if (shop) {
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
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 401);
  }
};

// const sendSmtpEmail = (email: string, url: string) => {
//   let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.APP_PROXY_EMAIL,
//       pass: process.env.APP_PROXY_EMAIL_PASS,
//     },
//   });
//   let mailOptions = {
//     from: process.env.APP_PROXY_EMAIL,
//     to: email,
//     subject: 'App Proxy Secure Login Link',
//     text: `This is your secure login: ${url} This link expires in 15 minutes.`,
//     html: `
//       <p>This is your secure login:</p>
//       <a href="${url}">Please click here!</a>
//       <p>This link expires in 15 minutes.</p>
//     `,
//   };
//   transporter.sendMail(mailOptions, (err, data) => {
//     if (err) {
//       console.log('ERROR SENDING MAIL', err.message);
//       return false;
//     }
//     console.log('EMAIL SENT!!!', data);
//     return true;
//   });
// };

const sendNsEmail = async (email: string, link: string) => {
  const accountID = process.env.APP_PROXY_NS_ACCT_ID;
  const token = {
    key: process.env.APP_PROXY_NS_ACCESS_TOKEN,
    secret: process.env.APP_PROXY_NS_TOKEN_SECRET,
  };
  const consumer = {
    key: process.env.APP_PROXY_NS_CONSUMER_KEY,
    secret: process.env.APP_PROXY_NS_CONSUMER_SECRET,
  };
  const requestData = {
    url: process.env.APP_PROXY_NS_EMAIL_URL,
    method: 'POST',
  };

  const oauth = new OAuth({
    consumer: consumer,
    signature_method: 'HMAC-SHA256',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha256', key)
        .update(base_string)
        .digest('base64');
    },
    realm: accountID,
  });
  const authorization = oauth.authorize(requestData, token);
  const header: any = oauth.toHeader(authorization);
  header.Authorization += ', realm="' + accountID + '"';
  header['content-type'] = 'application/json';
  header['user-agent'] = 'Suavescribe/1.0 (Language=JavaScript/ES6)';
  try {
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: header,
      body: JSON.stringify({
        email,
        link,
      }),
    });
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
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
    // const emailResponse = sendSmtpEmail(customer_email, url);
    // ctx.body = { msg: emailResponse };
    const emailResponse = await sendNsEmail(customer_email, url);
    ctx.body = emailResponse;
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
