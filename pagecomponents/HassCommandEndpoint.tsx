import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import React, { useContext } from 'react';
import { HelpTooltip, parseIntOrUndef } from '../misc/helperfunctions';
import { GeneralSettings } from '../misc/model';
import { ValidateHassHost } from '../misc/validations';
import { FormErrorContext } from '../pages/_app';

export default function HassCommandEndpoint({
  fieldState,
  setFieldStateHelper,
  setChangesMade,
}: {
  fieldState: GeneralSettings;
  setFieldStateHelper: (
    key: keyof GeneralSettings,
    value: GeneralSettings[keyof GeneralSettings]
  ) => void;
  setChangesMade: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const formErrorContext = useContext(FormErrorContext);
  const [showHaToken, setShowHaToken] = React.useState(false);
  const handleClickShowHaToken = () => setShowHaToken(!showHaToken);
  const handleMouseDownHaToken = () => setShowHaToken(!showHaToken);

  // Handlers for fields with validations
  const handleHassHostChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateHassHost(value);

    if (validationResult) {
      formErrorContext.HassHostError = { Error: true, HelperText: validationResult };
    } else {
      formErrorContext.HassHostError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('hass_host', value);
    setChangesMade(true);
  };

  const handleHassPortChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = parseIntOrUndef(event.target.value) ?? -1;

    if (value < 0 || value > 65535) {
      formErrorContext.HassPortError = {
        Error: true,
        HelperText: 'Port must be a value between 0 and 65535',
      };
    } else {
      formErrorContext.HassPortError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('hass_port', value);
    setChangesMade(true);
  };

  return (
    <>
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="space-between">
        <TextField
          name="hass_host"
          value={fieldState.hass_host}
          error={formErrorContext.HassHostError.Error}
          helperText={formErrorContext.HassHostError.HelperText}
          onChange={handleHassHostChange}
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
          value={fieldState.hass_port}
          error={formErrorContext.HassPortError.Error}
          helperText={formErrorContext.HassPortError.HelperText}
          onChange={handleHassPortChange}
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
          value={fieldState.hass_token}
          onChange={(event) => {
            setFieldStateHelper('hass_token', event.target.value);
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
                  aria-label="Toggle HA Token visibility"
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
              checked={fieldState.hass_tls}
              onChange={(event) => {
                setFieldStateHelper('hass_tls', event.target.checked);
                setChangesMade(true);
              }}
            />
          }
          label="Use TLS with Home Assistant"
        />
        <HelpTooltip tooltip="Whether or not your Home Assistant server is using https." />
      </Stack>
    </>
  );
}
