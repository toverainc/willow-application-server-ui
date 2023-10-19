import { HourglassEmpty, HourglassFull } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { CardContent } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import * as React from 'react';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';
import InformationCard from '../components/InformationCard';
import LeftMenu from '../components/LeftMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import WebFlashCard from '../components/WebFlashCard';
import { WAS_URL, post } from '../misc/fetchers';
import {
  AUDIO_CODECS,
  AUDIO_RESPONSE_TYPE,
  AdvancedSettings,
  COMMAND_ENDPOINT,
  GeneralSettings,
  NTP_CONFIG,
  NvsSettings,
  REST_AUTH_TYPES,
  SPEECH_REC_MODE,
  TZDictionary,
  VAD_MODES,
  WAKE_MODES,
  WAKE_WORDS,
} from '../misc/model';
import { OnboardingContext } from './_app';

function parseIntOrUndef(val: string | number | null | undefined) {
  if (!val) return undefined;
  const int = parseInt(val as any);
  return isNaN(int) ? undefined : int;
}

function HelpTooltip({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip title={tooltip} enterTouchDelay={0}>
      <IconButton aria-label="help">
        <HelpOutlineIcon></HelpOutlineIcon>
      </IconButton>
    </Tooltip>
  );
}

function EnumSelectHelper(params: {
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

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
  tzDictionary: TZDictionary,
  shouldScrollToTop: boolean = false
) {
  event.preventDefault();
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

function AdvancedSettings() {
  const [loading, setLoading] = React.useState(true);
  const { data: advancedSettings, error: advancedSettingsError } =
    useSWR<AdvancedSettings>('/api/config?type=config');
  const { data: defaultAdvancedSettings, error: defaultAdvancedSettingsError } =
    useSWR<AdvancedSettings>('/api/config?type=config&default=true');
  const { data: tzDictionary, error: tzDictionaryError } =
    useSWR<TZDictionary>('/api/config?type=tz');

  const [changesMade, setChangesMade] = React.useState(false);

  // Field States
  const [micGainValue, setMicGainValue] = React.useState(
    advancedSettings?.mic_gain ?? defaultAdvancedSettings?.mic_gain
  );
  const [recordBufferValue, setRecordBufferValue] = React.useState(
    advancedSettings?.record_buffer ?? defaultAdvancedSettings?.record_buffer
  );
  const [streamTimeoutValue, setStreamTimeoutValue] = React.useState(
    advancedSettings?.stream_timeout ?? defaultAdvancedSettings?.stream_timeout
  );
  const [vadTimeoutValue, setVadTimeoutValue] = React.useState(
    advancedSettings?.vad_timeout ?? defaultAdvancedSettings?.vad_timeout
  );
  const [aecValue, setAecValue] = React.useState(
    advancedSettings?.aec ?? defaultAdvancedSettings?.aec
  );
  const [bssValue, setBssValue] = React.useState(
    advancedSettings?.bss ?? defaultAdvancedSettings?.bss
  );
  const [wasModeValue, setWasModeValue] = React.useState(
    advancedSettings?.was_mode ?? defaultAdvancedSettings?.was_mode
  );
  const [multiwakeValue, setMultiwakeValue] = React.useState(
    advancedSettings?.multiwake ?? defaultAdvancedSettings?.multiwake
  );
  const [showPrereleasesValue, setShowPrereleasesValue] = React.useState(
    advancedSettings?.show_prereleases ?? defaultAdvancedSettings?.show_prereleases
  );
  const [audioCodecValue, setAudioCodecValue] = React.useState(
    (advancedSettings?.audio_codec ??
      defaultAdvancedSettings?.audio_codec) as keyof typeof AUDIO_CODECS
  );
  const [vadModeValue, setVadModeValue] = React.useState(
    (advancedSettings?.vad_mode ?? defaultAdvancedSettings?.vad_mode) as keyof typeof VAD_MODES
  );
  const [wakeModeValue, setWakeModeValue] = React.useState(
    (advancedSettings?.wake_mode ?? defaultAdvancedSettings?.wake_mode) as keyof typeof WAKE_MODES
  );

  // Handlers for Mic Gain Slider and Input
  const handleMicGainInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMicGainValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleMicGainSliderChange = (event: Event, newValue: number | number[]) => {
    setMicGainValue(newValue as number);
    setChangesMade(true);
  };

  const handleMicGainBlur = () => {
    if (micGainValue && micGainValue < 0) {
      setMicGainValue(0);
    } else if (micGainValue && micGainValue > 14) {
      setMicGainValue(14);
    } else if (!micGainValue) {
      setMicGainValue(advancedSettings?.mic_gain ?? defaultAdvancedSettings?.mic_gain ?? 0);
    }
    setChangesMade(true);
  };

  // Handlers for Record Buffer Slider and Input
  const handleRecordBufferInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecordBufferValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleRecordBufferSliderChange = (event: Event, newValue: number | number[]) => {
    setRecordBufferValue(newValue as number);
    setChangesMade(true);
  };

  const handleRecordBufferBlur = () => {
    if (recordBufferValue && recordBufferValue < 0) {
      setRecordBufferValue(0);
    } else if (recordBufferValue && recordBufferValue > 16) {
      setRecordBufferValue(16);
    } else if (!recordBufferValue) {
      setRecordBufferValue(
        advancedSettings?.record_buffer ?? defaultAdvancedSettings?.record_buffer ?? 0
      );
    }
    setChangesMade(true);
  };

  // Handlers for Stream Timeout Slider and Input
  const handleStreamTimeoutInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStreamTimeoutValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleStreamTimeoutSliderChange = (event: Event, newValue: number | number[]) => {
    setStreamTimeoutValue(newValue as number);
    setChangesMade(true);
  };

  const handleStreamTimeoutBlur = () => {
    if (streamTimeoutValue && streamTimeoutValue < 1) {
      setStreamTimeoutValue(1);
    } else if (streamTimeoutValue && streamTimeoutValue > 30) {
      setStreamTimeoutValue(30);
    } else if (!streamTimeoutValue) {
      setStreamTimeoutValue(
        advancedSettings?.stream_timeout ?? defaultAdvancedSettings?.stream_timeout ?? 1
      );
    }
    setChangesMade(true);
  };

  // Handlers for VAD Timeout Slider and Input
  const handleVADTimeoueInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVadTimeoutValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleVADTimeoutSliderChange = (event: Event, newValue: number | number[]) => {
    setVadTimeoutValue(newValue as number);
    setChangesMade(true);
  };

  const handleVADTimeoutBlur = () => {
    if (vadTimeoutValue && vadTimeoutValue < 0) {
      setVadTimeoutValue(0);
    } else if (vadTimeoutValue && vadTimeoutValue > 1000) {
      setVadTimeoutValue(1000);
    } else if (!vadTimeoutValue) {
      setVadTimeoutValue(
        advancedSettings?.vad_timeout ?? defaultAdvancedSettings?.vad_timeout ?? 0
      );
    }
    setChangesMade(true);
  };

  // Set initial states or refresh states on config changes
  React.useEffect(() => {
    if (advancedSettings && defaultAdvancedSettings) {
      setAecValue(advancedSettings.aec ?? defaultAdvancedSettings.aec);
      setBssValue(advancedSettings.bss ?? defaultAdvancedSettings.bss);
      setWasModeValue(advancedSettings.was_mode ?? defaultAdvancedSettings.was_mode);
      setMultiwakeValue(advancedSettings.multiwake ?? defaultAdvancedSettings.multiwake);
      setShowPrereleasesValue(
        advancedSettings.show_prereleases ?? defaultAdvancedSettings.show_prereleases
      );
      setAudioCodecValue(
        (advancedSettings.audio_codec ??
          defaultAdvancedSettings.audio_codec) as keyof typeof AUDIO_CODECS
      );
      setVadModeValue(
        (advancedSettings?.vad_mode ?? defaultAdvancedSettings?.vad_mode) as keyof typeof VAD_MODES
      );
      setWakeModeValue(
        (advancedSettings?.wake_mode ??
          defaultAdvancedSettings?.wake_mode) as keyof typeof WAKE_MODES
      );
      setMicGainValue(advancedSettings.mic_gain ?? defaultAdvancedSettings.mic_gain);
      setRecordBufferValue(advancedSettings.record_buffer ?? defaultAdvancedSettings.record_buffer);
      setStreamTimeoutValue(
        advancedSettings.stream_timeout ?? defaultAdvancedSettings.stream_timeout
      );
      setVadTimeoutValue(advancedSettings.vad_timeout ?? defaultAdvancedSettings.vad_timeout);
      setLoading(false);
    }
  }, [advancedSettings, defaultAdvancedSettings]);

  // Handler to reset field values to defaults
  const handleResetForm = () => {
    setAecValue(defaultAdvancedSettings?.aec);
    setBssValue(defaultAdvancedSettings?.bss);
    setWasModeValue(defaultAdvancedSettings?.was_mode);
    setMultiwakeValue(defaultAdvancedSettings?.multiwake);
    setShowPrereleasesValue(defaultAdvancedSettings?.show_prereleases);
    setAudioCodecValue(defaultAdvancedSettings?.audio_codec as keyof typeof AUDIO_CODECS);
    setVadModeValue(defaultAdvancedSettings?.vad_mode as keyof typeof VAD_MODES);
    setWakeModeValue(defaultAdvancedSettings?.wake_mode as keyof typeof WAKE_MODES);
    setMicGainValue(defaultAdvancedSettings?.mic_gain);
    setRecordBufferValue(defaultAdvancedSettings?.record_buffer);
    setStreamTimeoutValue(defaultAdvancedSettings?.stream_timeout);
    setVadTimeoutValue(defaultAdvancedSettings?.vad_timeout);
    setChangesMade(true);
  };

  // Handler to undo changes
  const handleUndoChanges = () => {
    setAecValue(advancedSettings?.aec ?? defaultAdvancedSettings?.aec);
    setBssValue(advancedSettings?.bss ?? defaultAdvancedSettings?.bss);
    setWasModeValue(advancedSettings?.was_mode ?? defaultAdvancedSettings?.was_mode);
    setMultiwakeValue(advancedSettings?.multiwake ?? defaultAdvancedSettings?.multiwake);
    setShowPrereleasesValue(
      advancedSettings?.show_prereleases ?? defaultAdvancedSettings?.show_prereleases
    );
    setAudioCodecValue(
      (advancedSettings?.audio_codec ??
        defaultAdvancedSettings?.audio_codec) as keyof typeof AUDIO_CODECS
    );
    setVadModeValue(
      (advancedSettings?.vad_mode ?? defaultAdvancedSettings?.vad_mode) as keyof typeof VAD_MODES
    );
    setWakeModeValue(
      (advancedSettings?.wake_mode ?? defaultAdvancedSettings?.wake_mode) as keyof typeof WAKE_MODES
    );
    setMicGainValue(advancedSettings?.mic_gain ?? defaultAdvancedSettings?.mic_gain);
    setRecordBufferValue(advancedSettings?.record_buffer ?? defaultAdvancedSettings?.record_buffer);
    setStreamTimeoutValue(
      advancedSettings?.stream_timeout ?? defaultAdvancedSettings?.stream_timeout
    );
    setVadTimeoutValue(advancedSettings?.vad_timeout ?? defaultAdvancedSettings?.vad_timeout);
    setChangesMade(false);
  };

  return loading || !(advancedSettings && defaultAdvancedSettings && tzDictionary) ? (
    <LoadingSpinner />
  ) : (
    <form name="advanced-settings-form" onSubmit={(event) => handleSubmit(event, tzDictionary)}>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="aec"
                checked={aecValue}
                onChange={(event) => {
                  setAecValue(event.target.checked);
                  setChangesMade(true);
                }}
              />
            }
            label="Acoustic Echo Cancellation"
          />
          <HelpTooltip
            tooltip="Acoustic Echo Cancellation (AEC) removes echo from the environment on the client before Willow processes commands.
            It is highly recommended to leave it enabled."></HelpTooltip>
        </Stack>
      </FormControl>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="bss"
                checked={bssValue}
                onChange={(event) => {
                  setBssValue(event.target.checked);
                  setChangesMade(true);
                }}
              />
            }
            label="Blind Source Separation"
          />
          <HelpTooltip
            tooltip="Blind Source Separation is a technique to reduce noise from captured audio by 'focusing' on the speaker.
            It is useful in some cases but it's generally recommended to leave it disabled."></HelpTooltip>
        </Stack>
      </FormControl>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="was_mode"
                checked={wasModeValue}
                onChange={(event) => {
                  setWasModeValue(event.target.checked);
                  setChangesMade(true);
                }}
              />
            }
            label="WAS Command Endpoint (EXPERIMENTAL)"
          />
          <HelpTooltip tooltip="Use WAS for connection to configured command endpoint."></HelpTooltip>
        </Stack>
      </FormControl>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="multiwake"
                checked={multiwakeValue}
                onChange={(event) => {
                  setMultiwakeValue(event.target.checked);
                  setChangesMade(true);
                }}
              />
            }
            label="Willow One Wake (EXPERIMENTAL)"
          />
          <HelpTooltip
            tooltip="When you have multiple clients close enough to wake at the same time it's annoying.
          Willow One Wake (WOW) is an experimental feature to only capture audio on the client closest to the person speaking."></HelpTooltip>
        </Stack>
      </FormControl>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="show_prereleases"
                checked={showPrereleasesValue}
                onChange={(event) => {
                  setShowPrereleasesValue(event.target.checked);
                  setChangesMade(true);
                }}
              />
            }
            label="Show Prereleases"
          />
          <HelpTooltip tooltip="Enabling this setting will show Willow Pre-Release Builds in the Upgrade dialogs for Clients."></HelpTooltip>
        </Stack>
      </FormControl>
      <EnumSelectHelper
        name="audio_codec"
        value={audioCodecValue}
        onChange={(event) => {
          setAudioCodecValue(event.target.value as keyof typeof AUDIO_CODECS);
          setChangesMade(true);
        }}
        label="Audio Codec to use for streaming to WIS"
        options={AUDIO_CODECS}
        tooltip="PCM is more accurate but uses more WiFi bandwidth.
        If you have an especially challenging WiFi environment you can try enabling compression (AMR-WB)."
      />
      <EnumSelectHelper
        name="vad_mode"
        value={vadModeValue.toString()}
        label="Voice Activity Detection Mode"
        options={VAD_MODES.map((v) => v.toString())}
        onChange={(event) => {
          setVadModeValue(event.target.value as keyof typeof VAD_MODES);
          setChangesMade(true);
        }}
        tooltip="If Willow thinks you stop talking too soon or too late you can change the aggressiveness of Voice Activity Mode (VAD).
        Higher values are more likely to end the voice session earlier."
      />
      <EnumSelectHelper
        name="wake_mode"
        value={wakeModeValue.toString()}
        label="Wake Word Recognition Mode"
        options={WAKE_MODES}
        onChange={(event) => {
          setWakeModeValue(event.target.value as keyof typeof WAKE_MODES);
          setChangesMade(true);
        }}
        tooltip="Wake Word Recognition Mode generally configures the sensitivity of detecting the wake word.
        Higher values are more sensitive but can lead to Willow waking up when it shouldn't."
      />
      <InputLabel>Microphone Gain</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="mic_gain"
          value={micGainValue}
          min={0}
          max={14}
          size="small"
          onChange={handleMicGainSliderChange}
          valueLabelDisplay="auto"
        />
        <Input
          value={micGainValue}
          size="small"
          onChange={handleMicGainInputChange}
          onBlur={handleMicGainBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 14,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
        <HelpTooltip
          tooltip="General audio capture volume level.
        Has wide ranging effects from wake sensitivity to speech recognition accuracy."
        />
      </Stack>
      <InputLabel>Record Buffer</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="record_buffer"
          value={recordBufferValue}
          onChange={handleRecordBufferSliderChange}
          min={0}
          max={16}
          size="small"
          valueLabelDisplay="auto"
        />
        <Input
          value={recordBufferValue}
          size="small"
          onChange={handleRecordBufferInputChange}
          onBlur={handleRecordBufferBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 16,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
        <HelpTooltip
          tooltip="Record buffer configures the timing between when the client wakes and when it starts capturing commands.
        Users with a local WIS instance may want to try setting lower (10 or so)."></HelpTooltip>
      </Stack>
      <InputLabel>Maximum speech duration</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="stream_timeout"
          value={streamTimeoutValue}
          onChange={handleStreamTimeoutSliderChange}
          min={1}
          max={30}
          size="small"
          valueLabelDisplay="auto"
        />
        <Input
          value={streamTimeoutValue}
          size="small"
          onChange={handleStreamTimeoutInputChange}
          onBlur={handleStreamTimeoutBlur}
          inputProps={{
            step: 1,
            min: 1,
            max: 30,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
        <HelpTooltip tooltip="How long to wait after wake starts to force the end of recognition."></HelpTooltip>
      </Stack>
      <InputLabel>VAD Timeout</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="vad_timeout"
          value={vadTimeoutValue}
          onChange={handleVADTimeoutSliderChange}
          min={0}
          max={1000}
          size="small"
          valueLabelDisplay="auto"
        />
        <Input
          value={vadTimeoutValue}
          size="small"
          onChange={handleVADTimeoueInputChange}
          onBlur={handleVADTimeoutBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 1000,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
        <HelpTooltip
          tooltip="How long to wait after end of speech to end audio capture.
        Improves response times but can also clip speech if you do not talk fast enough.
        Allows for entering 1 - 1000 ms but if you go lower than 100 or so good luck!"></HelpTooltip>
      </Stack>
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="flex-end">
        <Button id="save" type="submit" variant="outlined">
          Save Settings
        </Button>
        <HelpTooltip
          tooltip="Save your configuration to WAS.
          If you want to test your configuration you can go to the Clients page to save to individual clients."></HelpTooltip>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }} justifyContent="flex-end">
        <Button id="saveAndApply" type="submit" variant="outlined">
          Save Settings & Apply Everywhere
        </Button>
        <HelpTooltip tooltip="Save your configuration to WAS and apply to all connected clients immediately."></HelpTooltip>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }} justifyContent="flex-end">
        <Button id="resetFormToDefaults" type="button" variant="outlined" onClick={handleResetForm}>
          Reset to Defaults
        </Button>
        <HelpTooltip tooltip="Set all values to their default. These will not be saved until you click Save or Save & Apply Everywhere."></HelpTooltip>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{ display: changesMade ? undefined : 'none' }}
        justifyContent="flex-end">
        <Button id="undoChanges" type="button" variant="outlined" onClick={handleUndoChanges}>
          Undo Changes
        </Button>
        <HelpTooltip tooltip="Undo any changes made to your configuration."></HelpTooltip>
      </Stack>
    </form>
  );
}

function GeneralSettings() {
  const [loading, setLoading] = React.useState(true);

  const [showHaToken, setShowHaToken] = React.useState(false);
  const handleClickShowHaToken = () => setShowHaToken(!showHaToken);
  const handleMouseDownHaToken = () => setShowHaToken(!showHaToken);

  const [showOhToken, setShowOhToken] = React.useState(false);
  const handleClickShowOhToken = () => setShowOhToken(!showOhToken);
  const handleMouseDownOhToken = () => setShowOhToken(!showOhToken);

  const [showRestPassword, setShowRestPassword] = React.useState(false);
  const handleClickShowRestPassword = () => setShowRestPassword(!showRestPassword);
  const handleMouseDownRestPassword = () => setShowRestPassword(!showRestPassword);

  const { data: generalSettings, error: generalSettingsError } =
    useSWR<GeneralSettings>('/api/config?type=config');
  const { data: defaultGeneralSettings, error: defaultGeneralSettingsError } =
    useSWR<GeneralSettings>('/api/config?type=config&default=true');
  const { data: tzDictionary, error: tzDictionaryError } =
    useSWR<TZDictionary>('/api/config?type=tz');

  const [changesMade, setChangesMade] = React.useState(false);

  // Field States
  const [speechRecModeValue, setSpeechRecModeValue] = React.useState(
    (generalSettings?.speech_rec_mode ??
      defaultGeneralSettings?.speech_rec_mode) as keyof typeof SPEECH_REC_MODE
  );
  const [wisUrlValue, setWisUrlValue] = React.useState(
    generalSettings?.wis_url ?? defaultGeneralSettings?.wis_url
  );
  const [audioResponseTypeValue, setAudioResponseTypeValue] = React.useState(
    (generalSettings?.audio_response_type ??
      defaultGeneralSettings?.audio_response_type) as keyof typeof AUDIO_RESPONSE_TYPE
  );
  const [wisTtsUrlValue, setWisTtsUrlValue] = React.useState(
    generalSettings?.wis_tts_url ?? defaultGeneralSettings?.wis_tts_url
  );
  const [wakeWordValue, setWakeWordValue] = React.useState(
    (generalSettings?.wake_word ?? defaultGeneralSettings?.wake_word) as keyof typeof WAKE_WORDS
  );
  const [commandEndpointValue, setCommandEndpointValue] = React.useState(
    (generalSettings?.command_endpoint ??
      defaultGeneralSettings?.command_endpoint) as keyof typeof COMMAND_ENDPOINT
  );
  const [hassHostValue, setHassHostValue] = React.useState(
    generalSettings?.hass_host ?? defaultGeneralSettings?.hass_host
  );
  const [hassPortValue, setHassPortValue] = React.useState(
    generalSettings?.hass_port ?? defaultGeneralSettings?.hass_port
  );
  const [hassTlsValue, setHassTlsValue] = React.useState(
    generalSettings?.hass_tls ?? defaultGeneralSettings?.hass_tls
  );
  const [hassTokenValue, setHassTokenValue] = React.useState(
    generalSettings?.hass_token ?? defaultGeneralSettings?.hass_token
  );
  const [openhabUrlValue, setOpenhabUrlValue] = React.useState(
    generalSettings?.openhab_url ?? defaultGeneralSettings?.openhab_url
  );
  const [openhabTokenValue, setOpenhabTokenValue] = React.useState(
    generalSettings?.openhab_token ?? defaultGeneralSettings?.openhab_token
  );
  const [restUrlValue, setRestUrlValue] = React.useState(
    generalSettings?.rest_url ?? defaultGeneralSettings?.rest_url
  );
  const [restAuthTypeValue, setRestAuthTypeValue] = React.useState(
    (generalSettings?.rest_auth_type ??
      defaultGeneralSettings?.rest_auth_type) as keyof typeof REST_AUTH_TYPES
  );
  const [restAuthUserValue, setRestAuthUserValue] = React.useState(
    generalSettings?.rest_auth_user ?? defaultGeneralSettings?.rest_auth_user
  );
  const [restAuthPassValue, setRestAuthPassValue] = React.useState(
    generalSettings?.rest_auth_pass ?? defaultGeneralSettings?.rest_auth_pass
  );
  const [restAuthHeaderValue, setRestAuthHeaderValue] = React.useState(
    generalSettings?.rest_auth_header ?? defaultGeneralSettings?.rest_auth_header
  );
  const [speakerVolumeValue, setSpeakerVolumeValue] = React.useState(
    generalSettings?.speaker_volume ?? defaultGeneralSettings?.speaker_volume
  );
  const [lcdBrightnessValue, setLcdBrightnessValue] = React.useState(
    generalSettings?.lcd_brightness ?? defaultGeneralSettings?.lcd_brightness
  );
  const [displayTimeoutValue, setDisplayTimeoutValue] = React.useState(
    generalSettings?.display_timeout ?? defaultGeneralSettings?.display_timeout
  );
  const [wakeConfirmationValue, setWakeConfirmationValue] = React.useState(
    generalSettings?.wake_confirmation ?? defaultGeneralSettings?.wake_confirmation
  );
  const [timezoneValue, setTimezoneValue] = React.useState(
    generalSettings?.timezone_name ?? defaultGeneralSettings?.timezone_name
  );
  const [ntpConfigValue, setNtpConfigValue] = React.useState(
    (generalSettings?.ntp_config ?? defaultGeneralSettings?.ntp_config) as keyof typeof NTP_CONFIG
  );
  const [ntpHostValue, setNtpHostValue] = React.useState(
    generalSettings?.ntp_host ?? defaultGeneralSettings?.ntp_host
  );

  // Handlers for Speaker Volume Slider and Input
  const handleSpeakerVolumeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpeakerVolumeValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleSpeakerVolumeSliderChange = (event: Event, newValue: number | number[]) => {
    setSpeakerVolumeValue(newValue as number);
    setChangesMade(true);
  };

  const handleSpeakerVolumeBlur = () => {
    if (speakerVolumeValue && speakerVolumeValue < 0) {
      setSpeakerVolumeValue(0);
    } else if (speakerVolumeValue && speakerVolumeValue > 100) {
      setSpeakerVolumeValue(100);
    } else if (!speakerVolumeValue) {
      setSpeakerVolumeValue(
        generalSettings?.speaker_volume ?? defaultGeneralSettings?.speaker_volume
      );
    }
    setChangesMade(true);
  };

  // Handlers for LCD Brightness Slider and Input
  const handleLcdBrightnessInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLcdBrightnessValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleLcdBrightnessSliderChange = (event: Event, newValue: number | number[]) => {
    setLcdBrightnessValue(newValue as number);
    setChangesMade(true);
  };

  const handleLcdBrightnessBlur = () => {
    if (lcdBrightnessValue && lcdBrightnessValue < 0) {
      setLcdBrightnessValue(0);
    } else if (lcdBrightnessValue && lcdBrightnessValue > 1023) {
      setLcdBrightnessValue(1023);
    } else if (!lcdBrightnessValue) {
      setLcdBrightnessValue(
        generalSettings?.lcd_brightness ?? defaultGeneralSettings?.lcd_brightness
      );
    }
    setChangesMade(true);
  };

  // Handlers for Display Timeout Slider and Input
  const handleDisplayTimeoutInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayTimeoutValue(event.target.value === '' ? undefined : Number(event.target.value));
    setChangesMade(true);
  };

  const handleDisplayTimeoutSliderChange = (event: Event, newValue: number | number[]) => {
    setDisplayTimeoutValue(newValue as number);
    setChangesMade(true);
  };

  const handleDisplayTimeoutBlur = () => {
    if (displayTimeoutValue && displayTimeoutValue < 1) {
      setDisplayTimeoutValue(1);
    } else if (displayTimeoutValue && displayTimeoutValue > 60) {
      setDisplayTimeoutValue(60);
    } else if (!displayTimeoutValue) {
      setDisplayTimeoutValue(
        generalSettings?.display_timeout ?? defaultGeneralSettings?.display_timeout
      );
    }
    setChangesMade(true);
  };

  React.useEffect(() => {
    if (generalSettings && defaultGeneralSettings && tzDictionary) {
      setSpeechRecModeValue(
        (generalSettings?.speech_rec_mode ??
          defaultGeneralSettings?.speech_rec_mode) as keyof typeof SPEECH_REC_MODE
      );
      setWisUrlValue(generalSettings?.wis_url ?? defaultGeneralSettings?.wis_url);
      setAudioResponseTypeValue(
        (generalSettings?.audio_response_type ??
          defaultGeneralSettings?.audio_response_type) as keyof typeof AUDIO_RESPONSE_TYPE
      );
      setWisTtsUrlValue(generalSettings?.wis_tts_url ?? defaultGeneralSettings?.wis_tts_url);
      setWakeWordValue(
        (generalSettings?.wake_word ?? defaultGeneralSettings?.wake_word) as keyof typeof WAKE_WORDS
      );
      setCommandEndpointValue(
        (generalSettings?.command_endpoint ??
          defaultGeneralSettings?.command_endpoint) as keyof typeof COMMAND_ENDPOINT
      );
      setHassHostValue(generalSettings?.hass_host ?? defaultGeneralSettings?.hass_host);
      setHassPortValue(generalSettings?.hass_port ?? defaultGeneralSettings?.hass_port);
      setHassTlsValue(generalSettings?.hass_tls ?? defaultGeneralSettings?.hass_tls);
      setHassTokenValue(generalSettings?.hass_token ?? defaultGeneralSettings?.hass_token);
      setOpenhabUrlValue(generalSettings?.openhab_url ?? defaultGeneralSettings?.openhab_url);
      setOpenhabTokenValue(generalSettings?.openhab_token ?? defaultGeneralSettings?.openhab_token);
      setRestUrlValue(generalSettings?.rest_url ?? defaultGeneralSettings?.rest_url);
      setRestAuthTypeValue(
        (generalSettings?.rest_auth_type ??
          defaultGeneralSettings?.rest_auth_type) as keyof typeof REST_AUTH_TYPES
      );
      setRestAuthUserValue(
        generalSettings?.rest_auth_user ?? defaultGeneralSettings?.rest_auth_user
      );
      setRestAuthPassValue(
        generalSettings?.rest_auth_pass ?? defaultGeneralSettings?.rest_auth_pass
      );
      setRestAuthHeaderValue(
        generalSettings?.rest_auth_header ?? defaultGeneralSettings?.rest_auth_header
      );
      setSpeakerVolumeValue(
        generalSettings?.speaker_volume ?? defaultGeneralSettings?.speaker_volume
      );
      setLcdBrightnessValue(
        generalSettings?.lcd_brightness ?? defaultGeneralSettings?.lcd_brightness
      );
      setDisplayTimeoutValue(
        generalSettings?.display_timeout ?? defaultGeneralSettings?.display_timeout
      );
      setWakeConfirmationValue(
        generalSettings?.wake_confirmation ?? defaultGeneralSettings?.wake_confirmation
      );
      setTimezoneValue(generalSettings?.timezone_name ?? defaultGeneralSettings?.timezone_name);
      setNtpConfigValue(
        (generalSettings?.ntp_config ??
          defaultGeneralSettings?.ntp_config) as keyof typeof NTP_CONFIG
      );
      setNtpHostValue(generalSettings?.ntp_host ?? defaultGeneralSettings?.ntp_host);
      setLoading(false);
    }
  }, [generalSettings, defaultGeneralSettings, tzDictionary]);

  const onboardingState = React.useContext(OnboardingContext);

  // Handler to reset field values to defaults
  const handleResetForm = () => {
    setSpeechRecModeValue(defaultGeneralSettings?.speech_rec_mode as keyof typeof SPEECH_REC_MODE);
    setWisUrlValue(defaultGeneralSettings?.wis_url);
    setAudioResponseTypeValue(
      defaultGeneralSettings?.audio_response_type as keyof typeof AUDIO_RESPONSE_TYPE
    );
    setWisTtsUrlValue(defaultGeneralSettings?.wis_tts_url);
    setWakeWordValue(defaultGeneralSettings?.wake_word as keyof typeof WAKE_WORDS);
    setCommandEndpointValue(
      defaultGeneralSettings?.command_endpoint as keyof typeof COMMAND_ENDPOINT
    );
    setHassHostValue(defaultGeneralSettings?.hass_host);
    setHassPortValue(defaultGeneralSettings?.hass_port);
    setHassTlsValue(defaultGeneralSettings?.hass_tls);
    setHassTokenValue(defaultGeneralSettings?.hass_token);
    setOpenhabUrlValue(defaultGeneralSettings?.openhab_url);
    setOpenhabTokenValue(defaultGeneralSettings?.openhab_token);
    setRestUrlValue(defaultGeneralSettings?.rest_url);
    setRestAuthTypeValue(defaultGeneralSettings?.rest_auth_type as keyof typeof REST_AUTH_TYPES);
    setRestAuthUserValue(defaultGeneralSettings?.rest_auth_user);
    setRestAuthPassValue(defaultGeneralSettings?.rest_auth_pass);
    setRestAuthHeaderValue(defaultGeneralSettings?.rest_auth_header);
    setSpeakerVolumeValue(defaultGeneralSettings?.speaker_volume);
    setLcdBrightnessValue(defaultGeneralSettings?.lcd_brightness);
    setDisplayTimeoutValue(defaultGeneralSettings?.display_timeout);
    setWakeConfirmationValue(defaultGeneralSettings?.wake_confirmation);
    setTimezoneValue(defaultGeneralSettings?.timezone_name);
    setNtpConfigValue(defaultGeneralSettings?.ntp_config as keyof typeof NTP_CONFIG);
    setNtpHostValue(defaultGeneralSettings?.ntp_host);
    setChangesMade(true);
  };

  // Handler to undo changes
  const handleUndoChanges = () => {
    setSpeechRecModeValue(
      (generalSettings?.speech_rec_mode ??
        defaultGeneralSettings?.speech_rec_mode) as keyof typeof SPEECH_REC_MODE
    );
    setWisUrlValue(generalSettings?.wis_url ?? defaultGeneralSettings?.wis_url);
    setAudioResponseTypeValue(
      (generalSettings?.audio_response_type ??
        defaultGeneralSettings?.audio_response_type) as keyof typeof AUDIO_RESPONSE_TYPE
    );
    setWisTtsUrlValue(generalSettings?.wis_tts_url ?? defaultGeneralSettings?.wis_tts_url);
    setWakeWordValue(
      (generalSettings?.wake_word ?? defaultGeneralSettings?.wake_word) as keyof typeof WAKE_WORDS
    );
    setCommandEndpointValue(
      (generalSettings?.command_endpoint ??
        defaultGeneralSettings?.command_endpoint) as keyof typeof COMMAND_ENDPOINT
    );
    setHassHostValue(generalSettings?.hass_host ?? defaultGeneralSettings?.hass_host);
    setHassPortValue(generalSettings?.hass_port ?? defaultGeneralSettings?.hass_port);
    setHassTlsValue(generalSettings?.hass_tls ?? defaultGeneralSettings?.hass_tls);
    setHassTokenValue(generalSettings?.hass_token ?? defaultGeneralSettings?.hass_token);
    setOpenhabUrlValue(generalSettings?.openhab_url ?? defaultGeneralSettings?.openhab_url);
    setOpenhabTokenValue(generalSettings?.openhab_token ?? defaultGeneralSettings?.openhab_token);
    setRestUrlValue(generalSettings?.rest_url ?? defaultGeneralSettings?.rest_url);
    setRestAuthTypeValue(
      (generalSettings?.rest_auth_type ??
        defaultGeneralSettings?.rest_auth_type) as keyof typeof REST_AUTH_TYPES
    );
    setRestAuthUserValue(generalSettings?.rest_auth_user ?? defaultGeneralSettings?.rest_auth_user);
    setRestAuthPassValue(generalSettings?.rest_auth_pass ?? defaultGeneralSettings?.rest_auth_pass);
    setRestAuthHeaderValue(
      generalSettings?.rest_auth_header ?? defaultGeneralSettings?.rest_auth_header
    );
    setSpeakerVolumeValue(
      generalSettings?.speaker_volume ?? defaultGeneralSettings?.speaker_volume
    );
    setLcdBrightnessValue(
      generalSettings?.lcd_brightness ?? defaultGeneralSettings?.lcd_brightness
    );
    setDisplayTimeoutValue(
      generalSettings?.display_timeout ?? defaultGeneralSettings?.display_timeout
    );
    setWakeConfirmationValue(
      generalSettings?.wake_confirmation ?? defaultGeneralSettings?.wake_confirmation
    );
    setTimezoneValue(generalSettings?.timezone_name ?? defaultGeneralSettings?.timezone_name);
    setNtpConfigValue(
      (generalSettings?.ntp_config ?? defaultGeneralSettings?.ntp_config) as keyof typeof NTP_CONFIG
    );
    setNtpHostValue(generalSettings?.ntp_host ?? defaultGeneralSettings?.ntp_host);
    setChangesMade(false);
  };

  return loading || !(generalSettings && defaultGeneralSettings && tzDictionary) ? (
    <LoadingSpinner />
  ) : (
    <form
      name="general-settings-form"
      onSubmit={(event) =>
        handleSubmit(event, tzDictionary, !onboardingState.isOnboardingComplete)
      }>
      <EnumSelectHelper
        name="speech_rec_mode"
        value={speechRecModeValue}
        onChange={(event) => {
          setSpeechRecModeValue(event.target.value as keyof typeof SPEECH_REC_MODE);
          setChangesMade(true);
        }}
        label="Speech Recognition Mode"
        options={SPEECH_REC_MODE}
        tooltip=" Willow Inference Server mode uses the configured URL to stream your speech to a very high quality speech recognition implementation powered by WIS."
      />
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
        <TextField
          name="wis_url"
          value={wisUrlValue}
          onChange={(event) => {
            setWisUrlValue(event.target.value);
            setChangesMade(true);
          }}
          required
          label="Willow Inference Server Speech Recognition URL"
          margin="dense"
          variant="outlined"
          size="small"
          fullWidth
        />
        <HelpTooltip
          tooltip="The URL for a Willow Inference Server instance.
        Our best-effort hosted instance is provided by default but you should really setup your own!"
        />
      </Stack>
      <EnumSelectHelper
        name="audio_response_type"
        value={audioResponseTypeValue}
        onChange={(event) => {
          setAudioResponseTypeValue(event.target.value as keyof typeof AUDIO_RESPONSE_TYPE);
          setChangesMade(true);
        }}
        label="Willow Audio Response Type"
        options={AUDIO_RESPONSE_TYPE}
        tooltip="Text to Speech uses the configured Willow Inference Server (WIS) to speak the result of your command.
        Chimes plays success/failure tones depending on the response from your command endpoint.
        Silence has no audio output."
      />
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
        <TextField
          name="wis_tts_url"
          value={wisTtsUrlValue}
          onChange={(event) => {
            setWisTtsUrlValue(event.target.value);
            setChangesMade(true);
          }}
          required
          label="Willow Inference Server Text to Speech URL"
          margin="dense"
          variant="outlined"
          size="small"
          fullWidth
        />
        <HelpTooltip
          tooltip="The URL for the TTS API. 
        Our best-effort hosted instance is provided by default but you should really setup your own!"
        />
      </Stack>
      <EnumSelectHelper
        name="wake_word"
        value={wakeWordValue}
        onChange={(event) => {
          setWakeWordValue(event.target.value as keyof typeof WAKE_WORDS);
          setChangesMade(true);
        }}
        label="Wake Word"
        options={WAKE_WORDS}
        tooltip="Alexa is pretty easy for everyone.
        Hi ESP generally needs to be said very clearly.
        Hi Lexin uses Chinese pronunciation which can be difficult for non-native speakers.
        More wake words coming soon!"
      />
      <EnumSelectHelper
        name="command_endpoint"
        value={commandEndpointValue}
        onChange={(event) => {
          setCommandEndpointValue(event.target.value as keyof typeof COMMAND_ENDPOINT);
          setChangesMade(true);
        }}
        label="Command Endpoint"
        options={COMMAND_ENDPOINT}
        tooltip="When Willow recognizes speech we need to send the transcript somewhere to execute your commands.
        Select your favorite platform here or use REST for your own!"
      />
      {commandEndpointValue == 'Home Assistant' && (
        <>
          <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="space-between">
            <TextField
              name="hass_host"
              value={hassHostValue}
              onChange={(event) => {
                setHassHostValue(event.target.value);
                setChangesMade(true);
              }}
              required
              label="Home Assistant Host"
              margin="dense"
              variant="outlined"
              size="small"
              fullWidth
            />
            <HelpTooltip tooltip="The IP address or Hostname of your Home Assistant server." />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="space-between">
            <TextField
              name="hass_port"
              value={hassPortValue}
              onChange={(event) => {
                setHassPortValue(parseIntOrUndef(event.target.value));
                setChangesMade(true);
              }}
              type="number"
              required
              label="Home Assistant Port"
              margin="dense"
              variant="outlined"
              size="small"
              fullWidth
            />
            <HelpTooltip tooltip="The port your Home Assistant server is listening on. On a default Home Assistant install this is 8123." />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="space-between">
            <TextField
              name="hass_token"
              value={hassTokenValue}
              onChange={(event) => {
                setHassTokenValue(event.target.value);
                setChangesMade(true);
              }}
              required
              label="Home Assistant Token"
              margin="dense"
              variant="outlined"
              type={showHaToken ? 'text' : 'password'}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle ha token visibility"
                      onClick={handleClickShowHaToken}
                      onMouseDown={handleMouseDownHaToken}>
                      {showHaToken ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <HelpTooltip tooltip="The Long-Lived Access Token generated in Home Assistant." />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ mt: 1 }} justifyContent="space-between">
            <FormControlLabel
              control={
                <Checkbox
                  name="hass_tls"
                  checked={hassTlsValue}
                  onChange={(event) => {
                    setHassTlsValue(event.target.checked);
                    setChangesMade(true);
                  }}
                />
              }
              label="Use TLS with Home Assistant"
            />
            <HelpTooltip tooltip="Whether or not your Home Assistant server is using https." />
          </Stack>
        </>
      )}
      {commandEndpointValue == 'openHAB' && (
        <>
          <TextField
            name="openhab_url"
            value={openhabUrlValue}
            onChange={(event) => {
              setOpenhabUrlValue(event.target.value);
              setChangesMade(true);
            }}
            required
            label="openHAB URL"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            name="openhab_token"
            value={openhabTokenValue}
            onChange={(event) => {
              setOpenhabTokenValue(event.target.value);
              setChangesMade(true);
            }}
            required
            label="openHAB Token"
            margin="dense"
            variant="outlined"
            type={showOhToken ? 'text' : 'password'}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle oh token visibility"
                    onClick={handleClickShowOhToken}
                    onMouseDown={handleMouseDownOhToken}>
                    {showOhToken ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}
      {commandEndpointValue == 'REST' && (
        <>
          <TextField
            name="rest_url"
            value={restUrlValue}
            onChange={(event) => {
              setRestUrlValue(event.target.value);
              setChangesMade(true);
            }}
            required
            label="REST URL"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <EnumSelectHelper
            name="rest_auth_type"
            value={restAuthTypeValue.toString()}
            onChange={(event) => {
              setRestAuthTypeValue(event.target.value as keyof typeof REST_AUTH_TYPES);
              setChangesMade(true);
            }}
            label="REST Authentication Method"
            options={REST_AUTH_TYPES}
          />
          {restAuthTypeValue.toString() == 'Basic' && (
            <>
              <TextField
                name="rest_auth_user"
                value={restAuthUserValue}
                onChange={(event) => {
                  setRestAuthUserValue(event.target.value);
                  setChangesMade(true);
                }}
                required
                label="REST Basic Username"
                margin="dense"
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                name="rest_auth_pass"
                value={restAuthPassValue}
                onChange={(event) => {
                  setRestAuthPassValue(event.target.value);
                  setChangesMade(true);
                }}
                required
                label="REST Basic Password"
                margin="dense"
                variant="outlined"
                type={showRestPassword ? 'text' : 'password'}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle rest password visibility"
                        onClick={handleClickShowRestPassword}
                        onMouseDown={handleMouseDownRestPassword}>
                        {showRestPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          {restAuthTypeValue.toString() == 'Header' && (
            <>
              <TextField
                name="rest_auth_header"
                value={restAuthHeaderValue}
                onChange={(event) => {
                  setRestAuthHeaderValue(event.target.value);
                  setChangesMade(true);
                }}
                required
                label="REST Authentication Header"
                margin="dense"
                variant="outlined"
                size="small"
                fullWidth
              />
            </>
          )}
        </>
      )}
      <FormControl fullWidth>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="wake_confirmation"
                checked={wakeConfirmationValue}
                onChange={(event) => {
                  setWakeConfirmationValue(event.target.checked);
                  setChangesMade(true);
                }}
              />
            }
            label="Wake Confirmation Tone"
          />
          <HelpTooltip tooltip="Enabling this option will have your Willow devices chime when activated by the wake word."></HelpTooltip>
        </Stack>
      </FormControl>
      <InputLabel>Speaker Volume</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <VolumeDown />
        <Slider
          name="speaker_volume"
          value={speakerVolumeValue}
          onChange={handleSpeakerVolumeSliderChange}
          min={0}
          max={100}
          size="small"
          valueLabelDisplay="auto"
        />
        <VolumeUp />
        <Input
          value={speakerVolumeValue}
          size="small"
          onChange={handleSpeakerVolumeInputChange}
          onBlur={handleSpeakerVolumeBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 100,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
      </Stack>
      <InputLabel>LCD Brightness</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Brightness4Icon />
        <Slider
          name="lcd_brightness"
          value={lcdBrightnessValue}
          onChange={handleLcdBrightnessSliderChange}
          min={0}
          max={1023}
          size="small"
          valueLabelDisplay="auto"
        />
        <Brightness5Icon />
        <Input
          value={lcdBrightnessValue}
          size="small"
          onChange={handleLcdBrightnessInputChange}
          onBlur={handleLcdBrightnessBlur}
          inputProps={{
            step: 1,
            min: 0,
            max: 1023,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
      </Stack>
      <InputLabel>Display Timeout</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <HourglassEmpty />
        <Slider
          name="display_timeout"
          value={displayTimeoutValue}
          onChange={handleDisplayTimeoutSliderChange}
          min={1}
          max={60}
          size="small"
          valueLabelDisplay="auto"
        />
        <HourglassFull />
        <Input
          value={displayTimeoutValue}
          size="small"
          onChange={handleDisplayTimeoutInputChange}
          onBlur={handleDisplayTimeoutBlur}
          inputProps={{
            step: 1,
            min: 1,
            max: 60,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
      </Stack>
      <FormControl
        fullWidth
        size="small"
        margin="dense"
        variant="outlined"
        required
        sx={{ flexDirection: 'row' }}>
        <InputLabel id="timezone">Timezone</InputLabel>
        <Select
          name="timezone"
          value={timezoneValue}
          defaultValue=""
          label="Timezone Setting"
          onChange={(event) => {
            setTimezoneValue(event.target.value);
            setChangesMade(true);
          }}
          sx={{ flexGrow: '1' }}>
          {tzDictionary &&
            Object.entries(tzDictionary).map(([index, value]) => (
              <MenuItem key={index + value} value={index}>
                {index}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <EnumSelectHelper
        name="ntp_config"
        value={ntpConfigValue}
        onChange={(event) => {
          setNtpConfigValue(event.target.value as keyof typeof NTP_CONFIG);
          setChangesMade(true);
        }}
        label="Automatic Time and Date (NTP)"
        options={NTP_CONFIG}
        tooltip="If your DHCP server provides an NTP server DHCP option you can select DHCP.
        If you don't know what this means use an NTP host."
      />
      {ntpConfigValue == 'Host' && (
        <>
          <TextField
            name="ntp_host"
            value={ntpHostValue}
            onChange={(event) => {
              setNtpHostValue(event.target.value);
              setChangesMade(true);
            }}
            required
            label="NTP Server"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
        </>
      )}
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="flex-end">
        <Button id="save" type="submit" variant="outlined">
          Save Settings
        </Button>
        <HelpTooltip
          tooltip="Save your configuration to WAS.
          If you want to test your configuration you can go to the Clients page to save to individual clients."></HelpTooltip>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 1, display: onboardingState.isOnboardingComplete ? undefined : 'none' }}
        justifyContent="flex-end">
        <Button id="saveAndApply" type="submit" variant="outlined">
          Save Settings & Apply Everywhere
        </Button>
        <HelpTooltip tooltip="Save your configuration to WAS and apply to all connected clients immediately."></HelpTooltip>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }} justifyContent="flex-end">
        <Button id="resetFormToDefaults" type="button" variant="outlined" onClick={handleResetForm}>
          Reset to Defaults
        </Button>
        <HelpTooltip tooltip="Set all values to their default. These will not be saved until you click Save or Save & Apply Everywhere."></HelpTooltip>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{ display: changesMade && onboardingState.isOnboardingComplete ? undefined : 'none' }}
        justifyContent="flex-end">
        <Button id="undoChanges" type="button" variant="outlined" onClick={handleUndoChanges}>
          Undo Changes
        </Button>
        <HelpTooltip tooltip="Undo any changes made to your configuration."></HelpTooltip>
      </Stack>
    </form>
  );
}

function ConnectionSettings() {
  const [loading, setLoading] = React.useState(true);
  const [showPsk, setShowPsk] = React.useState(false);
  const handleClickShowPsk = () => setShowPsk(!showPsk);
  const handleMouseDownPsk = () => setShowPsk(!showPsk);
  const { data, error } = useSWR<NvsSettings>('/api/config?type=nvs');

  React.useEffect(() => {
    if (data) setLoading(false);
  }, [data]);

  const onboardingContext = React.useContext(OnboardingContext);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target as any).entries()) as Record<
      string,
      string
    >;
    const apply = (event.nativeEvent as any).submitter.id == 'saveAndApply';
    const body: NvsSettings = {
      WAS: { URL: data.url },
      WIFI: { PSK: data.psk, SSID: data.ssid },
    };

    try {
      await post(apply ? '/api/config?type=nvs&apply=1' : '/api/config?type=nvs&apply=0', body);
      await Promise.all([mutate('/api/config?type=nvs'), mutate('/api/client')]);
    } catch (e) {
      console.error(`Save connectivity settings failed with ${e}`);
      toast.error(`Saving connectivity settings to WAS failed!`);
      return e;
    }
    if (apply) {
      toast.success('Connectivity configuration settings saved and applied!');
    } else {
      toast.success('Connectivity configuration settings saved!');
    }
  }

  return loading || !data ? (
    <LoadingSpinner />
  ) : (
    <form onSubmit={handleSubmit}>
      <TextField
        name="url"
        defaultValue={data.WAS?.URL ? data?.WAS?.URL : WAS_URL}
        required
        label="Willow Application Server URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="ssid"
        defaultValue={data.WIFI?.SSID}
        required
        label="WiFi Network Name"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="psk"
        defaultValue={data.WIFI?.PSK}
        required
        label="WiFi Network Password"
        margin="dense"
        variant="outlined"
        type={showPsk ? 'text' : 'password'}
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle psk visibility"
                onClick={handleClickShowPsk}
                onMouseDown={handleMouseDownPsk}>
                {showPsk ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/*XXX: this does not seem to work in current UI? <FormControlLabel control={<Checkbox />} label="Skip connectivity checks" />*/}
      <Stack direction="row" spacing={2} sx={{ mb: 1, mt: 1 }} justifyContent="flex-end">
        <Button id="save" type="submit" variant="outlined">
          Save Connection Settings
        </Button>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 1, mt: 1, display: onboardingContext.isOnboardingComplete ? undefined : 'none' }}
        justifyContent="flex-end">
        <Button id="saveAndApply" type="submit" variant="outlined">
          Save Connection Settings & Apply Everywhere
        </Button>
      </Stack>
    </form>
  );
}

function SettingsAccordions() {
  const onboardingState = React.useContext(OnboardingContext);
  const initialAccordion = onboardingState.isNvsComplete ? 'General' : 'Connectivity';
  const [expanded, setExpanded] = React.useState<string | false>(initialAccordion);
  const [overrideOnboarding, setOverrideOnboarding] = React.useState(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setOverrideOnboarding(true);
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Accordion
        expanded={
          onboardingState.isGeneralConfigComplete || overrideOnboarding
            ? expanded === 'Connectivity'
            : !onboardingState.isNvsComplete
        }
        onChange={handleChange('Connectivity')}
        sx={{ boxShadow: 4 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="Connectivity-content"
          id="Connectivity-header">
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Basic</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Connectivity</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ConnectionSettings></ConnectionSettings>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={
          onboardingState.isOnboardingComplete || overrideOnboarding
            ? expanded === 'General'
            : onboardingState.isNvsComplete
        }
        onChange={handleChange('General')}
        sx={{ display: onboardingState.isNvsComplete ? undefined : 'none', boxShadow: 4 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="General-content"
          id="General-header">
          <Typography sx={{ width: '33%', flexShrink: 0 }}>General</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Willow</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <GeneralSettings></GeneralSettings>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === 'Advanced'}
        onChange={handleChange('Advanced')}
        sx={{
          display: onboardingState.isGeneralConfigComplete ? undefined : 'none',
          boxShadow: 4,
        }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="Advanced-content"
          id="Advanced-header">
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Advanced</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Willow (Advanced)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AdvancedSettings></AdvancedSettings>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function GetInformationCard(showPrereleases: boolean) {
  const onboardingContext = React.useContext(OnboardingContext);

  if (onboardingContext.isOnboardingComplete) {
    return <WebFlashCard showPreReleases={showPrereleases}></WebFlashCard>;
  } else if (!onboardingContext.isNvsComplete) {
    return (
      <InformationCard title="Welcome to Willow!">
        <CardContent sx={{ textAlign: 'center' }}>
          To get started, please enter in your WiFi network and password.
          <b>SSID is case sensitive!</b>
          <br />
          We have attempted to guess your WAS url, please ensure the value is correct.
          <br />
          <b>Please Note: The WiFi network defined below must be able to access this server!</b>
        </CardContent>
      </InformationCard>
    );
  } else if (!onboardingContext.isGeneralConfigComplete) {
    return (
      <InformationCard title="Welcome to Willow!">
        <CardContent sx={{ textAlign: 'center' }}>
          Please configure your general settings. Refer to the tooltips for guidance on each config
          value.
        </CardContent>
      </InformationCard>
    );
  }
}

const Config: NextPage = () => {
  const { data: nvsData, isLoading: nvsIsLoading } = useSWR<NvsSettings>('/api/config?type=nvs');
  const { data: configData, isLoading: configIsLoading } =
    useSWR<GeneralSettings>('/api/config?type=config');
  const { data: advancedConfigData, isLoading: advancedConfigIsLoading } =
    useSWR<AdvancedSettings>('/api/config?type=config');

  return nvsIsLoading || configIsLoading || advancedConfigIsLoading ? (
    <LoadingSpinner />
  ) : (
    <LeftMenu>
      {GetInformationCard(advancedConfigData?.show_prereleases ?? false)}
      <SettingsAccordions></SettingsAccordions>
    </LeftMenu>
  );
};
export default Config;
