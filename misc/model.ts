export interface Client {
  hostname: string;
  platform: string;
  mac_addr: string;
  ip: string;
  port: number;
  version: string;
  label?: string;
}

export interface ReleaseAsset {
  name: string;
  platform: string;
  file_name: string;
  willow_url: string;
  html_url?: string;
  size: number;
  was_url: string | null;
  cached: boolean;
}
