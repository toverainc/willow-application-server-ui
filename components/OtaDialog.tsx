import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from 'react';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';
import { fetcher, post } from '../misc/fetchers';

import { Client, Release, ReleaseAsset } from '../misc/model';

export default function OtaDialog({
  client,
  selectedRelease,
  open,
  onClose,
}: {
  client: Client;
  selectedRelease?: ReleaseAsset;
  open: boolean;
  onClose: (event: any) => void;
}) {
  const { data: releaseData, error } = useSWR<Release[]>('/api/release?type=was');
  const [wasUrl, setWasUrl] = React.useState<string>(selectedRelease?.was_url ?? '');

  async function onFlash(event: any) {
    try {
      await post('/api/client?action=update', {
        ota_url: wasUrl,
        hostname: client.hostname,
      });
      setTimeout(() => {
        mutate<Client[]>('/api/client', fetcher('/api/client'));
      }, 500);
    } catch (e) {
      toast.error('Client upgrade request failed!');
      console.error(`Client upgrade request failed with ${e}`);
      return e;
    }
    toast.success('Client upgrade requested!');
    setTimeout(() => {
      mutate<Client[]>('/api/client', fetcher('/api/client'));
    }, 100);
    onClose(event);
  }

  React.useEffect(() => {
    if (releaseData && !selectedRelease?.was_url) {
      for (const release of releaseData) {
        let was_url = release.assets.filter(
          (asset) =>
            asset.platform == client.platform && asset.build_type != 'dist' && asset.was_url
        )[0]?.was_url;

        if (was_url) {
          setWasUrl(was_url);
          break;
        }
      }
    }
  }, [releaseData]);

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
              releaseData.map((release) =>
                release.assets
                  .filter(
                    (asset) =>
                      asset.platform == client.platform &&
                      asset.build_type != 'dist' &&
                      asset.was_url
                  )
                  .map((asset) => (
                    <MenuItem
                      key={client.hostname + asset.browser_download_url}
                      value={asset.was_url as any}>
                      {release.name}
                    </MenuItem>
                  ))
              )}
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
