import Router from 'koa-router';
import {
  getAllSubscriptionGroups,
  addProductToSubscriptionPlanGroup,
  createSubscriptionPlanGroup,
  editSubscriptionPlanGroup,
  removeProductFromSubscriptionPlanGroup,
  deleteSubscriptionPlanGroup,
  getSubscriptionGroup,
} from '../controllers/subscriptions';
const router = new Router();

// Extension routes
router.post('/subscription-plan/all', getAllSubscriptionGroups);

router.post('/subscription-plan/get', getSubscriptionGroup);

router.post(
  '/subscription-plan/product/add',
  addProductToSubscriptionPlanGroup
);

router.post('/subscription-plan/create', createSubscriptionPlanGroup);

router.post('/subscription-plan/edit', editSubscriptionPlanGroup);

router.post(
  '/subscription-plan/product/remove',
  removeProductFromSubscriptionPlanGroup
);

router.post('/subscription-plan/delete', deleteSubscriptionPlanGroup);

export default router;
