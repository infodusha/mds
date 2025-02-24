import { Mongo } from './types';

const API_URL = '/api/';

async function call(method: string, request: any) {
  const response = await fetch(`${API_URL}${method}`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

interface GetRequest {
  hideListened: '0' | '1';
  query: Mongo.Selector<Partial<Book>>;
  skip: number;
}

export async function getAmount(request: GetRequest): Promise<number> {
  const response = await call('getAmount', request);
  return response;
}

export interface Book {
  _id: string;
  name: string;
  author: string;
  duration: string;
  path: string;
  params: {
    'Жанры/поджанры': string[];
    'Общие характеристики': string[];
    'Место действия': string[];
    'Время действия': string[];
    'Сюжетные ходы': string[];
    'Линейность сюжета': string[];
    'Возраст читателя': string[];
  };
  rating: {
    count: number;
    votes: {
      [key: string]: number;
    };
    average: number;
  };
  fantlab: string;
  annotation: string;
  tracks: string[];
}

interface GetWorksResponse {
  foundWorks: Book[];
  foundCount: number;
  listenedByUser: number;
}

export async function getWorks(request: GetRequest): Promise<GetWorksResponse> {
  const response = await call('getWorks', request);
  return response;
}
