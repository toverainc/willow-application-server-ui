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
import { fetcher, post } from '../misc/fetchers';

const WAKE_WORDS = { hiesp: 'Hi ESP', alexa: 'Alexa', hilexin: 'Hi Lexin' };
const SPEECH_REC_MODE = { WIS: 'WIS', Multinet: 'Multinet' };
const AUDIO_RESPONSE_TYPE = { TTS: 'TTS', None: 'None', Chimes: 'Chimes' };
const COMMAND_ENDPOINT = {
  'Home Assistant': 'Home Assistant',
  openHAB: 'openHAB',
  REST: 'REST',
};
const NTP_CONFIG = { Host: 'Host', DHCP: 'DHCP' };
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
}

const AUDIO_CODECS = { 'AMR-WB': 'AMR-WB', PCM: 'PCM', WAV: 'WAV' };
const VAD_MODES = [1, 2, 3, 4];
const WAKE_MODES = ['1CH_90', '1CH_95', '2CH_90', '2CH_95', '3CH_90', '3CH_95'];

interface AdvancedSettings {
  aec: boolean; //Acoustic Echo Cancellation
  bss: boolean; //Blind Source Separation
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
        <FormControlLabel
          control={<Checkbox name="aec" defaultChecked={data?.aec} />}
          label="Acoustic Echo Cancellation"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormControlLabel
          control={<Checkbox name="bss" defaultChecked={data?.bss} />}
          label="Blind Source Separation"
        />
      </FormControl>
      <EnumSelectHelper
        name="audio_codec"
        defaultValue={data?.audio_codec}
        label="Audio codec to use for streaming to WIS"
        options={AUDIO_CODECS}
      />
      <EnumSelectHelper
        name="vad_mode"
        defaultValue={data?.vad_mode?.toString()}
        label="Voice Activity Detection Mode"
        options={VAD_MODES.map((v) => v.toString())}
        tooltip="Higher modes are more aggressive and are more restrictive in detecting speech"
      />
      <EnumSelectHelper
        name="wake_mode"
        defaultValue={data?.wake_mode}
        label="Wake Word Recognition Mode"
        options={WAKE_MODES}
        tooltip="he probability of being recognized as a wake word increases with increasing mode. As a consequence, a higher mode will result in more false positives."
      />
      <InputLabel>Microphone Gain</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="mic_gain"
          defaultValue={data?.mic_gain}
          min={0}
          max={14}
          size="small"
          valueLabelDisplay="auto"
        />
        <HelpTooltip tooltip="0dB (0), 3dB (1), 6dB (2), 9dB (3), 12dB (4), 15dB (5), 18dB (6), 21dB (7), 24dB (8), 27dB (9), 30dB (10), 33dB (11), 34.5dB (12), 36dB (13), 37.5 (dB)" />
      </Stack>
      <InputLabel>Record Buffer</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="record_buffer"
          defaultValue={data?.record_buffer}
          min={0}
          max={16}
          size="small"
          valueLabelDisplay="auto"
        />
        <HelpTooltip tooltip="Custom record buffer for timing and latency. Users with a local WIS instance may want to try setting lower (10 or so)"></HelpTooltip>
      </Stack>
      <InputLabel>Maximum speech duration</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="stream_timeout"
          defaultValue={data?.stream_timeout}
          min={1}
          max={30}
          size="small"
          valueLabelDisplay="auto"
        />
        <HelpTooltip tooltip="Stop speech recognition after N seconds after wake event to avoid endless stream when VAD END does not trigger."></HelpTooltip>
      </Stack>
      <InputLabel>VAD Timeout</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          name="vad_timeout"
          defaultValue={data?.vad_timeout}
          min={0}
          max={1000}
          size="small"
          valueLabelDisplay="auto"
        />
        <HelpTooltip tooltip="VAD (Voice Activity Detection) timeout in ms. How long to wait after end of speech to trigger end of VAD. Improves response times but can also clip speech if you do not talk fast enough. Allows for entering 1 - 1000 ms but if you go lower than 50 or so good luck..."></HelpTooltip>
      </Stack>
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

function GeneralSettings() {
  const [loading, setLoading] = React.useState(true);
  const [commandEndpoint, setCommandEndpoint] =
    React.useState<keyof typeof COMMAND_ENDPOINT>('Home Assistant');
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
        label="Willow Speech Recognition Mode"
        options={SPEECH_REC_MODE}
      />
      <TextField
        name="wis_url"
        defaultValue={data?.wis_url}
        required
        label="Willow Inference Server URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <EnumSelectHelper
        name="audio_response_type"
        defaultValue={data?.audio_response_type}
        label="Willow audio response type"
        options={AUDIO_RESPONSE_TYPE}
      />
      <TextField
        name="wis_tts_url"
        defaultValue={data?.wis_tts_url}
        required
        label="Willow Inference Server TTS URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <EnumSelectHelper
        name="wake_word"
        defaultValue={data?.wake_word}
        label="Willow Wake Word"
        options={WAKE_WORDS}
      />
      <EnumSelectHelper
        name="command_endpoint"
        value={commandEndpoint}
        onChange={(e) => setCommandEndpoint(e.target.value as any)}
        label="Willow Command Endpoint"
        options={COMMAND_ENDPOINT}
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
            label="Home Assistant Use TLS"
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
          valueLabelDisplay="auto"
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
          valueLabelDisplay="auto"
        />
        <Brightness5Icon />
      </Stack>
      <EnumSelectHelper
        name="ntp_config"
        defaultValue={data?.ntp_config}
        label="NTP Configuration"
        options={NTP_CONFIG}
      />
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
        label="WiFi SSID"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="psk"
        defaultValue={data?.WIFI?.PSK}
        required
        label="WiFi Password"
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
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Connectivity</Typography>
          <Typography sx={{ color: 'text.secondary' }}>WiFi and WAS Settings</Typography>
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
          <Typography sx={{ color: 'text.secondary' }}>General Willow Settings</Typography>
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
          <Typography sx={{ color: 'text.secondary' }}>Advanced Settings for Tinkering</Typography>
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
