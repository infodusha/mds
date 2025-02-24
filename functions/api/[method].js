const API_URL = 'https://mds-online.ru/';

export async function onRequest(context) {
  const url = new URL(context.params.method, API_URL);
  return fetch(url);
}
