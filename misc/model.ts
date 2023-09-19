export function formatMacAddress(mac_addr: MacAddr): string {
  return mac_addr
    .map((x) => x.toString(16).padStart(2, '0'))
    .join(':')
    .toUpperCase();
}

export type MacAddr = [number, number, number, number, number, number];

export interface Client {
  hostname: string;
  hw_type: string;
  mac_addr: MacAddr;
  ip: string;
  port: number;
  user_agent: string;
  label?: string;
}

export interface ReleaseAsset {
  name: string;
  platform: string;
  file_name: string;
  gh_url: string;
  html_url?: string;
  size: number;
  was_url: string | null;
  cached: boolean;
}
