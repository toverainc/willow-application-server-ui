import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';
import LoadingSpinner from '../components/LoadingSpinner';
import { WAS_URL, post } from '../misc/fetchers';
import { NvsSettings } from '../misc/model';
import {
  PatternEndsWithWs,
  PatternStartsWithWsWss,
  PatternValidWasHostnameUrl,
  PatternValidWasIpUrl,
  PatternValidWifiPsk,
  PatternValidWifiSsid,
} from '../misc/validations';
import { OnboardingContext } from '../pages/_app';

export default function ConnectionSettingsSection() {
  const [loading, setLoading] = React.useState(true);
  const [showPsk, setShowPsk] = React.useState(false);
  const handleClickShowPsk = () => setShowPsk(!showPsk);
  const handleMouseDownPsk = () => setShowPsk(!showPsk);
  const { data, error } = useSWR<NvsSettings>('/api/config?type=nvs');

  // field values
  const [wasUrl, setWasUrl] = React.useState(data?.WAS?.URL ?? WAS_URL);
  const [wasUrlError, setWasUrlError] = React.useState(false);
  const [wasUrlHelperText, setWasUrlHelperText] = React.useState('');

  const [wifiSSID, setWifiSSID] = React.useState(data?.WIFI?.SSID);
  const [wifiSSIDError, setWifiSSIDError] = React.useState(false);
  const [wifiSSIDHelperText, setWifiSSIDHelperText] = React.useState('');

  const [wifiPass, setWifiPass] = React.useState(data?.WIFI?.PSK);
  const [wifiPassError, setWifiPassError] = React.useState(false);
  const [wifiPassHelperText, setWifiPassHelperText] = React.useState('');

  // Handlers for fields with validation
  const handleWasUrlChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;

    if (!value.match(PatternStartsWithWsWss)) {
      setWasUrlHelperText('URL must start with ws:// or wss://');
      setWasUrlError(true);
    } else if (!value.match(PatternEndsWithWs)) {
      setWasUrlHelperText('URL must end with /ws');
      setWasUrlError(true);
    } else if (!value.match(PatternValidWasHostnameUrl) && !value.match(PatternValidWasIpUrl)) {
      setWasUrlHelperText('URL contains an invalid hostname or ip address');
      setWasUrlError(true);
    } else {
      setWasUrlHelperText('');
      setWasUrlError(false);
    }

    setWasUrl(value);
  };

  const handleWifiPassChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    if (value.length < 8 || value.length > 63) {
      setWifiPassHelperText('WiFi WPA passphrase must be between 8 and 63 ASCII characters');
      setWifiPassError(true);
    } else if (!value.match(PatternValidWifiPsk)) {
      setWifiPassHelperText('WiFi WPA passphrase must only contain ASCII characters');
      setWifiPassError(true);
    } else {
      setWifiPassHelperText('');
      setWifiPassError(false);
    }

    setWifiPass(value);
  };

  const handleWifiSsidChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    if (!value.match(PatternValidWifiSsid)) {
      setWifiSSIDHelperText('WiFi SSID contains invalid characters');
      setWifiSSIDError(true);
    } else if (value.length < 2 || value.length > 32) {
      setWifiSSIDHelperText('WiFi SSID must be between 2 and 32 ASCII characters');
      setWifiSSIDError(true);
    } else {
      setWifiSSIDHelperText('');
      setWifiSSIDError(false);
    }

    setWifiSSID(value);
  };

  React.useEffect(() => {
    if (data) {
      setWasUrl(data.WAS?.URL ?? WAS_URL);
      setWifiSSID(data.WIFI?.SSID);
      setWifiPass(data.WIFI?.PSK);
      setLoading(false);
    }
  }, [data]);

  const onboardingContext = React.useContext(OnboardingContext);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (wasUrlError || wifiPassError || wifiSSIDError) {
      toast.error('Please correct invalid values before saving!');
      return;
    }

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
        value={wasUrl}
        onChange={handleWasUrlChange}
        error={wasUrlError}
        helperText={wasUrlHelperText}
        required
        label="Willow Application Server URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="ssid"
        value={wifiSSID}
        onChange={handleWifiSsidChange}
        error={wifiSSIDError}
        helperText={wifiSSIDHelperText}
        required
        label="WiFi Network Name"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="psk"
        value={wifiPass}
        onChange={handleWifiPassChange}
        error={wifiPassError}
        helperText={wifiPassHelperText}
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
