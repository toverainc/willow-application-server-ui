import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
} from '@mui/material';
import { NextPage } from 'next';
import React from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { NotifyCommand, NotifyData, NotifyFormErrorStates } from '../../appmodels/notifyapp/models';
import LeftMenu from '../../components/LeftMenu';
import LoadingSpinner from '../../components/LoadingSpinner';
import { post } from '../../misc/fetchers';
import { HelpTooltip, setFieldStateHelperImpl } from '../../misc/helperfunctions';
import { Client } from '../../misc/model';
import { ValidateUrl } from '../../misc/validations';
import { VolumeDown, VolumeUp } from '@mui/icons-material';

const NotifyApp: NextPage = () => {
  const { data: clients, isLoading } = useSWR<Client[]>('/api/client');
  const [client, setClient] = React.useState<string>('All Clients');
  const [useAudio, setUseAudio] = React.useState(false);
  const [displayText, setDisplayText] = React.useState(false);

  const [notifyData, setNotifyData] = React.useState<NotifyData>({
    backlight: true,
    backlight_max: true,
    repeat: 1,
    volume: 50,
  });
  function setNotifyDataHelper<KeyType extends keyof NotifyData>(
    key: KeyType,
    value: NotifyData[KeyType]
  ) {
    setFieldStateHelperImpl<NotifyData>(key, value, setNotifyData);
  }

  const [notifyFormErrorStates, setNotifyFormErrorStates] = React.useState<NotifyFormErrorStates>(
    new NotifyFormErrorStates()
  );
  function setNotifyFormErrorStateHelper<KeyType extends keyof NotifyFormErrorStates>(
    key: KeyType,
    value: NotifyFormErrorStates[KeyType]
  ) {
    setFieldStateHelperImpl<NotifyFormErrorStates>(key, value, setNotifyFormErrorStates);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      let notifyCommand = new NotifyCommand();
      notifyCommand.data = notifyData;
      if (client != 'All Clients') {
        notifyCommand.hostname = client;
      }
      console.log(JSON.stringify(notifyCommand));
      await post('/api/client?action=notify', notifyCommand);
      toast.success(`Notification sent to ${client}!`);
      /* Eventually add logic here to generate the CURL equivalent of the above request
         as well as the HA RESTful Command object documented at https://www.home-assistant.io/integrations/rest_command/
         NOTE: Do this in realtime instead, in case user just wants to see the code without actually sending the notification?
       */
    } catch (e) {
      toast.error(`Notification failed to send to ${client}!`);
    }
  }

  // Volume Handlers
  const handleSpeakerVolumeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifyDataHelper(
      'volume',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
  };

  const handleSpeakerVolumeSliderChange = (event: Event, newValue: number | number[]) => {
    setNotifyDataHelper('volume', newValue as number);
  };

  const handleSpeakerVolumeBlur = () => {
    const speakerVolumeValue = notifyData.volume;
    if (speakerVolumeValue && speakerVolumeValue < 0) {
      setNotifyDataHelper('volume', 0);
    } else if (speakerVolumeValue && speakerVolumeValue > 100) {
      setNotifyDataHelper('volume', 100);
    } else if (!speakerVolumeValue) {
      setNotifyDataHelper('volume', 50);
    }
  };

  // Handler for Use Audio
  const handleUseAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseAudio(event.target.checked);
    if (!event.target.checked) {
      setNotifyDataHelper('audio_url', '');
      setNotifyDataHelper('volume', 50);
      setNotifyFormErrorStateHelper('audio_url', { Error: false, HelperText: '' });
    }
  };

  // Handler for Display Text
  const handleDisplayTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayText(event.target.checked);
    if (!event.target.checked) {
      setNotifyDataHelper('text', undefined);
    }
  };

  // Helpers for fields with validation
  function handleAudioUrlChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const value = event.target.value;
    const validationResult = ValidateUrl(value);

    if (validationResult && value != '') {
      setNotifyFormErrorStateHelper('audio_url', { Error: true, HelperText: validationResult });
    } else {
      setNotifyFormErrorStateHelper('audio_url', { Error: false, HelperText: '' });
    }

    setNotifyDataHelper('audio_url', value);
  }

  return (
    <LeftMenu>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <form name="general-settings-form" onSubmit={handleSubmit}>
          <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 style={{ textAlign: 'center' }}>Notify App</h2>
            <h4 style={{ textAlign: 'center' }}>
              Fill out the below form and click 'Send Notification' to trigger notifications on your
              willow devices!
            </h4>
            <FormControl
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              sx={{ flexDirection: 'row' }}>
              <InputLabel id="client">Client</InputLabel>
              <Select
                name="client"
                value={client}
                label="client"
                onChange={(event) => {
                  setClient(event.target.value);
                }}
                sx={{ flexGrow: '1' }}>
                <MenuItem key={'all_clients'} value={'All Clients'}>
                  All Clients
                </MenuItem>
                {clients &&
                  clients.map((client) => (
                    <MenuItem key={client.label ?? client.hostname} value={client.hostname}>
                      {client.label ?? client.hostname}
                    </MenuItem>
                  ))}
              </Select>
              <HelpTooltip tooltip="The Client to send the notification to" />
            </FormControl>
            <FormControl fullWidth>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox name="use_audio" checked={useAudio} onChange={handleUseAudioChange} />
                  }
                  label="Use Audio"
                />
                <HelpTooltip tooltip="If checked, the notification will play audio from the source defined below"></HelpTooltip>
              </Stack>
            </FormControl>
            {useAudio && (
              <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
                <TextField
                  name="audio_url"
                  required={useAudio}
                  value={notifyData.audio_url}
                  error={notifyFormErrorStates.audio_url.Error}
                  helperText={notifyFormErrorStates.audio_url.HelperText}
                  onChange={handleAudioUrlChange}
                  label="Audio Source URL"
                  margin="dense"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
                <HelpTooltip tooltip="A URL to an audio resource to play. This can be left blank if you do not want audio to play" />
              </Stack>
            )}
            {useAudio && notifyData.audio_url && !notifyFormErrorStates.audio_url.Error && (
              <>
                <InputLabel>Volume</InputLabel>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                  <VolumeDown />
                  <Slider
                    name="volume"
                    value={notifyData.volume}
                    onChange={handleSpeakerVolumeSliderChange}
                    min={0}
                    max={100}
                    size="small"
                    valueLabelDisplay="auto"
                  />
                  <VolumeUp />
                  <Input
                    value={notifyData.volume}
                    size="small"
                    onChange={handleSpeakerVolumeInputChange}
                    onBlur={handleSpeakerVolumeBlur}
                    inputProps={{
                      step: 1,
                      min: 0,
                      max: 100,
                      type: 'number',
                      'aria-labelledby': 'input-slider',
                    }}
                  />
                  <HelpTooltip tooltip="If an audio source is defined, this sets the volume level for the audio" />
                </Stack>
              </>
            )}
            <FormControl fullWidth>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="display_text"
                      checked={displayText}
                      onChange={handleDisplayTextChange}
                    />
                  }
                  label="Display Text"
                />
                <HelpTooltip tooltip="If checked, the notification will display the text defined below on the client's display"></HelpTooltip>
              </Stack>
            </FormControl>
            {displayText && (
              <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
                <TextField
                  name="text"
                  required={displayText}
                  value={notifyData.text}
                  onChange={(event) => setNotifyDataHelper('text', event.target.value)}
                  label="Display Text"
                  margin="dense"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
                <HelpTooltip tooltip="Text to be displayed on the client. This can be left blank if you do not want text to display on the client" />
              </Stack>
            )}
            <FormControl fullWidth>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="backlight"
                      checked={notifyData.backlight}
                      onChange={(event) => {
                        setNotifyDataHelper('backlight', event.target.checked);
                      }}
                    />
                  }
                  label="Backlight"
                />
                <HelpTooltip tooltip="If checked, will turn on the display of the client"></HelpTooltip>
              </Stack>
            </FormControl>
            <FormControl fullWidth>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="max_backlight"
                      checked={notifyData.backlight_max}
                      onChange={(event) => {
                        setNotifyDataHelper('backlight_max', event.target.checked);
                      }}
                    />
                  }
                  label="Max Backlight"
                />
                <HelpTooltip tooltip="If checked, the display of the client will be set to maximum brightness"></HelpTooltip>
              </Stack>
            </FormControl>
            <Stack direction="row" spacing={2} sx={{ mb: 1 }} justifyContent="flex-end">
              <Button id="sendNotification" type="submit" variant="outlined">
                Send Notification
              </Button>
              <HelpTooltip tooltip="Send your notification to the specified client with the above arguments"></HelpTooltip>
            </Stack>
          </div>
        </form>
      )}
    </LeftMenu>
  );
};

export default NotifyApp;
