import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import {
  commitSubscriptionDraft,
  createClient,
  getCustomerSubscriptionContractsById,
  getProductsById,
  updateSubscriptionContract,
  updateSubscriptionDraft,
} from '../handlers';
import PgStore from '../pg-store';
import logger from '../logger';
import { updatePaymentMethod } from '../handlers/mutations/update-payment-method';
dotenv.config();

const pgStorage = new PgStore();

export const getCustomerSubscriptionByIdTemplate = async (ctx: Context) => {
  const params = ctx.request.query;
  const customerId = params.customerId as string;
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
        ctx.set('Content-Type', 'application/liquid');
        if (subscriptions.length > 0) {
          ctx.body = generateLiquid(customerId, subscriptions);
        } else {
          ctx.body = `
            <p>No Subscriptions Found</p>
          `;
        }
      } else {
        return (ctx.status = 401);
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

const generateLiquid = (customerId: string, subscriptions: any) => {
  let subscriptionsHtml: string = '';
  subscriptions.forEach((subscription: any) => {
    // get products
    let products = '';
    let s = subscription.node;
    s.lines.edges.forEach((line: any) => {
      products += `
        <p>${line.node.title} - ${line.node.variantTitle} x ${line.node.quantity}</p>
      `;
    });
    subscriptionsHtml += `
      <li>
        <p>id: ${s.id} | status: ${s.status}</p>
        <p>Billing Policy: Every ${s.billingPolicy.intervalCount} ${s.billingPolicy.interval}</p>
        <p>products: ${products}</p>
        <p>Next Billing Date: ${s.nextBillingDate}</p>
        <p>
          {% if '${s.status}' == 'ACTIVE' %}
            <button type="button" onClick="updateStatus('{{ customer.id }}', '${s.id}', 'PAUSED')">Pause</button>
          {% else %}
            <button type="button" onClick="updateStatus('{{ customer.id }}', '${s.id}', 'ACTIVE')">Activate</button>
          {% endif %}
          <button type="button" onClick="updateStatus('{{ customer.id }}', '${s.id}', 'CANCELLED')">Cancel</button>
          <button type="button" onClick="updatePaymentMethod('{{ customer.id }}', '${s.customerPaymentMethod.id}')">Update Payment Method</button>
        </p>
      </li>
    `;
  });
  const script = `
    <script>
    async function updateStatus(customerId, subscriptionId, status) {
      try {        
        const response = await fetch('/apps/app_proxy/subscription/edit', {
          method: 'POST',
          heaaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerId: customerId,
            subscriptionContractId: subscriptionId,
            status: status
          })
        });
        const data = await response.json();
        console.log(data);
        window.location.reload();
      } catch(e) {
        console.log('ERROR', e.message);
      }
    }
    async function updatePaymentMethod(customerId, paymentMethodId) {
      try {        
        const response = await fetch('/apps/app_proxy/subscription/payment', {
          method: 'POST',
          heaaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerId: customerId,
            paymentMethodId: paymentMethodId
          })
        });
        const data = await response.json();
        console.log(data);
        alert('Payment Method Update Email Sent!');
      } catch(e) {
        console.log('ERROR', e.message);
      }
    }
    </script>
  `;
  let liquid = `
    {% if customer %}
      {% if customer.id == ${customerId} %}
        <p>Orders</p>
        <div class="subscription-contracts">
          <ul>
            ${subscriptionsHtml}
          </ul>
        </div>
        ${script}
      {% else %}
        <p>Forbidden</p>
      {% endif %}
    {% else %}
    <p>Please Login Homie!</p>
    {% endif %}
  `;
  return liquid;
};

export const updateCustomerSubscription = async (ctx: Context) => {
  const params = ctx.request.query;
  const body = JSON.parse(ctx.request.body);
  const subscriptionContractId = body.subscriptionContractId as string;
  const status = body.status as string;
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
  const body = JSON.parse(ctx.request.body);
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
