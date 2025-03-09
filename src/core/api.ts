import { Mongo } from './types';

const API_URL = '/api/';

async function call(method: string, request: unknown) {
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
  skip?: number;
}

export function getAmount(request: GetRequest): Promise<number> {
  return call('getAmount', request);
}

export interface Book {
  _id: string;
  name: string;
  author: string;
  duration: number;
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

export function getWorks(request: GetRequest): Promise<GetWorksResponse> {
  return call('getWorks', request);
}

interface SearchResponse {
  authors: string[];
  works: string;
}

export async function searchByName(query: string): Promise<SearchResponse> {
  return call('query', { query });
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  email: string;
  listened: string[];
}

interface LoginError {
  status: "error";
  message: string;
}

export function login(request: LoginRequest): Promise<LoginResponse | LoginError> {
  return call('login', request);
}

export async function logout() {
  await fetch(`${API_URL}logout`, {
    method: 'POST',
  });
}

interface MakeListenedRequest {
  makeListened: boolean;
  _id: string;
}

interface MakeListenedResponse {
  makeListened: boolean;
}

export function makeListened(request: MakeListenedRequest): Promise<MakeListenedResponse> {
  return call('listened', request);
}

interface ProfileResponse {
  email?: string;
  listened: string[];
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${API_URL}profile`, {
    method: 'GET',
  });
  const data = await response.text();
  const listenedJSON = data.match(/"listened":(\[[\w",]+])/)?.[1];
  const listened = listenedJSON ? JSON.parse(listenedJSON) as string[] : [];
  const email = data.match(/"email":"([^"]+)/)?.[1];
  return {
    email,
    listened
  };
}
