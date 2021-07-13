export const generateNextBillingDate = (
  interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR',
  intervalCount: number
) => {
  let now = new Date();

  switch (interval) {
    case 'DAY':
      now.setDate(now.getDate() + intervalCount);
      break;
    case 'WEEK':
      now.setDate(now.getDate() + intervalCount * 7);
      break;
    case 'MONTH':
      // now.setMonth(now.getMonth() + intervalCount);
      now.setDate(now.getDate() + intervalCount * 30);
      break;
    case 'YEAR':
      now.setDate(now.getDate() + intervalCount * 365);
  }

  return new Date(now).toISOString().substring(0, 10);
  // return new Date(now).toISOString().substring(0, 10) + 'T00:00:00Z';
};

export const generateNewBillingDate = () => {
  let now = new Date();
  now.setDate(now.getDate() + 2);
  return new Date(now).toISOString().substring(0, 10);
};
