import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useContext } from 'react';
import { EnumSelectHelper } from '../misc/helperfunctions';
import { GeneralSettings, REST_AUTH_TYPES } from '../misc/model';
import { ValidateUrl } from '../misc/validations';
import { FormErrorContext } from '../pages/_app';
import React from 'react';

export default function RestCommandEndpoint({
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
  const [showRestPassword, setShowRestPassword] = React.useState(false);
  const handleClickShowRestPassword = () => setShowRestPassword(!showRestPassword);
  const handleMouseDownRestPassword = () => setShowRestPassword(!showRestPassword);

  // Handlers for fields with validation
  const handleRestUrlChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateUrl(value);

    if (validationResult) {
      formErrorContext.RestUrlError = { Error: true, HelperText: validationResult };
    } else {
      formErrorContext.RestUrlError = { Error: false, HelperText: '' };
    }

    setFieldStateHelper('rest_url', value);
    setChangesMade(true);
  };

  return (
    <>
      <TextField
        name="rest_url"
        value={fieldState.rest_url}
        error={formErrorContext.RestUrlError.Error}
        helperText={formErrorContext.RestUrlError.HelperText}
        onChange={handleRestUrlChange}
        required
        label="REST URL"
        margin="dense"
        variant="outlined"
        size="small"
        fullWidth
      />
      <EnumSelectHelper
        name="rest_auth_type"
        value={fieldState.rest_auth_type.toString()}
        onChange={(event) => {
          setFieldStateHelper('rest_auth_type', event.target.value as keyof typeof REST_AUTH_TYPES);
          setChangesMade(true);
        }}
        label="REST Authentication Method"
        options={REST_AUTH_TYPES}
      />
      {fieldState.rest_auth_type.toString() == 'Basic' && (
        <>
          <TextField
            name="rest_auth_user"
            value={fieldState.rest_auth_user}
            onChange={(event) => {
              setFieldStateHelper('rest_auth_user', event.target.value);
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
            value={fieldState.rest_auth_pass}
            onChange={(event) => {
              setFieldStateHelper('rest_auth_pass', event.target.value);
              setChangesMade(true);
            }}
            required
            label="REST Basic Password"
            margin="dense"
            variant="outlined"
            type={showRestPassword ? 'text' : 'password'}
            autoComplete="off"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle Rest password visibility"
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
      {fieldState.rest_auth_type.toString() == 'Header' && (
        <>
          <TextField
            name="rest_auth_header"
            value={fieldState.rest_auth_header}
            onChange={(event) => {
              setFieldStateHelper('rest_auth_header', event.target.value);
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
  );
}
