import { Client } from './model';

export class HttpError extends Error {
  httpStatus: number;
  constructor(status: number, msg: string) {
    super(`${status}: ${msg}`);
    this.httpStatus = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// For development, set the environment variable NEXT_PUBLIC_WAS_URL in .env to set the address of your WAS backend
//NOTE: ensure that the variable is unset/deleted when building and deploying to static directory of WAS, or else it will compile with the value.
export const BASE_URL =
  typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_WAS_URL
    ? window.location.origin
    : process.env.NEXT_PUBLIC_WAS_URL;
export const WAS_URL =
  BASE_URL?.toLowerCase().replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
export const WAS_FLASH_URL = `https://flash.heywillow.io/?wasURL=${WAS_URL}`;

export type MethodTypes = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function post<T>(url: string, body: any, method?: MethodTypes) {
  method = method || 'POST';
  url = `${BASE_URL}${url}`;
  const res = await fetch(url, {
    method: method,
    //credentials: "include",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new HttpError(res.status, res.statusText);
  }
  if (method == 'DELETE') return {} as T;
  return (await res.json()) as T;
}

export async function fetcher(url: string) {
  url = `${BASE_URL}${url}`;
  const res = await fetch(url, {
    /*credentials: "include"*/
  });
  if (res.status < 200 || res.status >= 300) {
    throw new HttpError(res.status, res.statusText);
  }
  return await res.json();
}

//the label for the client comes back in 2nd request :( this fetcher merges things
export async function fetcherClients(url: string) {
  const [clients, devices]: [Client[], { mac_addr: string; label: string }[]] = (await Promise.all(
    ['/api/client', '/api/device'].map(fetcher)
  )) as any;
  const deviceMap = Object.fromEntries(devices.map((i) => [i.mac_addr, i.label]));
  clients.forEach((c) => (c.label = deviceMap[c.mac_addr]));
  return clients;
}
