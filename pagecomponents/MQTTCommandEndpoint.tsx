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
import { EnumSelectHelper, parseIntOrUndef } from '../misc/helperfunctions';
import { GeneralSettings, MQTT_AUTH_TYPES } from '../misc/model';
import { ValidateIpOrHostname } from '../misc/validations';
import { FormErrorContext } from '../pages/_app';

export default function MQTTCommandEndpoint({
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
  const [showMqttPassword, setShowMqttPassword] = React.useState(false);
  const handleClickShowMqttPassword = () => setShowMqttPassword(!showMqttPassword);
  const handleMouseDownMqttPassword = () => setShowMqttPassword(!showMqttPassword);

  // Handlers for fields with validations
  const handleMqttHostChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateIpOrHostname(value);

    if (validationResult) {
      formErrorContext.MqttHostError = { Error: true, HelperText: validationResult };
    } else {
      formErrorContext.MqttHostError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('mqtt_host', value);
    setChangesMade(true);
  };

  const handleMqttPortChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = parseIntOrUndef(event.target.value) ?? -1;

    if (value < 0 || value > 65535) {
      formErrorContext.MqttPortError = {
        Error: true,
        HelperText: 'Port must be a value between 0 and 65535',
      };
    } else {
      formErrorContext.MqttPortError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('mqtt_port', value);
    setChangesMade(true);
  };

  return (
    <>
      <TextField
        name="mqtt_host"
        value={fieldState.mqtt_host}
        error={formErrorContext.MqttHostError.Error}
        helperText={formErrorContext.MqttHostError.HelperText}
        onChange={handleMqttHostChange}
        required
        label="MQTT Host"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="mqtt_port"
        value={fieldState.mqtt_port}
        error={formErrorContext.MqttPortError.Error}
        helperText={formErrorContext.MqttPortError.HelperText}
        onChange={handleMqttPortChange}
        type="number"
        required
        label="MQTT Port"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <TextField
        name="mqtt_topic"
        value={fieldState.mqtt_topic}
        onChange={(event) => {
          setFieldStateHelper('mqtt_topic', event.target.value);
          setChangesMade(true);
        }}
        required
        label="MQTT Topic"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <EnumSelectHelper
        name="mqtt_auth_type"
        value={fieldState.mqtt_auth_type.toString()}
        onChange={(event) => {
          setFieldStateHelper('mqtt_auth_type', event.target.value as keyof typeof MQTT_AUTH_TYPES);
          setChangesMade(true);
        }}
        label="MQTT Authentication Method"
        options={MQTT_AUTH_TYPES}
      />
      {fieldState.mqtt_auth_type.toString().toUpperCase() == 'USERPW' && (
        <>
          <TextField
            name="mqtt_username"
            value={fieldState.mqtt_username}
            onChange={(event) => {
              setFieldStateHelper('mqtt_username', event.target.value);
              setChangesMade(true);
            }}
            required
            label="MQTT Username"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            name="mqtt_password"
            value={fieldState.mqtt_password}
            onChange={(event) => {
              setFieldStateHelper('mqtt_password', event.target.value);
              setChangesMade(true);
            }}
            required
            label="MQTT Password"
            margin="dense"
            variant="outlined"
            type={showMqttPassword ? 'text' : 'password'}
            autoComplete="off"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle MQTT password visibility"
                    onClick={handleClickShowMqttPassword}
                    onMouseDown={handleMouseDownMqttPassword}>
                    {showMqttPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}
      <Stack spacing={2} direction="row" justifyContent="space-between">
        <FormControlLabel
          control={
            <Checkbox
              name="mqtt_tls"
              checked={fieldState.mqtt_tls}
              onChange={(event) => {
                setFieldStateHelper('mqtt_tls', event.target.checked);
                setChangesMade(true);
              }}
            />
          }
          label="Use TLS with MQTT"
        />
      </Stack>
    </>
  );
}
