export function formatMacAddress(mac_addr: MacAddr): string {
    return mac_addr.map(x => x.toString(16).padStart(2, '0')).join(':').toUpperCase();
}

export type MacAddr = [number, number, number, number, number, number]

export interface Client {
    hostname: string,
    hw_type: string,
    mac_addr: MacAddr,
    ip: string,
    port: number,
    user_agent: string,
    label?: string,
}

export interface ReleaseAsset {
    url: string,
    name: string,
    id:number,
    size:number
    local?:boolean,
    browser_download_url: string
}

export interface Release {
    id: number,
    name: string,
    assets:Array<ReleaseAsset>,
    html_url:string,
    published_at:string,
}