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
import { toast } from 'react-toastify';
import { post } from '../misc/fetchers';
import { mutate } from 'swr';
import { mergeReleases } from '../pages/upgrades';

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
  const { data: releaseData, error } = useSWR<any[]>('/api/release?type=was');
  const [wasUrl, setWasUrl] = React.useState<string>('');

  async function onFlash(event: any) {
    try {
      await post('/api/client?action=update', {
        ota_url: wasUrl,
        hostname: client.hostname,
      });
    } catch (e) {
      toast.error('Client upgrade request failed!');
      console.error(`Client upgrade request failed with ${e}`);
      return e;
    }
    toast.success('Client upgrade requested!');
    await mutate('/api/client'); //OTA upgrade is very async so this won't really work but better than nothing
    setTimeout(() => mutate('/api/client'), 30 * 1000); //hackz to make it work. Mutate in 30 seconds so we catch changes
    onClose(event);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Over the Air (OTA) Upgrade</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 2 }}>
          Select a release to upgrade &quot;
          {client.label || client.hostname}&quot;
        </DialogContentText>
        <FormControl fullWidth>
          <InputLabel id="release-label">Release</InputLabel>
          <Select
            labelId="release-label"
            fullWidth={true}
            value={wasUrl}
            label="Release"
            onChange={(event: any) => setWasUrl(event.target.value as string)}>
            {releaseData &&
              mergeReleases(releaseData)
                .filter((r) => r.platform == client.platform && r.was_url)
                .map((asset) => (
                  <MenuItem key={client.hostname + asset.willow_url} value={asset.was_url as any}>
                    {asset.name}
                  </MenuItem>
                ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onFlash}>Upgrade</Button>
      </DialogActions>
    </Dialog>
  );
}
