import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useSWR from 'swr';
import { post } from '../misc/fetchers';
import { mutate } from 'swr';
import { mergeReleases } from '../pages/updates';

import { Client } from '../misc/model';

export default function OtaDialog({
  client,
  open,
  onClose,
}: {
  client: Client;
  open: boolean;
  onClose: (event: any) => void;
}) {
  const { data: releaseData, error } = useSWR<any[]>('/api/releases/internal/?refresh=false');
  const [wasUrl, setWasUrl] = React.useState<string>('');

  async function onFlash(event: any) {
    await post('/api/ota', {
      ota_url: wasUrl,
      hostname: client.hostname,
    });
    await mutate('/api/clients'); //OTA update is very async so this won't really work but better than nothing
    setTimeout(() => mutate('/api/clients'), 30 * 1000); //hackz to make it work. Mutate in 30 seconds so we catch changes
    onClose(event);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Flash Release OTA</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 2 }}>
          Select a release to update the client &quot;
          {client.label || client.hostname}&quot; OTA
        </DialogContentText>
        <FormControl fullWidth>
          <InputLabel id="release-label">Release</InputLabel>
          <Select
            labelId="release-label"
            fullWidth={true}
            value={wasUrl}
            label="Release"
            onChange={(event) => setWasUrl(event.target.value as string)}>
            {releaseData &&
              mergeReleases(undefined, releaseData)
                .filter((r) => r.platform == client.hw_type && r.was_url)
                .map((asset) => (
                  <MenuItem key={client.hostname + asset.gh_url} value={asset.was_url as any}>
                    {asset.name}
                  </MenuItem>
                ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onFlash}>Flash Release</Button>
      </DialogActions>
    </Dialog>
  );
}
