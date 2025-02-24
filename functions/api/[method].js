const API_URL = 'https://mds-online.ru/';

export async function onRequest(context) {
  const request = new Request(context.request);
  const url = new URL(context.params.method, API_URL);
  request.url = url;
  console.log(url);
  return fetch(request);
}
