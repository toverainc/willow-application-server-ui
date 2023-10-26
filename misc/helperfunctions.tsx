import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { post } from './fetchers';
import { AdvancedSettings, FormErrorStates, GeneralSettings, TZDictionary } from './model';

export function parseIntOrUndef(val: string | number | null | undefined) {
  if (!val) return undefined;
  const int = parseInt(val as any);
  return isNaN(int) ? undefined : int;
}

export function HelpTooltip({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip title={tooltip} enterTouchDelay={0}>
      <IconButton aria-label="help">
        <HelpOutlineIcon></HelpOutlineIcon>
      </IconButton>
    </Tooltip>
  );
}

export function EnumSelectHelper(params: {
  onChange?: (event: SelectChangeEvent<string>) => void;
  tooltip?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  label: string;
  options: Record<string, string> | [string, string][] | string[];
}) {
  return (
    <FormControl
      fullWidth
      size="small"
      margin="dense"
      variant="outlined"
      sx={{ flexDirection: 'row' }}>
      <InputLabel>{params.label}</InputLabel>
      <Select
        name={params.name}
        value={params.value}
        defaultValue={params.defaultValue || ''}
        label={params.label}
        onChange={params.onChange}
        sx={{ flexGrow: '1' }}>
        {(Array.isArray(params.options) ? params.options : Object.entries(params.options)).map(
          (o) => (
            <MenuItem
              key={(typeof o == 'string' ? o : o[0]) as string}
              value={(typeof o == 'string' ? o : o[0]) as string}>
              {(typeof o == 'string' ? o : o[1]) as string}
            </MenuItem>
          )
        )}
      </Select>
      {params.tooltip && <HelpTooltip tooltip={params.tooltip}></HelpTooltip>}
    </FormControl>
  );
}

export async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
  tzDictionary: TZDictionary,
  formErrorContext: FormErrorStates,
  shouldScrollToTop: boolean = false
) {
  event.preventDefault();
  if (Object.values(formErrorContext).some((entry) => entry.Error == true)) {
    toast.error('Please correct invalid values before saving!');
    return;
  }

  const advancedSettingsForm = Object.fromEntries(
    new FormData(document.querySelector('form[name="advanced-settings-form"]') as any).entries()
  ) as Record<string, string>;
  const generalSettingsForm = Object.fromEntries(
    new FormData(document.querySelector('form[name="general-settings-form"]') as any).entries()
  ) as Record<string, string>;
  const apply = (event.nativeEvent as any).submitter.id == 'saveAndApply';
  let advancedSettings: Partial<AdvancedSettings> = {
    aec: !!advancedSettingsForm.aec,
    bss: !!advancedSettingsForm.bss,
    was_mode: !!advancedSettingsForm.was_mode,
    multiwake: !!advancedSettingsForm.multiwake,
    show_prereleases: !!advancedSettingsForm.show_prereleases,
    vad_mode: parseIntOrUndef(advancedSettingsForm.vad_mode),
    mic_gain: parseIntOrUndef(advancedSettingsForm.mic_gain),
    record_buffer: parseIntOrUndef(advancedSettingsForm.record_buffer),
    stream_timeout: parseIntOrUndef(advancedSettingsForm.stream_timeout),
    vad_timeout: parseIntOrUndef(advancedSettingsForm.vad_timeout),
  };
  let generalSettings: Partial<GeneralSettings> = {
    hass_port:
      generalSettingsForm.command_endpoint == 'Home Assistant'
        ? parseIntOrUndef(generalSettingsForm.hass_port)
        : undefined,
    hass_tls:
      generalSettingsForm.command_endpoint == 'Home Assistant'
        ? !!generalSettingsForm.hass_tls
        : undefined,
    speaker_volume: parseIntOrUndef(generalSettingsForm.speaker_volume),
    lcd_brightness: parseIntOrUndef(generalSettingsForm.lcd_brightness),
    display_timeout: parseIntOrUndef(generalSettingsForm.display_timeout),
    wake_confirmation: !!generalSettingsForm.wake_confirmation,
    timezone: tzDictionary[generalSettingsForm.timezone],
    timezone_name: generalSettingsForm.timezone,
  };
  let body = Object.assign(
    {},
    generalSettingsForm,
    advancedSettingsForm,
    generalSettings,
    advancedSettings
  );
  try {
    await post(apply ? '/api/config?type=config&apply=1' : '/api/config?type=config&apply=0', body);
    await Promise.all([mutate('/api/config?type=config'), mutate('/api/client')]);
    if (typeof window !== 'undefined' && shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (e) {
    console.error(`Save configuration settings failed with ${e}`);
    toast.error(`Save configuration settings to WAS failed!`);
    return e;
  }
  if (apply) {
    toast.success('Configuration settings saved and applied!');
  } else {
    toast.success('Configuration settings saved!');
  }
}
