import { HourglassEmpty, HourglassFull } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import useSWR from 'swr';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  EnumSelectHelper,
  HelpTooltip,
  handleSubmit,
  setFieldStateHelperImpl,
} from '../misc/helperfunctions';
import {
  AUDIO_RESPONSE_TYPE,
  COMMAND_ENDPOINT,
  GeneralSettings,
  NTP_CONFIG,
  SPEECH_REC_MODE,
  TZDictionary,
  WAKE_WORDS,
} from '../misc/model';
import { ValidateWisTtsUrl, ValidateWisUrl } from '../misc/validations';
import { FormErrorContext, OnboardingContext } from '../pages/_app';
import HassCommandEndpoint from './HassCommandEndpoint';
import MQTTCommandEndpoint from './MQTTCommandEndpoint';
import OpenHabCommandEndpoint from './OpenHabCommandEndpoint';
import RestCommandEndpoint from './RestCommandEndpoint';

export default function GeneralSettingsSection() {
  const onboardingState = React.useContext(OnboardingContext);
  const formErrorContext = React.useContext(FormErrorContext);
  const [loading, setLoading] = React.useState(true);

  const { data: generalSettings, error: generalSettingsError } =
    useSWR<GeneralSettings>('/api/config?type=config');
  const { data: defaultGeneralSettings, error: defaultGeneralSettingsError } =
    useSWR<GeneralSettings>('/api/config?type=config&default=true');
  const { data: tzDictionary, error: tzDictionaryError } =
    useSWR<TZDictionary>('/api/config?type=tz');

  const [changesMade, setChangesMade] = React.useState(false);

  // Field States
  const [fieldState, setFieldState] = React.useState(
    Object.assign({}, defaultGeneralSettings, generalSettings)
  );
  function setFieldStateHelper<KeyType extends keyof GeneralSettings>(
    key: KeyType,
    value: GeneralSettings[KeyType]
  ) {
    setFieldStateHelperImpl<GeneralSettings>(key, value, setFieldState);
  }

  // Handlers for Speaker Volume Slider and Input
  const handleSpeakerVolumeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'speaker_volume',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleSpeakerVolumeSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('speaker_volume', newValue as number);
    setChangesMade(true);
  };

  const handleSpeakerVolumeBlur = () => {
    const speakerVolumeValue = fieldState.speaker_volume;
    if (speakerVolumeValue && speakerVolumeValue < 0) {
      setFieldStateHelper('speaker_volume', 0);
    } else if (speakerVolumeValue && speakerVolumeValue > 100) {
      setFieldStateHelper('speaker_volume', 100);
    } else if (!speakerVolumeValue) {
      setFieldStateHelper(
        'speaker_volume',
        generalSettings?.speaker_volume ?? defaultGeneralSettings?.speaker_volume
      );
    }
    setChangesMade(true);
  };

  // Handlers for LCD Brightness Slider and Input
  const handleLcdBrightnessInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'lcd_brightness',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleLcdBrightnessSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('lcd_brightness', newValue as number);
    setChangesMade(true);
  };

  const handleLcdBrightnessBlur = () => {
    const lcdBrightnessValue = fieldState.lcd_brightness;
    if (lcdBrightnessValue && lcdBrightnessValue < 0) {
      setFieldStateHelper('lcd_brightness', 0);
    } else if (lcdBrightnessValue && lcdBrightnessValue > 1023) {
      setFieldStateHelper('lcd_brightness', 1023);
    } else if (!lcdBrightnessValue) {
      setFieldStateHelper(
        'lcd_brightness',
        generalSettings?.lcd_brightness ?? defaultGeneralSettings?.lcd_brightness
      );
    }
    setChangesMade(true);
  };

  // Handlers for Display Timeout Slider and Input
  const handleDisplayTimeoutInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldStateHelper(
      'display_timeout',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
    setChangesMade(true);
  };

  const handleDisplayTimeoutSliderChange = (event: Event, newValue: number | number[]) => {
    setFieldStateHelper('display_timeout', newValue as number);
    setChangesMade(true);
  };

  const handleDisplayTimeoutBlur = () => {
    const displayTimeoutValue = fieldState.display_timeout;
    if (displayTimeoutValue && displayTimeoutValue < 1) {
      setFieldStateHelper('display_timeout', 1);
    } else if (displayTimeoutValue && displayTimeoutValue > 60) {
      setFieldStateHelper('display_timeout', 60);
    } else if (!displayTimeoutValue) {
      setFieldStateHelper(
        'display_timeout',
        generalSettings?.display_timeout ?? defaultGeneralSettings?.display_timeout
      );
    }
    setChangesMade(true);
  };

  React.useEffect(() => {
    if (generalSettings && defaultGeneralSettings && tzDictionary) {
      setFieldState(Object.assign({}, defaultGeneralSettings, generalSettings));
      setLoading(false);
    }
  }, [generalSettings, defaultGeneralSettings, tzDictionary]);

  // Function to reset the form error states
  const resetFormErrorState = () => {
    formErrorContext.HassHostError = { Error: false, HelperText: '' };
    formErrorContext.HassPortError = { Error: false, HelperText: '' };
    formErrorContext.OpenhabUrlError = { Error: false, HelperText: '' };
    formErrorContext.RestUrlError = { Error: false, HelperText: '' };
    formErrorContext.WisTtsUrlError = { Error: false, HelperText: '' };
    formErrorContext.WisUrlError = { Error: false, HelperText: '' };
    formErrorContext.MqttHostError = { Error: false, HelperText: '' };
    formErrorContext.MqttPortError = { Error: false, HelperText: '' };
  };

  // Handler to reset field values to defaults
  const handleResetForm = () => {
    setFieldState(Object.assign({}, defaultGeneralSettings));
    resetFormErrorState();
    setChangesMade(true);
  };

  // Handler to undo changes
  const handleUndoChanges = () => {
    setFieldState(Object.assign({}, defaultGeneralSettings, generalSettings));
    resetFormErrorState();
    setChangesMade(false);
  };

  // Handlers for fields with validations
  const handleWisUrlChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    const validationResult = ValidateWisUrl(value);

    if (validationResult) {
      formErrorContext.WisUrlError = { Error: true, HelperText: validationResult };
    } else {
      formErrorContext.WisUrlError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('wis_url', value);
    setChangesMade(true);
  };

  const handleWisTtsUrlChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateWisTtsUrl(value);

    if (validationResult) {
      formErrorContext.WisTtsUrlError = { Error: true, HelperText: validationResult };
    } else {
      formErrorContext.WisTtsUrlError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('wis_tts_url', value);
    setChangesMade(true);
  };

  return loading || !(generalSettings && defaultGeneralSettings && tzDictionary) ? (
    <LoadingSpinner />
  ) : (
    <form
      name="general-settings-form"
      onSubmit={(event) =>
        handleSubmit(event, tzDictionary, formErrorContext, !onboardingState.isOnboardingComplete)
      }>
      <EnumSelectHelper
        name="speech_rec_mode"
        value={fieldState.speech_rec_mode}
        onChange={(event) => {
          setFieldStateHelper(
            'speech_rec_mode',
            event.target.value as keyof typeof SPEECH_REC_MODE
          );
          setChangesMade(true);
        }}
        label="Speech Recognition Mode"
        options={SPEECH_REC_MODE}
        tooltip=" Willow Inference Server mode uses the configured URL to stream your speech to a very high quality speech recognition implementation powered by WIS."
      />
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
        <TextField
          name="wis_url"
          value={fieldState.wis_url}
          error={formErrorContext.WisUrlError.Error}
          helperText={formErrorContext.WisUrlError.HelperText}
          onChange={handleWisUrlChange}
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
        value={fieldState.audio_response_type}
        onChange={(event) => {
          setFieldStateHelper(
            'audio_response_type',
            event.target.value as keyof typeof AUDIO_RESPONSE_TYPE
          );
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
          value={fieldState.wis_tts_url}
          onChange={handleWisTtsUrlChange}
          error={formErrorContext.WisTtsUrlError.Error}
          helperText={formErrorContext.WisTtsUrlError.HelperText}
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
        value={fieldState.wake_word}
        onChange={(event) => {
          setFieldStateHelper('wake_word', event.target.value as keyof typeof WAKE_WORDS);
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
        value={fieldState.command_endpoint}
        onChange={(event) => {
          setFieldStateHelper(
            'command_endpoint',
            event.target.value as keyof typeof COMMAND_ENDPOINT
          );
          setChangesMade(true);
        }}
        label="Command Endpoint"
        options={COMMAND_ENDPOINT}
        tooltip="When Willow recognizes speech we need to send the transcript somewhere to execute your commands.
          Select your favorite platform here or use REST for your own!"
      />
      {fieldState.command_endpoint == 'Home Assistant' && (
        <HassCommandEndpoint
          fieldState={fieldState}
          setFieldStateHelper={setFieldStateHelper}
          setChangesMade={setChangesMade}
        />
      )}
      {fieldState.command_endpoint == 'openHAB' && (
        <OpenHabCommandEndpoint
          fieldState={fieldState}
          setFieldStateHelper={setFieldStateHelper}
          setChangesMade={setChangesMade}
        />
      )}
      {fieldState.command_endpoint == 'REST' && (
        <RestCommandEndpoint
          fieldState={fieldState}
          setFieldStateHelper={setFieldStateHelper}
          setChangesMade={setChangesMade}
        />
      )}
      {fieldState.command_endpoint == 'MQTT' && (
        <MQTTCommandEndpoint
          fieldState={fieldState}
          setFieldStateHelper={setFieldStateHelper}
          setChangesMade={setChangesMade}
        />
      )}
      <FormControl fullWidth>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                name="wake_confirmation"
                checked={fieldState.wake_confirmation}
                onChange={(event) => {
                  setFieldStateHelper('wake_confirmation', event.target.checked);
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
          value={fieldState.speaker_volume}
          onChange={handleSpeakerVolumeSliderChange}
          min={0}
          max={100}
          size="small"
          valueLabelDisplay="auto"
        />
        <VolumeUp />
        <Input
          value={fieldState.speaker_volume}
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
          value={fieldState.lcd_brightness}
          onChange={handleLcdBrightnessSliderChange}
          min={0}
          max={1000}
          size="small"
          step={100}
          valueLabelDisplay="auto"
        />
        <Brightness5Icon />
        <Input
          value={fieldState.lcd_brightness}
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
          value={fieldState.display_timeout}
          onChange={handleDisplayTimeoutSliderChange}
          min={1}
          max={60}
          size="small"
          valueLabelDisplay="auto"
        />
        <HourglassFull />
        <Input
          value={fieldState.display_timeout}
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
          value={fieldState.timezone_name}
          defaultValue=""
          label="Timezone Setting"
          onChange={(event) => {
            setFieldStateHelper('timezone_name', event.target.value);
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
        value={fieldState.ntp_config}
        onChange={(event) => {
          setFieldStateHelper('ntp_config', event.target.value as keyof typeof NTP_CONFIG);
          setChangesMade(true);
        }}
        label="Automatic Time and Date (NTP)"
        options={NTP_CONFIG}
        tooltip="If your DHCP server provides an NTP server DHCP option you can select DHCP.
          If you don't know what this means use an NTP host."
      />
      {fieldState.ntp_config == 'Host' && (
        <>
          <TextField
            name="ntp_host"
            value={fieldState.ntp_host}
            onChange={(event) => {
              setFieldStateHelper('ntp_host', event.target.value);
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
