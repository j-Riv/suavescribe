export const formatId = (id: string) => {
  const strippedId = id.split('/');
  return strippedId[strippedId.length - 1];
};

export const formatDate = (date: string) => {
  const formattedDate = date.split('T');
  return formattedDate[0];
};
