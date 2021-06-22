import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import nodemailer from 'nodemailer';
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
import logger from '../logger';
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
  const body = JSON.parse(ctx.request.body);
  console.log('REACT HITTING SERVER');
  console.log('PARAMS', params);
  console.log('BODY', body);
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
  console.log('APP PROXY -> UPDATING CUSTOMER SUBSCRIPTION');
  console.log('REQUEST', ctx.request);
  console.log('REQ', ctx.req);
  const params = ctx.request.query;
  console.log('QUERY', ctx.request.query);
  console.log('REQ BODY', ctx.request.body);
  const body = ctx.request.body;
  const subscriptionContractId = body.subscriptionContractId as string;
  const status = body.status as string;
  console.log('PARAMS', params);
  console.log('BODY', body);
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
  console.log('APP PROXY -> UPDATING PAYMENT METHOD');
  const params = ctx.request.query;
  const body = ctx.request.body;
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
  const body = JSON.parse(ctx.request.body);
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
        console.log('SUBSCRIPTION ID');
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

const sendEmail = (customerEmail: string, url: string) => {
  console.log('EMAIL', process.env.APP_PROXY_EMAIL);
  console.log('PASS', process.env.APP_PROXY_EMAIL_PASS);
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.APP_PROXY_EMAIL,
      pass: process.env.APP_PROXY_EMAIL_PASS,
    },
  });
  let mailOptions = {
    from: process.env.APP_PROXY_EMAIL,
    to: customerEmail,
    subject: 'App Proxy Secure Login Link',
    text: `This is your secure login: ${url} This link expires in 15 minutes.`,
    html: `
      <p>This is your secure login:</p>
      <a href="${url}">Please click here!</a>
      <p>This link expires in 15 minutes.</p>
    `,
  };
  console.log('SENDING EMAIL!', customerEmail);
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log('Errors occured', err.message);
      return false;
    }
    console.log('Email sent!!!', data);
    return true;
  });
};

export const generateCustomerAuth = async (ctx: Context) => {
  console.log('APP PROXY GENERATE TOKEN');
  // get customer id from body
  const params = ctx.request.query;
  const body = ctx.request.body;
  if (body.customerId && params.shop) {
    console.log('CUSTOMER ID && SHOP SUPPLIED');
    // check if customer exists
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
    const emailResponse = sendEmail(customer_email, url);
    ctx.body = { msg: emailResponse };
  } else {
    console.log('NO SHOP OR CUSTOMER ID SUPPLIED');
    ctx.body = { msg: 'No Shop or Customer ID Supplied' };
  }
};

export const applicationProxy = async (ctx: Context) => {
  const params = ctx.request.query;
  if (params.token && params.shop && params.customer_id) {
    console.log('ALL 3 REQS');
    const token = params.token as string;
    const shop = params.shop as string;
    const customer_id = params.customer_id as string;
    const verified = verifyToken(shop, customer_id, token);
    console.log('VERIFIED', verified);
    ctx.set('Content-Type', 'application/liquid');
    if (verified) {
      // ctx.body = fs.createReadStream(
      //   `${process.env.APP_PROXY}/build/index.html`
      // );
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
          <p><a href="/apps/app_proxy?customer_id={{customer.id}}">View Subscriptions</a></p>
          {% endif %}
        {% else %}
        <p>Please Login!</p>
        {% endif %}
      `;
    } else {
      ctx.body = 'VERIFICATION FAILED';
    }
  } else {
    console.log('ERROR', 'Missing Token, Shop or Customer Id.');
    ctx.body = `
      <p>ERROR: Missing Token, Shop or Customer Id.</p>
    `;
  }
};
