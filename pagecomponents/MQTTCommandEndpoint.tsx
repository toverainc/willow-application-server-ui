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
import { MQTT_AUTH_TYPES } from '../misc/model';
import { ValidateIpOrHostname } from '../misc/validations';
import { FormErrorContext } from '../pages/_app';

export default function MQTTCommandEndpoint({
  mqttHostValue,
  setMqttHostValue,
  mqttPortValue,
  setMqttPortValue,
  mqttTopicValue,
  setMqttTopicValue,
  mqttTlsValue,
  setMqttTlsValue,
  mqttAuthTypeValue,
  setMqttAuthTypeValue,
  mqttUsernameValue,
  setMqttUsernameValue,
  mqttPasswordValue,
  setMqttPasswordValue,
  setChangesMade,
}: {
  mqttHostValue: string | undefined;
  setMqttHostValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  mqttPortValue: number | undefined;
  setMqttPortValue: React.Dispatch<React.SetStateAction<number | undefined>>;
  mqttTopicValue: string | undefined;
  setMqttTopicValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  mqttTlsValue: boolean | undefined;
  setMqttTlsValue: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  mqttAuthTypeValue: keyof typeof MQTT_AUTH_TYPES;
  setMqttAuthTypeValue: React.Dispatch<React.SetStateAction<keyof typeof MQTT_AUTH_TYPES>>;
  mqttUsernameValue: string | undefined;
  setMqttUsernameValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  mqttPasswordValue: string | undefined;
  setMqttPasswordValue: React.Dispatch<React.SetStateAction<string | undefined>>;
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

    setMqttHostValue(value);
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

    setMqttPortValue(value);
    setChangesMade(true);
  };

  return (
    <>
      <TextField
        name="mqtt_host"
        value={mqttHostValue}
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
        value={mqttPortValue}
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
        value={mqttTopicValue}
        onChange={(event) => {
          setMqttTopicValue(event.target.value);
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
        value={mqttAuthTypeValue.toString()}
        onChange={(event) => {
          setMqttAuthTypeValue(event.target.value as keyof typeof MQTT_AUTH_TYPES);
          setChangesMade(true);
        }}
        label="MQTT Authentication Method"
        options={MQTT_AUTH_TYPES}
      />
      {mqttAuthTypeValue.toString().toUpperCase() == 'USERPW' && (
        <>
          <TextField
            name="mqtt_username"
            value={mqttUsernameValue}
            onChange={(event) => {
              setMqttUsernameValue(event.target.value);
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
            value={mqttPasswordValue}
            onChange={(event) => {
              setMqttPasswordValue(event.target.value);
              setChangesMade(true);
            }}
            required
            label="MQTT Password"
            margin="dense"
            variant="outlined"
            type={showMqttPassword ? 'text' : 'password'}
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
              checked={mqttTlsValue}
              onChange={(event) => {
                setMqttTlsValue(event.target.checked);
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
