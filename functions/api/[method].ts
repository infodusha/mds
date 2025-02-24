const API_URL = 'https://mds-online.ru/';

export const onRequest: PagesFunction = async (context) => {
  const method = context.params.method as string;
  const url = new URL(method, API_URL);
  const request = new Request(url, context.request);
  return await fetch(request);
};
