import { HourglassEmpty, HourglassFull } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import useSWR from 'swr';
import LoadingSpinner from '../components/LoadingSpinner';
import { FormErrorContext, OnboardingContext } from '../pages/_app';
import {
  EnumSelectHelper,
  HelpTooltip,
  handleSubmit,
  parseIntOrUndef,
} from '../misc/helperfunctions';
import {
  AUDIO_RESPONSE_TYPE,
  COMMAND_ENDPOINT,
  GeneralSettings,
  NTP_CONFIG,
  REST_AUTH_TYPES,
  SPEECH_REC_MODE,
  TZDictionary,
  WAKE_WORDS,
} from '../misc/model';
import {
  PatternEndsWithTtsApi,
  PatternEndsWithWillowApi,
  PatternStartsWithUrlScheme,
  PatternValidWisHostnameUrl,
  PatternValidWisIpUrl,
  PatternValidWisTtsHostnameUrl,
  PatternValidWisTtsIpUrl,
} from '../misc/validations';

export default function GeneralSettingsSection() {
  const onboardingState = React.useContext(OnboardingContext);
  const formErrorContext = React.useContext(FormErrorContext);
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
  const [wisUrlError, setWisUrlError] = React.useState(false);
  const [wisUrlHelperText, setWisUrlHelperText] = React.useState('');

  const [audioResponseTypeValue, setAudioResponseTypeValue] = React.useState(
    (generalSettings?.audio_response_type ??
      defaultGeneralSettings?.audio_response_type) as keyof typeof AUDIO_RESPONSE_TYPE
  );

  const [wisTtsUrlValue, setWisTtsUrlValue] = React.useState(
    generalSettings?.wis_tts_url ?? defaultGeneralSettings?.wis_tts_url
  );
  const [wisTtsUrlError, setWisTtsUrlError] = React.useState(false);
  const [wisTtsUrlHelperText, setWisTtsUrlHelperText] = React.useState('');

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

  // Ensure changes to error states are reflected in the FormErrorContext
  React.useEffect(() => {
    formErrorContext.generalSettingsFormHasErrors = wisTtsUrlError || wisUrlError;
  }, [wisTtsUrlError, wisUrlError]);

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
    setWisUrlHelperText('');
    setWisUrlError(false);
    setWisTtsUrlHelperText('');
    setWisTtsUrlError(false);
    formErrorContext.generalSettingsFormHasErrors = false;
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
    setWisUrlHelperText('');
    setWisUrlError(false);
    setWisTtsUrlHelperText('');
    setWisTtsUrlError(false);
    formErrorContext.generalSettingsFormHasErrors = false;
    setChangesMade(false);
  };

  // Handlers for fields with validations
  const handleWisUrlChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;

    if (!value.match(PatternStartsWithUrlScheme)) {
      setWisUrlHelperText('URL must begin with http:// or https://');
      setWisUrlError(true);
    } else if (!value.match(PatternEndsWithWillowApi)) {
      setWisUrlHelperText('URL must end with /api/willow');
      setWisUrlError(true);
    } else if (!value.match(PatternValidWisHostnameUrl) && !value.match(PatternValidWisIpUrl)) {
      setWisUrlHelperText('URL contains an invalid hostname or ip address');
      setWisUrlError(true);
    } else {
      setWisUrlHelperText('');
      setWisUrlError(false);
    }

    setWisUrlValue(value);
    setChangesMade(true);
  };

  const handleWisTtsUrlChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    if (!value.match(PatternStartsWithUrlScheme)) {
      setWisTtsUrlHelperText('URL must begin with http:// or https://');
      setWisTtsUrlError(true);
    } else if (!value.match(PatternEndsWithTtsApi)) {
      setWisTtsUrlHelperText('URL must end with /api/tts');
      setWisTtsUrlError(true);
    } else if (
      !value.match(PatternValidWisTtsHostnameUrl) &&
      !value.match(PatternValidWisTtsIpUrl)
    ) {
      setWisTtsUrlHelperText('URL contains an invalid hostname or ip address');
      setWisTtsUrlError(true);
    } else {
      setWisTtsUrlHelperText('');
      setWisTtsUrlError(false);
    }

    setWisTtsUrlValue(value);
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
          error={wisUrlError}
          helperText={wisUrlHelperText}
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
          onChange={handleWisTtsUrlChange}
          error={wisTtsUrlError}
          helperText={wisTtsUrlHelperText}
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
