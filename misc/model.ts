export interface Client {
  hostname: string;
  platform: string;
  mac_addr: string;
  ip: string;
  port: number;
  version: string;
  label?: string;
}

export interface Release {
  name: string;
  html_url: string;
  assets: ReleaseAsset[];
  latest: boolean;
  prerelease: boolean;
}

export interface ReleaseAsset {
  name: string;
  platform: string;
  build_type: string;
  url: string;
  size: number;
  created_at: string;
  browser_download_url: string;
  was_url: string;
  cached: boolean;
}

export const WAKE_WORDS = {
  alexa: 'Alexa',
  hiesp: 'Hi E.S.P.',
  hilexin: 'Hi Lexin (Chinese pronunciation)',
};
export const SPEECH_REC_MODE = {
  WIS: 'Willow Inference Server',
  Multinet: 'On Client Command Recognition (developers only)',
};
export const AUDIO_RESPONSE_TYPE = { TTS: 'Text to Speech', Chimes: 'Chimes', None: 'Silence' };
export const COMMAND_ENDPOINT = {
  'Home Assistant': 'Home Assistant',
  openHAB: 'openHAB',
  REST: 'REST',
};
export const NTP_CONFIG = {
  Host: 'Specify an NTP server host',
  DHCP: 'Use DHCP provided NTP Server',
};
export const REST_AUTH_TYPES = ['None', 'Basic', 'Header'];

export const AUDIO_CODECS = { PCM: 'PCM', 'AMR-WB': 'AMR-WB' };
export const VAD_MODES = [1, 2, 3, 4];
export const WAKE_MODES = ['1CH_90', '1CH_95', '2CH_90', '2CH_95', '3CH_90', '3CH_95'];

export interface AdvancedSettings {
  aec: boolean; //Acoustic Echo Cancellation
  bss: boolean; //Blind Source Separation
  was_mode: boolean; //WAS Command Endpoint
  multiwake: boolean; // Multiwake / Willow One Wake
  audio_codec: keyof typeof AUDIO_CODECS;
  vad_mode: number; //Voice Activity Detection Mode
  wake_mode: string; //aka WAKE_MODES
  mic_gain: number;
  record_buffer: number;
  stream_timeout: number;
  vad_timeout: number;
}

export interface GeneralSettings {
  speech_rec_mode: keyof typeof SPEECH_REC_MODE;
  wis_url: string;
  audio_response_type: keyof typeof AUDIO_RESPONSE_TYPE;
  wis_tts_url: string;
  wake_word: keyof typeof WAKE_WORDS;
  command_endpoint: keyof typeof COMMAND_ENDPOINT;
  hass_host: string;
  hass_port: number;
  hass_tls: boolean;
  hass_token: string;
  openhab_url: string;
  openhab_token: string;
  rest_url: string;
  rest_auth_type: string; //aka REST_AUTH_TYPE
  rest_auth_user: string;
  rest_auth_pass: string;
  rest_auth_header: string;
  timezone_continent_city: string;
  speaker_volume: number;
  lcd_brightness: number;
  timezone: string;
  timezone_name: string;
  ntp_config: keyof typeof NTP_CONFIG;
  ntp_host: string;
}

export interface NvsSettings {
  WAS: { URL: string };
  WIFI: { PSK: string; SSID: string };
}

export interface TZDictionary {
  [index: string]: string;
}
