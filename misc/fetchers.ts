import { Client, formatMacAddress, MacAddr } from './model'

export class HttpError extends Error {
    httpStatus: number;
    constructor(status: number, msg: string) {
        super(`${status}: ${msg}`);
        this.httpStatus = status;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}


const BASE_URL = ""

export type MethodTypes = "POST" | "PUT" | "PATCH" | "DELETE";

export async function post<T>(url: string, body: any, method?: MethodTypes) {
    method = method || "POST"
    url = `${BASE_URL}${url}`
    const res = await fetch(url, {
        method: method,
        //credentials: "include",
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(body),
    })
    if (res.status < 200 || res.status >= 300) {
        throw new HttpError(res.status, res.statusText)
    }
    if (method == "DELETE") return {} as T;
    return await res.json() as T;
}

export async function fetcher(url: string) {
    url = `${BASE_URL}${url}`
    const res = await fetch(url, { /*credentials: "include"*/ });
    if (res.status < 200 || res.status >= 300) {
        throw new HttpError(res.status, res.statusText)
    }
    return await res.json()
}

//the label for the client comes back in 2nd request :( this fetcher merges things
export async function fetcherClients(url: string) {
    const [clients, devices]: [Client[], { mac_addr: MacAddr, label: string }[]] = await Promise.all(['/api/clients', "/api/devices"].map(fetcher)) as any
    const deviceMap = Object.fromEntries(devices.map(i => [formatMacAddress(i.mac_addr), i.label]))
    clients.forEach(c => c.label = deviceMap[formatMacAddress(c.mac_addr)])
    return clients;
}
