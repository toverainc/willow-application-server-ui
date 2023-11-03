import { InputLabel, Stack } from '@mui/material';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { HelpTooltip } from '../../../misc/helperfunctions';
import React from 'react';
import { NotifyData } from '../models';

export default function DateTimePicker({
  notifyData,
  setNotifyDataHelper,
}: {
  notifyData: NotifyData;
  setNotifyDataHelper: (key: keyof NotifyData, value: NotifyData[keyof NotifyData]) => void;
}) {
  const [notificationDateTime, setNotificationDateTime] = React.useState<Date>(new Date());

  function handleDateTimeChange(event: string | moment.Moment) {
    setNotificationDateTime(new Date(event.toString()));
    setNotifyDataHelper('id', new Date(event.toString()).getTime());
  }
  return (
    <>
      <InputLabel>Notification Date/Time</InputLabel>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
        <DateTime value={notificationDateTime} onChange={handleDateTimeChange} />
        <HelpTooltip tooltip="The date and time you want the notification to happen" />
      </Stack>
    </>
  );
}
