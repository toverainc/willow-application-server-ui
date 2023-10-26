import { TextField, InputAdornment, IconButton } from '@mui/material';
import { useContext } from 'react';
import { FormErrorContext } from '../pages/_app';
import { ValidateUrl } from '../misc/validations';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import React from 'react';

export default function OpenHabCommandEndpoint({
  openhabUrlValue,
  setOpenhabUrlValue,
  openhabTokenValue,
  setOpenhabTokenValue,
  setChangesMade,
}: {
  openhabUrlValue: string | undefined;
  setOpenhabUrlValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  openhabTokenValue: string | undefined;
  setOpenhabTokenValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  setChangesMade: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const formErrorContext = useContext(FormErrorContext);
  const [showOhToken, setShowOhToken] = React.useState(false);
  const handleClickShowOhToken = () => setShowOhToken(!showOhToken);
  const handleMouseDownOhToken = () => setShowOhToken(!showOhToken);

  // Handlers for fields with validations
  const handleOpenhabUrlChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const validationResult = ValidateUrl(value);

    if (validationResult) {
      formErrorContext.OpenhabUrlError = { Error: true, HelperText: validationResult };
    } else {
      formErrorContext.OpenhabUrlError = { Error: false, HelperText: '' };
    }

    setOpenhabUrlValue(value);
    setChangesMade(true);
  };

  return (
    <>
      <TextField
        name="openhab_url"
        value={openhabUrlValue}
        error={formErrorContext.OpenhabUrlError.Error}
        helperText={formErrorContext.OpenhabUrlError.HelperText}
        onChange={handleOpenhabUrlChange}
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
  );
}
