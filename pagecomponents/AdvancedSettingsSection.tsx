import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import * as React from 'react';
import useSWR from 'swr';
import LoadingSpinner from '../components/LoadingSpinner';
import { EnumSelectHelper, HelpTooltip, handleSubmit } from '../misc/helperfunctions';
import { AUDIO_CODECS, AdvancedSettings, TZDictionary, VAD_MODES, WAKE_MODES } from '../misc/model';
import { FormErrorContext } from '../pages/_app';

export default function AdvancedSettingsSection() {
  const formErrorContext = React.useContext(FormErrorContext);
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
    <form
      name="advanced-settings-form"
      onSubmit={(event) => handleSubmit(event, tzDictionary, formErrorContext, false)}>
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
