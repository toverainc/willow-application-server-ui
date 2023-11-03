import React from 'react';
import { NotifyData, NotifyFormErrorStates } from '../models';
import {
  FormControl,
  Stack,
  FormControlLabel,
  Checkbox,
  Input,
  InputLabel,
  Slider,
} from '@mui/material';
import { HelpTooltip } from '../../../misc/helperfunctions';

export default function StrobeEffect({
  notifyData,
  setNotifyDataHelper,
}: {
  notifyData: NotifyData;
  setNotifyDataHelper: (key: keyof NotifyData, value: NotifyData[keyof NotifyData]) => void;
}) {
  const [useStrobe, setUseStrobe] = React.useState(false);

  // Handlers
  function handleUseStrobeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUseStrobe(event.target.checked);
    if (!event.target.checked) {
      setNotifyDataHelper('strobe_period_ms', undefined);
    } else if (!notifyData.strobe_period_ms) {
      setNotifyDataHelper('strobe_period_ms', 20);
    }
  }

  function handleStrobeIntervalSliderChange(event: Event, newValue: number | number[]) {
    setNotifyDataHelper('strobe_period_ms', newValue as number);
  }

  function handleStrobeIntervalInputChange(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    setNotifyDataHelper(
      'strobe_period_ms',
      event.target.value === '' ? undefined : Number(event.target.value)
    );
  }

  function handleStrobeIntervalBlur() {
    const value = notifyData.strobe_period_ms;
    if (value && value < 20) {
      setNotifyDataHelper('strobe_period_ms', 20);
    } else if (value && value > 1000) {
      setNotifyDataHelper('strobe_period_ms', 1000);
    } else if (!value) {
      setNotifyDataHelper('strobe_period_ms', 20);
    }
  }

  return (
    <>
      <FormControl fullWidth>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox name="use_strobe" checked={useStrobe} onChange={handleUseStrobeChange} />
            }
            label="Strobe Display"
          />
          <HelpTooltip tooltip="If checked, will strobe the display at the interval defined below"></HelpTooltip>
        </Stack>
      </FormControl>
      {useStrobe && (
        <>
          <InputLabel>Strobe Interval</InputLabel>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <Slider
              name="strobe_period_ms"
              value={notifyData.strobe_period_ms}
              onChange={handleStrobeIntervalSliderChange}
              min={20}
              max={1000}
              size="small"
              valueLabelDisplay="auto"
            />
            <Input
              value={notifyData.strobe_period_ms}
              size="small"
              onChange={handleStrobeIntervalInputChange}
              onBlur={handleStrobeIntervalBlur}
              inputProps={{
                step: 1,
                min: 20,
                max: 1000,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
            <HelpTooltip tooltip="The interval in miliseconds to strobe the display" />
          </Stack>
        </>
      )}
    </>
  );
}
