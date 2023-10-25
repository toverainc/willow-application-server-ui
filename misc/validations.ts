// Validation Functions
const PATTERN_VALID_PSK = '^[ -~]+$';
const PATTERN_VALID_WIFI_SSID = '^[^?"$[\\]+]+$';

export function ValidateWasUrl(url: string) {
  try {
    new URL(url);
  } catch (e) {
    return 'URL is invalid';
  }
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    return 'URL must start with ws:// or wss://';
  }
  if (!url.endsWith('/ws')) {
    return 'URL must end with /ws';
  }
}

export function ValidateWifiPsk(psk: string) {
  if (psk.length < 8 || psk.length > 63) {
    return 'WiFi WPA passphrase must be between 8 and 63 ASCII characters';
  }
  if (!psk.match(PATTERN_VALID_PSK)) {
    return 'WiFi WPA passphrase must only contain ASCII characters';
  }
}

export function ValidateWifiSSID(ssid: string) {
  if (ssid.length < 2 || ssid.length > 32) {
    return 'WiFi SSID must be between 2 and 32 ASCII characters';
  }
  if (!ssid.match(PATTERN_VALID_WIFI_SSID)) {
    return 'WiFi SSID contains invalid characters';
  }
}

export function ValidateUrl(url: string) {
  try {
    new URL(url);
  } catch (e) {
    return 'URL is invalid';
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'URL must begin with http:// or https://';
  }
  if ((url.includes('&') && !url.includes('?')) || url.split('?').length > 2) {
    return 'URL contains invalid URL parameters';
  }
}

export function ValidateIpOrHostname(host: string) {
  try {
    const validUrl = new URL(host);
    console.log(validUrl);
    return 'Hostname or IP Address must not include protocol';
  } catch {}
  if (host.includes('/') || host.includes('\\')) {
    return 'Value must be IP Address or Hostname only';
  }
  try {
    const testUrl = new URL(`http://${host}`);
    if (testUrl.port || host.includes(':')) {
      return 'Hostname or IP Address must not include port';
    }
    if (testUrl.pathname != '/') {
      return 'Value must be IP Address or Hostname only';
    }
    if (testUrl.search || host.includes('?') || host.includes('&')) {
      return 'Hostname or IP Address must not include any parameters';
    }
  } catch {
    return 'Invalid Hostname or IP Address';
  }
}

export function ValidateWisUrl(url: string) {
  const invalidUrl = ValidateUrl(url);
  if (invalidUrl) {
    return invalidUrl;
  }

  const validUrl = new URL(url);
  if (validUrl.pathname != '/api/willow') {
    return 'URL must end with /api/willow';
  }
}

export function ValidateWisTtsUrl(url: string) {
  const invalidUrl = ValidateUrl(url);
  if (invalidUrl) {
    return invalidUrl;
  }
  const validUrl = new URL(url);
  if (validUrl.pathname != '/api/tts') {
    return 'URL must end with /api/tts';
  }
}

export function ValidateHassHost(url: string) {
  const invalidHostOrIp = ValidateIpOrHostname(url);
  if (invalidHostOrIp) {
    return invalidHostOrIp;
  }
}
