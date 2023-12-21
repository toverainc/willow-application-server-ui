import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { WAS_URL, post } from '../misc/fetchers';
import { setFieldStateHelperImpl } from '../misc/helperfunctions';
import { NvsSettings } from '../misc/model';
import { ValidateWasUrl, ValidateWifiPsk, ValidateWifiSSID } from '../misc/validations';
import { OnboardingContext } from '../pages/_app';

export default function ConnectionSettingsSection({ nvsSettings }: { nvsSettings: NvsSettings }) {
  const [showPsk, setShowPsk] = React.useState(false);
  const handleClickShowPsk = () => setShowPsk(!showPsk);
  const handleMouseDownPsk = () => setShowPsk(!showPsk);

  // field values
  const [fieldState, setFieldState] = React.useState(Object.assign({}, nvsSettings));
  function setFieldStateHelper<KeyType extends keyof NvsSettings>(
    key: KeyType,
    value: NvsSettings[KeyType]
  ) {
    setFieldStateHelperImpl<NvsSettings>(key, value, setFieldState);
  }

  // Error States
  const [wasUrlError, setWasUrlError] = React.useState(false);
  const [wasUrlHelperText, setWasUrlHelperText] = React.useState('');

  const [wifiSSIDError, setWifiSSIDError] = React.useState(false);
  const [wifiSSIDHelperText, setWifiSSIDHelperText] = React.useState('');

  const [wifiPassError, setWifiPassError] = React.useState(false);
  const [wifiPassHelperText, setWifiPassHelperText] = React.useState('');

  // Handlers for fields with validation
  const handleWasUrlChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    const validationResult = ValidateWasUrl(value);

    if (validationResult) {
      setWasUrlHelperText(validationResult);
      setWasUrlError(true);
    } else {
      setWasUrlHelperText('');
      setWasUrlError(false);
    }

    setFieldStateHelper('WAS', { URL: value });
  };

  const handleWifiPassChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateWifiPsk(value);

    if (validationResult) {
      setWifiPassHelperText(validationResult);
      setWifiPassError(true);
    } else {
      setWifiPassHelperText('');
      setWifiPassError(false);
    }

    setFieldStateHelper('WIFI', Object.assign({}, fieldState.WIFI, { PSK: value }));
  };

  const handleWifiSsidChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateWifiSSID(value);

    if (validationResult) {
      setWifiSSIDHelperText(validationResult);
      setWifiSSIDError(true);
    } else {
      setWifiSSIDHelperText('');
      setWifiSSIDError(false);
    }

    setFieldStateHelper('WIFI', Object.assign({}, fieldState.WIFI, { SSID: value }));
  };

  React.useEffect(() => {
    if (nvsSettings) {
      setFieldStateHelper('WIFI', nvsSettings.WIFI);
      setFieldStateHelper('WAS', nvsSettings.WAS);
    }
  }, [nvsSettings]);

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

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="url"
        value={fieldState.WAS?.URL ?? WAS_URL}
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
        value={fieldState.WIFI?.SSID}
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
        value={fieldState.WIFI?.PSK}
        onChange={handleWifiPassChange}
        error={wifiPassError}
        helperText={wifiPassHelperText}
        required
        label="WiFi Network Password"
        margin="dense"
        variant="outlined"
        type={showPsk ? 'text' : 'password'}
        autoComplete="off"
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
