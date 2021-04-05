export const generateNextBillingDate = (
  interval: 'MONTH' | 'WEEK',
  intervalCount: number
) => {
  let now = new Date();
  console.log('GENERATING NEXT BILLING DATE');
  console.log('INTERVAL', interval);
  console.log('INTERVAL COUNT', intervalCount);
  if (interval === 'MONTH') {
    now.setMonth(now.getMonth() + intervalCount);
  } else {
    now.setDate(now.getDate() + intervalCount * 7);
  }
  return new Date(now).toISOString().substring(0, 10);
  // return new Date(now).toISOString().substring(0, 10) + 'T00:00:00Z';
};
