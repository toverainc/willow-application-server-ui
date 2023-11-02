import { FormErrorState } from '../../misc/model';

export interface NotifyData {
  audio_url?: string;
  backlight: boolean;
  backlight_max: boolean;
  id?: number;
  repeat: number;
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
