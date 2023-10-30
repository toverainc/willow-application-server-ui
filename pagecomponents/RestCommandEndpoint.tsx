import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useContext } from 'react';
import { EnumSelectHelper } from '../misc/helperfunctions';
import { REST_AUTH_TYPES } from '../misc/model';
import { ValidateUrl } from '../misc/validations';
import { FormErrorContext } from '../pages/_app';
import React from 'react';

export default function RestCommandEndpoint({
  restUrlValue,
  setRestUrlValue,
  restAuthTypeValue,
  setRestAuthTypeValue,
  restAuthUserValue,
  setRestAuthUserValue,
  restAuthPassValue,
  setRestAuthPassValue,
  restAuthHeaderValue,
  setRestAuthHeaderValue,
  setChangesMade,
}: {
  restUrlValue: string | undefined;
  setRestUrlValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  restAuthTypeValue: keyof typeof REST_AUTH_TYPES;
  setRestAuthTypeValue: React.Dispatch<React.SetStateAction<keyof typeof REST_AUTH_TYPES>>;
  restAuthUserValue: string | undefined;
  setRestAuthUserValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  restAuthPassValue: string | undefined;
  setRestAuthPassValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  restAuthHeaderValue: string | undefined;
  setRestAuthHeaderValue: React.Dispatch<React.SetStateAction<string | undefined>>;
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

    setRestUrlValue(value);
    setChangesMade(true);
  };

  return (
    <>
      <TextField
        name="rest_url"
        value={restUrlValue}
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
  );
}
