export const generateNextBillingDate = (
  interval: 'MONTH' | 'WEEK',
  intervalCount: number
) => {
  let now = new Date();
  if (interval === 'MONTH') {
    now.setMonth(now.getMonth() + intervalCount);
  } else {
    now.setDate(now.getDate() + intervalCount * 7);
  }
  return new Date(now).toISOString().substring(0, 10);
  // return new Date(now).toISOString().substring(0, 10) + 'T00:00:00Z';
};

export const generateNewBillingDate = () => {
  let now = new Date();
  now.setDate(now.getDate() + 2);
  return new Date(now).toISOString().substring(0, 10);
};
