import { Stack } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import 'react-datetime/css/react-datetime.css';
import { HelpTooltip } from '../../../misc/helperfunctions';
import { NotifyData } from '../models';

export default function DateTimeSelector({
  notifyData,
  setNotifyDataHelper,
}: {
  notifyData: NotifyData;
  setNotifyDataHelper: (key: keyof NotifyData, value: NotifyData[keyof NotifyData]) => void;
}) {
  const [notificationDateTime, setNotificationDateTime] = React.useState<Dayjs | null>(
    dayjs(notifyData.id ?? new Date().getTime() + 1000)
  );

  React.useEffect(() => {
    if (notifyData.id) {
      setNotificationDateTime(dayjs(notifyData.id));
    }
  }, [notifyData]);

  function handleDateTimeChange(date: dayjs.Dayjs | null) {
    //setNotificationDateTime(date ?? dayjs(new Date().getTime() + 1000));
    setNotifyDataHelper('id', (date?.toDate() ?? new Date()).getTime() + 1000);
  }
  return (
    <>
      <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} justifyContent="space-between">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Notification Date/Time"
            value={notificationDateTime}
            onChange={handleDateTimeChange}
            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
            disablePast={true}
          />
        </LocalizationProvider>
        <HelpTooltip tooltip="The date and time you want the notification to happen." />
      </Stack>
    </>
  );
}
