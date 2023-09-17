import * as React from 'react';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { post } from '../misc/fetchers';
import { Client } from '../misc/model';
import { mutate } from 'swr';

export default function NameDeviceDialog({
  client,
  open,
  onClose,
}: {
  client: Client;
  open: boolean;
  onClose: (changed: boolean) => void;
}) {
  const [name, setName] = React.useState<string>(client.label || '');

  async function onConfirm(evt: any) {
    try {
      await post('/api/device', { mac_addr: client.mac_addr, label: name });
      await Promise.all([mutate('/api/device'), mutate('/api/clients')]);
    } catch (e) {
      console.error(
        `Saving label "${name}" to ${client.hostname} failed with ${e}`
      );
      toast.error(`Saving name "${name}" to ${client.hostname} failed!`);
      return e;
    }
    toast.success(`Saved name "${name}" to ${client.hostname}!`);
    onClose(true);
  }

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>Rename Device</DialogTitle>
      <DialogContent>
        <TextField
          sx={{ marginTop: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          label="Device Name"
          variant="outlined"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={onConfirm}>Rename</Button>
      </DialogActions>
    </Dialog>
  );
}
