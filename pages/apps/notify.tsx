import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { NextPage } from 'next';
import React from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import {
  NotifyCommand,
  NotifyData,
  NotifyFormErrorStates,
} from '../../appcomponents/notifyapp/models';
import AudioSource from '../../appcomponents/notifyapp/pagecomponents/AudioSource';
import CodePanels from '../../appcomponents/notifyapp/pagecomponents/CodePanels';
import StrobeEffect from '../../appcomponents/notifyapp/pagecomponents/StrobeEffect';
import LeftMenu from '../../components/LeftMenu';
import LoadingSpinner from '../../components/LoadingSpinner';
import { post } from '../../misc/fetchers';
import { HelpTooltip, parseIntOrUndef, setFieldStateHelperImpl } from '../../misc/helperfunctions';
import { Client } from '../../misc/model';

const NotifyApp: NextPage = () => {
  const { data: clients, isLoading } = useSWR<Client[]>('/api/client');
  const [selectedClient, setSelectedClient] = React.useState<Client | undefined>();
  const [displayText, setDisplayText] = React.useState(false);

  const [notifyData, setNotifyData] = React.useState<NotifyData>({
    backlight: true,
    backlight_max: true,
    repeat: 1,
    volume: 50,
    //id: new Date().getTime() + 1000,
  });
  function setNotifyDataHelper<KeyType extends keyof NotifyData>(
    key: KeyType,
    value: NotifyData[KeyType]
  ) {
    setFieldStateHelperImpl<NotifyData>(key, value, setNotifyData);
  }

  const [notifyCommand, setNotifyCommand] = React.useState<NotifyCommand>(new NotifyCommand());
  function setNotifyCommandHelper<KeyType extends keyof NotifyCommand>(
    key: KeyType,
    value: NotifyCommand[KeyType]
  ) {
    setFieldStateHelperImpl<NotifyCommand>(key, value, setNotifyCommand);
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
      if (selectedClient != undefined) {
        notifyCommand.hostname = selectedClient.hostname;
      }
      /* if (dayjs(notifyData.id) < dayjs()) {
        setNotifyDataHelper('id', new Date().getTime() + 1000);
      } */
      notifyCommand.data = notifyData;
      await post('/api/client?action=notify', notifyCommand);
      toast.success(
        `Notification sent to ${
          selectedClient?.label ?? selectedClient?.hostname ?? 'all clients'
        }!`
      );
    } catch (e) {
      toast.error(`Notification failed to send to ${selectedClient}!`);
    }
  }

  // Handler for Display Text
  const handleDisplayTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayText(event.target.checked);
    if (!event.target.checked) {
      setNotifyDataHelper('text', undefined);
    }
  };

  // Handlers for fields
  function handleRepeatInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setNotifyDataHelper('repeat', parseIntOrUndef(event.target.value) ?? undefined);
  }

  function handleRepeatInputBlur() {
    if ((notifyData.repeat ?? 0) < 1) {
      setNotifyDataHelper('repeat', 1);
    }
  }

  // Ensure NotifyCommand is always updated by changes to hostname or notifyData
  React.useEffect(() => {
    setNotifyCommandHelper('data', notifyData);
    setNotifyCommandHelper('hostname', selectedClient?.hostname);
  }, [notifyData, selectedClient]);

  return (
    <LeftMenu>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <form name="general-settings-form" onSubmit={handleSubmit}>
          <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 style={{ textAlign: 'center' }}>Notify</h2>
            <h4 style={{ textAlign: 'center' }}>
              {`Send notifications with Willow!
                Notifications can be used for alarms, timers, calendar reminders, and more.
                Here you can experiment with Willow notifications and learn how to call them from your own application.`}
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
                value={selectedClient?.label ?? selectedClient?.hostname ?? 'All Clients'}
                label="client"
                sx={{ flexGrow: '1' }}>
                <MenuItem
                  key={'all_clients'}
                  value={'All Clients'}
                  onClick={(event) => setSelectedClient(undefined)}>
                  All Clients
                </MenuItem>
                {clients &&
                  clients.map((client) => (
                    <MenuItem
                      key={client.label ?? client.hostname}
                      onClick={(event) => setSelectedClient(client)}
                      value={client.label ?? client.hostname}>
                      {client.label ?? client.hostname}
                    </MenuItem>
                  ))}
              </Select>
              <HelpTooltip tooltip="The client to send the notification. 'All Clients' sends the notification to all connected clients." />
            </FormControl>
            {/*<DateTimeSelector notifyData={notifyData} setNotifyDataHelper={setNotifyDataHelper} /> */}
            <AudioSource
              notifyData={notifyData}
              setNotifyDataHelper={setNotifyDataHelper}
              notifyFormErrorStates={notifyFormErrorStates}
              setNotifyFormErrorStateHelper={setNotifyFormErrorStateHelper}
            />
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
                <HelpTooltip tooltip="Display the defined text on the client display."></HelpTooltip>
              </Stack>
            </FormControl>
            {displayText && (
              <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
                <TextField
                  name="text"
                  required={displayText}
                  value={notifyData.text}
                  onChange={(event) => setNotifyDataHelper('text', event.target.value)}
                  label="Text for Display"
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
                  label="Turn on Display Backlight"
                />
                <HelpTooltip tooltip="Turn on the display backlight of the client."></HelpTooltip>
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
                  label="Set Display Backlight Brightness to Maximum"
                />
                <HelpTooltip tooltip="Set display backlight to maximum brightness."></HelpTooltip>
              </Stack>
            </FormControl>
            <StrobeEffect notifyData={notifyData} setNotifyDataHelper={setNotifyDataHelper} />
            <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
              <TextField
                name="repeat"
                required
                value={notifyData.repeat}
                onChange={handleRepeatInputChange}
                onBlur={handleRepeatInputBlur}
                label="Number of Times to Repeat Notification"
                margin="dense"
                variant="outlined"
                size="small"
                inputProps={{
                  step: 1,
                  min: 1,
                  type: 'number',
                }}
                fullWidth
              />
              <HelpTooltip tooltip="The number of times to repeat the notification. Default is to only notify once. Any client can stop a notification immediately by tapping 'Cancel' on the display." />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 1 }} justifyContent="flex-end">
              <Button id="sendNotification" type="submit" variant="outlined">
                Send Notification
              </Button>
              <HelpTooltip tooltip="Send your notification to client(s)!"></HelpTooltip>
            </Stack>
            <CodePanels notifyCommand={notifyCommand} />
          </div>
        </form>
      )}
    </LeftMenu>
  );
};

export default NotifyApp;
