import { BASE_URL, MethodTypes } from '../../misc/fetchers';
import { FormErrorState } from '../../misc/model';

export interface NotifyData {
  audio_url?: string;
  backlight: boolean;
  backlight_max: boolean;
  id?: number;
  repeat: number | undefined;
  strobe_period_ms?: number;
  text?: string;
  volume?: number;
}

export class NotifyCommand {
  cmd: string = 'notify';
  data: NotifyData = { backlight: true, backlight_max: false, repeat: 1 };
  hostname?: string;
}

export class NotifyFormErrorStates {
  audio_url: FormErrorState = { Error: false, HelperText: '' };
}

export const AUDIO_SOURCES = {
  None: 'None',
  URL: 'URL',
  TTS: 'TTS',
};

export class CurlRequest {
  url: string = `${BASE_URL}/api/client?action=notify`;
}

// Home Assistant YAML Templating
export class RestfulCommand {
  rest_command: WillowNotify;

  constructor(notifyCommand: NotifyCommand) {
    this.rest_command = new WillowNotify(notifyCommand);
  }
}

class WillowNotify {
  willow_notify: RestCommand;

  constructor(notifyCommand: NotifyCommand) {
    this.willow_notify = new RestCommand(notifyCommand);
  }
}

class RestCommand {
  url: string = `${BASE_URL}/api/client?action=notify`;
  method: MethodTypes = 'POST';
  payload: string;
  content_type: string = 'application/json';

  constructor(notifyCommand: NotifyCommand) {
    this.payload = JSON.stringify(new NotifyCommandTemplate(notifyCommand));
  }
}

class NotifyCommandTemplate {
  cmd: string = 'notify';
  data: NotifyDataTemplate;
  hostname?: string;

  constructor(notifyCommand: NotifyCommand) {
    this.data = new NotifyDataTemplate(notifyCommand.data);
    if (notifyCommand.hostname) {
      this.hostname = '{{hostname}}';
    }
  }
}

class NotifyDataTemplate {
  audio_url?: string;
  backlight: string = '{{backlight}}';
  backlight_max: string = '{{backlightMax}}';
  id?: string;
  repeat: string = '{{repeat}}';
  strobe_period_ms?: string;
  text?: string;
  volume?: string;

  constructor(notifyData: NotifyData) {
    if (notifyData.audio_url) {
      this.audio_url = '{{audioUrl}}';
    }
    if (notifyData.id) {
      this.id = '{{id}}';
    }
    if (notifyData.strobe_period_ms) {
      this.strobe_period_ms = '{{strobePeriodMs}}';
    }
    if (notifyData.text) {
      this.text = '{{text}}';
    }
    if (notifyData.volume) {
      this.volume = '{{volume}}';
    }
  }
}

export class HaNotifyDataTemplate {
  hostname?: string;
  audioUrl?: string;
  backlight: boolean;
  backlightMax: boolean;
  id?: number;
  repeat: number;
  strobePeriodMs?: number;
  text?: string;
  volume?: number;

  constructor(notifyCommand: NotifyCommand) {
    this.hostname = notifyCommand.hostname;
    this.audioUrl = notifyCommand.data.audio_url;
    this.backlight = notifyCommand.data.backlight;
    this.backlightMax = notifyCommand.data.backlight_max;
    this.id = notifyCommand.data.id;
    this.repeat = notifyCommand.data.repeat ?? 1;
    this.strobePeriodMs = notifyCommand.data.strobe_period_ms;
    this.text = notifyCommand.data.text;
    this.volume = notifyCommand.data.volume;
  }
}
