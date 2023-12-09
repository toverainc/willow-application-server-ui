import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import * as React from 'react';
import {
  EnumSelectHelper,
  HelpTooltip,
  handleSubmit,
  parseIntOrUndef,
  setFieldStateHelperImpl,
} from '../misc/helperfunctions';
import { AUDIO_CODECS, AdvancedSettings, TZDictionary, VAD_MODES, WAKE_MODES } from '../misc/model';
import { FormErrorContext } from '../pages/_app';

export default function AdvancedSettingsSection({
  advancedSettings,
  defaultAdvancedSettings,
  tzDictionary,
}: {
  advancedSettings: AdvancedSettings;
  defaultAdvancedSettings: AdvancedSettings;
  tzDictionary: TZDictionary;
}) {
  const formErrorContext = React.useContext(FormErrorContext);

  const [changesMade, setChangesMade] = React.useState(false);

  // Field States
  const [fieldState, setFieldState] = React.useState(
    Object.assign({}, defaultAdvancedSettings, advancedSettings)
  );
  function setFieldStateHelper<KeyType extends keyof AdvancedSettings>(
    key: KeyType,
    value: AdvancedSettings[KeyType]
  ) {
    setFieldStateHelperImpl<AdvancedSettings>(key, value, setFieldState);
  }

  // Handlers for Mic Gain Slider and Input
  const handleMicGainInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'mic_gain',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleMicGainSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('mic_gain', newValue as number);
    setChangesMade(true);
  };

  const handleMicGainBlur = () => {
    const micGainValue = fieldState.mic_gain;
    if (micGainValue && micGainValue < 0) {
      setFieldStateHelper('mic_gain', 0);
    } else if (micGainValue && micGainValue > 14) {
      setFieldStateHelper('mic_gain', 14);
    } else if (!micGainValue) {
      setFieldStateHelper(
        'mic_gain',
        advancedSettings?.mic_gain ?? defaultAdvancedSettings?.mic_gain ?? 0
      );
    }
    setChangesMade(true);
  };

  const micGainValueFormat = (value: number) => {
    return `${value}db`;
  };

  // Handlers for Record Buffer Slider and Input
  const handleRecordBufferInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'record_buffer',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleRecordBufferSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('record_buffer', newValue as number);
    setChangesMade(true);
  };

  const handleRecordBufferBlur = () => {
    const recordBufferValue = fieldState.record_buffer;
    if (recordBufferValue && recordBufferValue < 0) {
      setFieldStateHelper('record_buffer', 0);
    } else if (recordBufferValue && recordBufferValue > 16) {
      setFieldStateHelper('record_buffer', 16);
    } else if (!recordBufferValue) {
      setFieldStateHelper(
        'record_buffer',
        advancedSettings?.record_buffer ?? defaultAdvancedSettings?.record_buffer ?? 0
      );
    }
    setChangesMade(true);
  };

  // Handlers for Stream Timeout Slider and Input
  const handleStreamTimeoutInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'stream_timeout',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleStreamTimeoutSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('stream_timeout', newValue as number);
    setChangesMade(true);
  };

  const handleStreamTimeoutBlur = () => {
    const streamTimeoutValue = fieldState.stream_timeout;
    if (streamTimeoutValue && streamTimeoutValue < 1) {
      setFieldStateHelper('stream_timeout', 1);
    } else if (streamTimeoutValue && streamTimeoutValue > 30) {
      setFieldStateHelper('stream_timeout', 30);
    } else if (!streamTimeoutValue) {
      setFieldStateHelper(
        'stream_timeout',
        advancedSettings?.stream_timeout ?? defaultAdvancedSettings?.stream_timeout ?? 1
      );
    }
    setChangesMade(true);
  };

  const timeoutValueFormat = (value: number) => {
    return `${value}s`;
  };

  // Handlers for VAD Timeout Slider and Input
  const handleVADTimeoueInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'vad_timeout',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleVADTimeoutSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('vad_timeout', newValue as number);
    setChangesMade(true);
  };

  const handleVADTimeoutBlur = () => {
    const vadTimeoutValue = fieldState.vad_timeout;
    if (vadTimeoutValue && vadTimeoutValue < 0) {
      setFieldStateHelper('vad_timeout', 0);
    } else if (vadTimeoutValue && vadTimeoutValue > 1000) {
      setFieldStateHelper('vad_timeout', 1000);
    } else if (!vadTimeoutValue) {
      setFieldStateHelper(
        'vad_timeout',
        advancedSettings?.vad_timeout ?? defaultAdvancedSettings?.vad_timeout ?? 0
      );
    }
    setChangesMade(true);
  };

  const vadTimeoutValueFormat = (value: number) => {
    return `${value}ms`;
  };

  // Set initial states or refresh states on config changes
  React.useEffect(() => {
    if (advancedSettings && defaultAdvancedSettings) {
      setFieldState(Object.assign({}, defaultAdvancedSettings, advancedSettings));
    }
  }, [advancedSettings, defaultAdvancedSettings]);

  // Handler to reset field values to defaults
  const handleResetForm = () => {
    setFieldState(Object.assign({}, defaultAdvancedSettings));
    setChangesMade(true);
  };

  // Handler to undo changes
  const handleUndoChanges = () => {
    setFieldState(Object.assign({}, defaultAdvancedSettings, advancedSettings));
    setChangesMade(false);
  };

  return (
    <form
      name="advanced-settings-form"
      onSubmit={(event) => handleSubmit(event, tzDictionary, formErrorContext, false)}>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="aec"
                checked={fieldState.aec}
                onChange={(event) => {
                  setFieldStateHelper('aec', event.target.checked);
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
                checked={fieldState.bss}
                onChange={(event) => {
                  setFieldStateHelper('bss', event.target.checked);
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
                checked={fieldState.was_mode}
                onChange={(event) => {
                  setFieldStateHelper('was_mode', event.target.checked);
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
                checked={fieldState.multiwake}
                onChange={(event) => {
                  setFieldStateHelper('multiwake', event.target.checked);
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
                checked={fieldState.show_prereleases}
                onChange={(event) => {
                  setFieldStateHelper('show_prereleases', event.target.checked);
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
        value={fieldState.audio_codec}
        onChange={(event) => {
          setFieldStateHelper('audio_codec', event.target.value as keyof typeof AUDIO_CODECS);
          setChangesMade(true);
        }}
        label="Audio Codec to use for streaming to WIS"
        options={AUDIO_CODECS}
        tooltip="PCM is more accurate but uses more WiFi bandwidth.
          If you have an especially challenging WiFi environment you can try enabling compression (AMR-WB)."
      />
      <EnumSelectHelper
        name="vad_mode"
        value={fieldState.vad_mode.toString()}
        label="Voice Activity Detection Mode"
        options={VAD_MODES.map((v) => v.toString())}
        onChange={(event) => {
          setFieldStateHelper('vad_mode', parseIntOrUndef(event.target.value) ?? 1);
          setChangesMade(true);
        }}
        tooltip="If Willow thinks you stop talking too soon or too late you can change the aggressiveness of Voice Activity Mode (VAD).
          Higher values are more likely to end the voice session earlier."
      />
      <EnumSelectHelper
        name="wake_mode"
        value={fieldState.wake_mode.toString()}
        label="Wake Word Recognition Mode"
        options={WAKE_MODES}
        onChange={(event) => {
          setFieldStateHelper('wake_mode', event.target.value);
          setChangesMade(true);
        }}
        tooltip="Wake Word Recognition Mode generally configures the sensitivity of detecting the wake word.
          Higher values are more sensitive but can lead to Willow waking up when it shouldn't."
      />
      <InputLabel>Microphone Gain</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="mic_gain"
          value={fieldState.mic_gain}
          min={0}
          max={14}
          size="small"
          onChange={handleMicGainSliderChange}
          getAriaValueText={micGainValueFormat}
          valueLabelFormat={micGainValueFormat}
          valueLabelDisplay="auto"
        />
        <Input
          value={fieldState.mic_gain}
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
        db
        <HelpTooltip
          tooltip="General audio capture volume level.
          Has wide ranging effects from wake sensitivity to speech recognition accuracy."
        />
      </Stack>
      <InputLabel>Record Buffer</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="record_buffer"
          value={fieldState.record_buffer}
          onChange={handleRecordBufferSliderChange}
          min={0}
          max={16}
          size="small"
          valueLabelDisplay="auto"
        />
        <Input
          value={fieldState.record_buffer}
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
          value={fieldState.stream_timeout}
          onChange={handleStreamTimeoutSliderChange}
          min={1}
          max={30}
          size="small"
          getAriaValueText={timeoutValueFormat}
          valueLabelFormat={timeoutValueFormat}
          valueLabelDisplay="auto"
        />
        <Input
          value={fieldState.stream_timeout}
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
        s
        <HelpTooltip tooltip="How long to wait after wake starts to force the end of recognition."></HelpTooltip>
      </Stack>
      <InputLabel>VAD Timeout</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="vad_timeout"
          value={fieldState.vad_timeout}
          onChange={handleVADTimeoutSliderChange}
          min={0}
          max={1000}
          size="small"
          getAriaValueText={vadTimeoutValueFormat}
          valueLabelFormat={vadTimeoutValueFormat}
          valueLabelDisplay="auto"
        />
        <Input
          value={fieldState.vad_timeout}
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
        ms
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
