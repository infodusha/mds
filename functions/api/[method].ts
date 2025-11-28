const API_URL = 'https://mds-old.ru/';

export const onRequest: PagesFunction = async (context) => {
  const method = context.params.method as string;
  const url = new URL(method, API_URL);
  const request = new Request(url, context.request);
  request.headers.set('Origin', API_URL);
  request.headers.set('Referer', API_URL);
  return fetch(request);
};
