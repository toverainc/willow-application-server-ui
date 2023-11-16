import { VolumeDown, VolumeUp } from '@mui/icons-material';
import { Input, InputLabel, SelectChangeEvent, Slider, Stack, TextField } from '@mui/material';
import React from 'react';
import { EnumSelectHelper, HelpTooltip } from '../../../misc/helperfunctions';
import { GeneralSettings } from '../../../misc/model';
import { ValidateUrl } from '../../../misc/validations';
import { AUDIO_SOURCES, NotifyData, NotifyFormErrorStates } from '../models';

export default function AudioSource({
  notifyData,
  setNotifyDataHelper,
  generalSettings,
  notifyFormErrorStates,
  setNotifyFormErrorStateHelper,
}: {
  notifyData: NotifyData;
  setNotifyDataHelper: (key: keyof NotifyData, value: NotifyData[keyof NotifyData]) => void;
  generalSettings: GeneralSettings;
  notifyFormErrorStates: NotifyFormErrorStates;
  setNotifyFormErrorStateHelper: (
    key: keyof NotifyFormErrorStates,
    value: NotifyFormErrorStates[keyof NotifyFormErrorStates]
  ) => void;
}) {
  const [audioSource, setAudioSource] = React.useState<keyof typeof AUDIO_SOURCES>('TTS');
  const [ttsText, setTtsText] = React.useState<string>('');

  // Handlers for fields with validation
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
      setNotifyDataHelper('volume', generalSettings?.speaker_volume);
    }
  };

  // TTS URL Generation
  function handleAudioTtsUrlChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.target.value && !(event.target.value.trim() == '')) {
      setTtsText(event.target.value);
      const url = new URL(generalSettings?.wis_tts_url);
      url.searchParams.append('text', event.target.value.trim());
      setNotifyDataHelper('audio_url', url.toString());
    } else {
      setTtsText('');
      setNotifyDataHelper('audio_url', undefined);
    }
  }

  function handleAudioSourceChange(event: SelectChangeEvent<string>) {
    setAudioSource(event.target.value as keyof typeof AUDIO_SOURCES);
    setTtsText('');
    setNotifyDataHelper('audio_url', undefined);
    setNotifyFormErrorStateHelper('audio_url', { Error: false, HelperText: '' });
  }

  React.useEffect(() => {
    if (generalSettings) {
      setNotifyDataHelper('volume', generalSettings.speaker_volume);
    }
  }, [generalSettings]);

  return (
    <>
      <EnumSelectHelper
        label="Audio Source"
        options={AUDIO_SOURCES}
        onChange={handleAudioSourceChange}
        value={audioSource}
        tooltip="The source of the audio to play for the notification. Can be a URL to an audio file or text to speak."
      />
      {audioSource == AUDIO_SOURCES.URL && (
        <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
          <TextField
            name="audio_url"
            required
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
          <HelpTooltip tooltip="The URL for the audio to play." />
        </Stack>
      )}
      {audioSource == AUDIO_SOURCES.TTS && (
        <Stack spacing={2} direction="row" sx={{ mb: 1, mt: 1 }} alignItems="center">
          <TextField
            name="audio_url_tts"
            required
            value={ttsText}
            onChange={handleAudioTtsUrlChange}
            label="Text to Speak"
            margin="dense"
            variant="outlined"
            size="small"
            fullWidth
          />
          <HelpTooltip tooltip="Text to speak on the client. Uses your configured TTS URL from Configuration General Settings." />
        </Stack>
      )}
      {!notifyFormErrorStates.audio_url.Error && (
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
            <HelpTooltip tooltip="If an audio source is defined this sets the volume level for the speaker on the client. Defaults to your configured speaker volume from Configuration General Settings." />
          </Stack>
        </>
      )}
    </>
  );
}
