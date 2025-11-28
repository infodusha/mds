const API_URL = 'https://mds-online.ru/';

export const onRequest: PagesFunction = async (context) => {
  const method = context.params.method as string;
  const url = new URL(method, API_URL);
  const request = new Request(url, context.request);
  request.headers.set('Origin', API_URL);
  request.headers.set('Referer', API_URL);
  const response = await fetch(request);
  const res = response.clone();
  res.headers.set('Access-Control-Allow-Origin', 'https://mds.infodusha.ru');
  return res;
};
