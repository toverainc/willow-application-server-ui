import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
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
import LeftMenu from '../components/LeftMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WebFlashCard from '../components/WebFlashCard';
import { post } from '../misc/fetchers';

const WAKE_WORDS = {
  alexa: 'Alexa',
  hiesp: 'Hi E.S.P.',
  hilexin: 'Hi Lexin (Chinese pronunciation)',
};
const SPEECH_REC_MODE = {
  WIS: 'Willow Inference Server',
  Multinet: 'On Client Command Recognition (developers only)',
};
const AUDIO_RESPONSE_TYPE = { TTS: 'Text to Speech', Chimes: 'Chimes', None: 'Silence' };
const COMMAND_ENDPOINT = {
  'Home Assistant': 'Home Assistant',
  openHAB: 'openHAB',
  REST: 'REST',
};
const NTP_CONFIG = {
  Host: 'Specify an NTP server host',
  DHCP: 'Use DHCP provided NTP Server',
};
const REST_AUTH_TYPES = ['None', 'Basic', 'Header'];

interface GeneralSettings {
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
  ntp_config: keyof typeof NTP_CONFIG;
  ntp_host: string;
}

const AUDIO_CODECS = { PCM: 'PCM', 'AMR-WB': 'AMR-WB' };
const VAD_MODES = [1, 2, 3, 4];
const WAKE_MODES = ['1CH_90', '1CH_95', '2CH_90', '2CH_95', '3CH_90', '3CH_95'];

interface AdvancedSettings {
  aec: boolean; //Acoustic Echo Cancellation
  bss: boolean; //Blind Source Separation
  multiwake: boolean; // Multiwake / Willow One Wake
  audio_codec: keyof typeof AUDIO_CODECS;
  vad_mode: number; //Voice Activity Detection Mode
  wake_mode: string; //aka WAKE_MODES
  mic_gain: number;
  record_buffer: number;
  stream_timeout: number;
  vad_timeout: number;
}

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

function AdvancedSettings() {
  const [loading, setLoading] = React.useState(true);
  const { data, error } = useSWR<AdvancedSettings>('/api/config?type=config');

  React.useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || error) return; //sanity check
    const form = Object.fromEntries(new FormData(event.target as any).entries()) as Record<
      string,
      string
    >;
    const apply = (event.nativeEvent as any).submitter.id == 'saveAndApply';
    let body: Partial<AdvancedSettings> = {
      aec: !!form.aec,
      bss: !!form.bss,
      multiwake: !!form.multiwake,
      vad_mode: parseIntOrUndef(form.vad_mode),
      mic_gain: parseIntOrUndef(form.mic_gain),
      record_buffer: parseIntOrUndef(form.record_buffer),
      stream_timeout: parseIntOrUndef(form.stream_timeout),
      vad_timeout: parseIntOrUndef(form.vad_timeout),
    };
    body = Object.assign({}, data, form, body);
    try {
      await post(
        apply ? '/api/config?type=config&apply=1' : '/api/config?type=config&apply=0',
        body
      );
      await mutate('/api/config?type=config');
    } catch (e) {
      console.error(`Save advanced configuration settings failed with ${e}`);
      toast.error(`Saving advanced configuration settings to WAS failed!`);
      return e;
    }
    if (apply) {
      toast.success('Advanced configuration settings saved and applied!');
    } else {
      toast.success('Advanced configuration settings saved!');
    }
  }

  return loading ? (
    <LoadingSpinner />
  ) : (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth>
        <Stack spacing={0} direction="row" sx={{ mb: 0 }} justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox name="aec" defaultChecked={data?.aec} />}
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
            control={<Checkbox name="bss" defaultChecked={data?.bss} />}
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
            control={<Checkbox name="multiwake" defaultChecked={data?.multiwake} />}
            label="Willow One Wake (EXPERIMENTAL)"
          />
          <HelpTooltip
            tooltip="When you have multiple clients close enough to wake at the same time it's annoying.
          Willow One Wake (WOW) is an experimental feature to only capture audio on the client closest to the person speaking."></HelpTooltip>
        </Stack>
      </FormControl>
      <EnumSelectHelper
        name="audio_codec"
        defaultValue={data?.audio_codec}
        label="Audio Codec to use for streaming to WIS"
        options={AUDIO_CODECS}
        tooltip="PCM is more accurate but uses more WiFi bandwidth.
        If you have an especially challenging WiFi environment you can try enabling compression (AMR-WB)."
      />
      <EnumSelectHelper
        name="vad_mode"
        defaultValue={data?.vad_mode?.toString()}
        label="Voice Activity Detection Mode"
        options={VAD_MODES.map((v) => v.toString())}
        tooltip="If Willow thinks you stop talking too soon or too late you can change the aggressiveness of Voice Activity Mode (VAD).
        Higher values are more likely to end the voice session earlier."
      />
      <EnumSelectHelper
        name="wake_mode"
        defaultValue={data?.wake_mode}
        label="Wake Word Recognition Mode"
        options={WAKE_MODES}
        tooltip="Wake Word Recognition Mode generally configures the sensitivity of detecting the wake word.
        Higher values are more sensitive but can lead to Willow waking up when it shouldn't."
      />
      <InputLabel>Microphone Gain</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="mic_gain"
          defaultValue={data?.mic_gain}
          min={0}
          max={14}
          size="small"
          valueLabelDisplay="on"
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
          defaultValue={data?.record_buffer}
          min={0}
          max={16}
          size="small"
          valueLabelDisplay="on"
        />
        <HelpTooltip
          tooltip="Record buffer configures the timing between when the client wakes and when it starts capturing commands.
        Users with a local WIS instance may want to try setting lower (10 or so)."></HelpTooltip>
      </Stack>
      <InputLabel>Maximum speech duration</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="stream_timeout"
          defaultValue={data?.stream_timeout}
          min={1}
          max={30}
          size="small"
          valueLabelDisplay="on"
        />
        <HelpTooltip tooltip="How long to wait after wake starts to force the end of recognition."></HelpTooltip>
      </Stack>
      <InputLabel>VAD Timeout</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="vad_timeout"
          defaultValue={data?.vad_timeout}
          min={0}
          max={1000}
          size="small"
          valueLabelDisplay="on"
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
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button id="saveAndApply" type="submit" variant="outlined">
          Save Settings & Apply Everywhere
        </Button>
        <HelpTooltip tooltip="Save your configuration to WAS and apply to all connected clients immediately."></HelpTooltip>
      </Stack>
    </form>
  );
}

function GeneralSettings() {
  const [loading, setLoading] = React.useState(true);
  const [commandEndpoint, setCommandEndpoint] =
    React.useState<keyof typeof COMMAND_ENDPOINT>('Home Assistant');

  const [ntpConfig, setNtpConfig] = React.useState<keyof typeof NTP_CONFIG>('Host');
  const [restAuthType, setRestAuthType] = React.useState<string>(REST_AUTH_TYPES[0]);

  const [showHaToken, setShowHaToken] = React.useState(false);
  const handleClickShowHaToken = () => setShowHaToken(!showHaToken);
  const handleMouseDownHaToken = () => setShowHaToken(!showHaToken);

  const [showOhToken, setShowOhToken] = React.useState(false);
  const handleClickShowOhToken = () => setShowOhToken(!showOhToken);
  const handleMouseDownOhToken = () => setShowOhToken(!showOhToken);

  const [showRestPassword, setShowRestPassword] = React.useState(false);
  const handleClickShowRestPassword = () => setShowRestPassword(!showRestPassword);
  const handleMouseDownRestPassword = () => setShowRestPassword(!showRestPassword);

  const { data, error } = useSWR<GeneralSettings>('/api/config?type=config');

  React.useEffect(() => {
    if (data) {
      setCommandEndpoint(data.command_endpoint);
      setRestAuthType(data.rest_auth_type);
      setNtpConfig(data.ntp_config);
      setLoading(false);
    }
  }, [data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || error) return; //sanity check
    const form = Object.fromEntries(new FormData(event.target as any).entries()) as Record<
      string,
      string
    >;
    const apply = (event.nativeEvent as any).submitter.id == 'saveAndApply';
    let body: Partial<GeneralSettings> = {
      hass_port: commandEndpoint == 'Home Assistant' ? parseIntOrUndef(form.hass_port) : undefined,
      hass_tls: commandEndpoint == 'Home Assistant' ? !!form.hass_tls : undefined,
      speaker_volume: parseIntOrUndef(form.speaker_volume),
      lcd_brightness: parseIntOrUndef(form.lcd_brightness),
    };
    body = Object.assign({}, data, form, body);

    try {
      await post(
        apply ? '/api/config?type=config&apply=1' : '/api/config?type=config&apply=0',
        body
      );
      await mutate('/api/config?type=config');
    } catch (e) {
      console.error(`Save general configuration settings failed with ${e}`);
      toast.error(`Saving general configuration settings to WAS failed!`);
      return e;
    }
    if (apply) {
      toast.success('General configuration settings saved and applied!');
    } else {
      toast.success('General configuration settings saved!');
    }
  }

  return loading ? (
    <LoadingSpinner />
  ) : (
    <form onSubmit={handleSubmit}>
      <EnumSelectHelper
        name="speech_rec_mode"
        defaultValue={data?.speech_rec_mode}
        label="Speech Recognition Mode"
        options={SPEECH_REC_MODE}
        tooltip=" Willow Inference Server mode uses the configured URL to stream your speech to a very high quality speech recognition implementation powered by WIS.
        On client commands uses a model on the client to recognized pre-defined commands but you currently need to build Willow yourself for that.
        WAS configuration coming soon!"
      />
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
        <TextField
          name="wis_url"
          defaultValue={data?.wis_url}
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
        defaultValue={data?.audio_response_type}
        label="Willow Audio Response Type"
        options={AUDIO_RESPONSE_TYPE}
        tooltip="Text to Speech uses the configured Willow Inference Server (WIS) to speak the result of your command.
        Chimes plays success/failure tones depending on the response from your command endpoint.
        Silence has no audio output."
      />
      <TextField
        name="wis_tts_url"
        defaultValue={data?.wis_tts_url}
        required
        label="Willow Inference Server Text to Speech URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <EnumSelectHelper
        name="wake_word"
        defaultValue={data?.wake_word}
        label="Wake Word"
        options={WAKE_WORDS}
        tooltip="Alexa is pretty easy for everyone.
        Hi ESP generally needs to be said very clearly.
        Hi Lexin uses Chinese pronunciation which can be difficult for non-native speakers.
        More wake words coming soon!"
      />
      <EnumSelectHelper
        name="command_endpoint"
        value={commandEndpoint}
        onChange={(e) => setCommandEndpoint(e.target.value as any)}
        label="Command Endpoint"
        options={COMMAND_ENDPOINT}
        tooltip="When Willow recognizes speech we need to send the transcript somewhere to execute your commands.
        Select your favorite platform here or use REST for your own!"
      />
      {commandEndpoint == 'Home Assistant' && (
        <>
          <TextField
            name="hass_host"
            defaultValue={data?.hass_host}
            required
            label="Home Assistant Host"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            name="hass_port"
            defaultValue={data?.hass_port}
            type="number"
            required
            label="Home Assistant Port"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            name="hass_token"
            defaultValue={data?.hass_token}
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
          <FormControlLabel
            control={<Checkbox name="hass_tls" checked={data?.hass_tls} />}
            label="Use TLS with Home Assistant"
          />
        </>
      )}
      {commandEndpoint == 'openHAB' && (
        <>
          <TextField
            name="openhab_url"
            defaultValue={data?.openhab_url}
            required
            label="openHAB URL"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            name="openhab_token"
            defaultValue={data?.openhab_token}
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
      {commandEndpoint == 'REST' && (
        <>
          <TextField
            name="rest_url"
            defaultValue={data?.rest_url}
            required
            label="REST URL"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <EnumSelectHelper
            name="rest_auth_type"
            value={restAuthType}
            onChange={(e) => setRestAuthType(e.target.value as any)}
            label="REST Authentication Method"
            options={REST_AUTH_TYPES}
          />
          {restAuthType == 'Basic' && (
            <>
              <TextField
                name="rest_auth_user"
                defaultValue={data?.rest_auth_user}
                required
                label="REST Basic Username"
                margin="dense"
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                name="rest_auth_pass"
                defaultValue={data?.rest_auth_pass}
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
          {restAuthType == 'Header' && (
            <>
              <TextField
                name="rest_auth_header"
                defaultValue={data?.rest_auth_header}
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
      {/* XXX: timezone */}
      <InputLabel>Speaker Volume</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <VolumeDown />
        <Slider
          name="speaker_volume"
          defaultValue={data?.speaker_volume}
          min={0}
          max={100}
          size="small"
          valueLabelDisplay="on"
        />
        <VolumeUp />
      </Stack>
      <InputLabel>LCD Brightness</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Brightness4Icon />
        <Slider
          name="lcd_brightness"
          defaultValue={data?.lcd_brightness}
          min={0}
          max={1023}
          size="small"
          valueLabelDisplay="on"
        />
        <Brightness5Icon />
      </Stack>
      <EnumSelectHelper
        name="ntp_config"
        value={ntpConfig}
        onChange={(e) => setNtpConfig(e.target.value as any)}
        label="Automatic Time and Date (NTP)"
        options={NTP_CONFIG}
        tooltip="If your DHCP server provides an NTP server DHCP option you can select DHCP.
        If you don't know what this means use an NTP host."
      />
      {ntpConfig == 'Host' && (
        <>
          <TextField
            name="ntp_host"
            defaultValue={data?.ntp_host}
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
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button id="saveAndApply" type="submit" variant="outlined">
          Save Settings & Apply Everywhere
        </Button>
        <HelpTooltip tooltip="Save your configuration to WAS and apply to all connected clients immediately."></HelpTooltip>
      </Stack>
    </form>
  );
}

interface NvsSettings {
  WAS: { URL: string };
  WIFI: { PSK: string; SSID: string };
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
      await mutate('/api/config?type=nvs');
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

  return loading ? (
    <LoadingSpinner />
  ) : (
    <form onSubmit={handleSubmit}>
      <TextField
        name="url"
        defaultValue={data?.WAS?.URL}
        required
        label="Willow Application Server URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="ssid"
        defaultValue={data?.WIFI?.SSID}
        required
        label="WiFi Network Name"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="psk"
        defaultValue={data?.WIFI?.PSK}
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
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button id="save" type="submit" variant="outlined">
          Save
        </Button>
        <Button id="saveAndApply" type="submit" variant="outlined">
          Save & Apply
        </Button>
      </Stack>
    </form>
  );
}

function SettingsAccordions() {
  const [expanded, setExpanded] = React.useState<string | false>('General');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Accordion expanded={expanded === 'Connectivity'} onChange={handleChange('Connectivity')}>
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
      <Accordion expanded={expanded === 'General'} onChange={handleChange('General')}>
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
      <Accordion expanded={expanded === 'Advanced'} onChange={handleChange('Advanced')}>
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

const Config: NextPage = () => {
  const { data: nvsData, isLoading: nvsIsLoading } = useSWR<NvsSettings>('/api/config?type=nvs');
  const { data: configData, isLoading: configIsLoading } =
    useSWR<GeneralSettings>('/api/config?type=config');

  return nvsIsLoading || configIsLoading ? (
    <LoadingSpinner />
  ) : (
    <LeftMenu>
      {(nvsData ? Object.keys(nvsData).length > 0 : false) &&
        (configData ? Object.keys(configData).length > 0 : false) && <WebFlashCard></WebFlashCard>}
      <SettingsAccordions></SettingsAccordions>
    </LeftMenu>
  );
};
export default Config;
