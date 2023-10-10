import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { fetcher, post } from '../misc/fetchers';
import { Client, Release, ReleaseAsset } from '../misc/model';

interface ConfirmationDialogParams {
  open: boolean;
  onClose: (event: any) => void;
  onConfirm: (event: any) => void;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
}

export default function ConfirmDialog(params: ConfirmationDialogParams) {
  return (
    <Dialog
      open={params.open}
      onClose={(evt) => params.onClose(evt)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{params.title || 'Are You Sure?'}</DialogTitle>
      {params.message ? (
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{params.message}</DialogContentText>
        </DialogContent>
      ) : (
        <></>
      )}
      <DialogActions>
        <Button onClick={(evt: any) => params.onClose(evt)}>{params.cancelText || 'Cancel'}</Button>
        <Button onClick={(evt: any) => params.onConfirm(evt)} autoFocus>
          {params.confirmText || 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ResetDialog({
  open,
  onClose,
  client,
}: {
  open: boolean;
  client: Client;
  onClose: (event: any) => void;
}) {
  async function onConfirm(evt: any) {
    try {
      await post('/api/client?action=restart', { hostname: client.hostname });
      setTimeout(() => {
        mutate<Client[]>('/api/client', fetcher('/api/client'));
      }, 500);
    } catch (e) {
      console.error(`Restarting "${client.label || client.hostname}" failed with ${e}`);
      toast.error(`Restarting "${client.label || client.hostname}" failed!`);
      return e;
    }
    toast.success(`Restarted "${client.label || client.hostname}"!`);
    onClose(evt);
  }
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      message={`Clicking confirm will restart "${client.label || client.hostname}"`}
      onConfirm={onConfirm}
    />
  );
}

export function ApplyConfigDialog({
  open,
  onClose,
  client,
}: {
  open: boolean;
  client: Client;
  onClose: (event: any) => void;
}) {
  async function onConfirm(evt: any) {
    try {
      //note if client is not supplied this applies config to all
      await post('/api/config?type=config&apply=1', { hostname: client?.hostname });
      setTimeout(() => {
        mutate<Client[]>('/api/client', fetcher('/api/client'));
      }, 500);
    } catch (e) {
      console.error(
        `Applying configuration to "${client.label || client.hostname}" failed with ${e}`
      );
      toast.error(`Applying configuration to "${client.label || client.hostname}" failed!`);
      return e;
    }
    toast.success(`Applied configuration to "${client.label || client.hostname}"!`);
    onClose(evt);
  }
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      message={
        client
          ? `Clicking confirm will apply the current configuration to "${
              client.label || client.hostname
            }"`
          : `Clicking confirm will apply the current configuration to all clients.`
      }
      onConfirm={onConfirm}
    />
  );
}

export function SaveAndApplyConfigDialog({
  open,
  onClose,
  client,
}: {
  open: boolean;
  client: Client;
  onClose: (event: any) => void;
}) {
  async function onConfirm(evt: any) {
    try {
      //note if client is not supplied this applies config to all
      await post('/api/config?type=config&apply=1', { hostname: client?.hostname });
      setTimeout(() => {
        mutate<Client[]>('/api/client', fetcher('/api/client'));
      }, 500);
    } catch (e) {
      console.error(`Saving and applying configuration failed with ${e}`);
      toast.error(`Saving and applying configuration failed!`);
      return e;
    }
    toast.success(`Saved and applied configuration to call clients!`);
    onClose(evt);
  }
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      message={
        client
          ? `Clicking confirm will apply the current configuration to "${
              client.label || client.hostname
            }"`
          : `Are you sure?`
      }
      onConfirm={onConfirm}
    />
  );
}

export function ApplyNvsDialog({
  open,
  onClose,
  client,
}: {
  open: boolean;
  client: Client;
  onClose: (event: any) => void;
}) {
  async function onConfirm(evt: any) {
    try {
      //note if client is not supplied this applies config to all
      await post('/api/config?type=nvs&apply=1', { hostname: client?.hostname });
      setTimeout(() => {
        mutate<Client[]>('/api/client', fetcher('/api/client'));
      }, 100);
    } catch (e) {
      console.error(
        `Applying connectivity configuration to "${
          client.label || client.hostname
        }" failed with ${e}`
      );
      toast.error(
        `Applying connectivity configuration to "${client.label || client.hostname}" failed!`
      );
      return e;
    }
    toast.success(`Applied connectivity configuration to "${client.label || client.hostname}"!`);
    onClose(evt);
  }
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      message={
        client
          ? `Clicking confirm will apply the current connectivity configuration to "${
              client.label || client.hostname
            }"`
          : `Clicking confirm will apply the current connectivity configuration to all clients.`
      }
      onConfirm={onConfirm}
    />
  );
}

export function DeleteCacheDialog({
  open,
  onClose,
  asset,
  release,
}: {
  open: boolean;
  asset: ReleaseAsset;
  release: Release;
  onClose: (event: any) => void;
}) {
  async function onConfirm(evt: any) {
    try {
      // call delete here
      throw 'Not Implemented';
    } catch (e) {
      console.error(
        `Deleting "${asset.platform}" from storage for release "${release.name}" failed with ${e}`
      );
      toast.error(
        `Deleting "${asset.platform}" from storage for release "${release.name}" failed!`
      );
      return e;
    }
    toast.success(`Deleted "${asset.platform}" from storage for release "${release.name}"!`);
    onClose(evt);
  }
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      message={`Clicking confirm will delete "${asset.platform}" from storage for release "${release.name}".`}
      onConfirm={onConfirm}
    />
  );
}

export function LocateDeviceDialog({
  open,
  onClose,
  client,
}: {
  open: boolean;
  client: Client;
  onClose: (event: any) => void;
}) {
  async function onConfirm(evt: any) {
    try {
      await post('/api/client?action=identify', { hostname: client.hostname });
    } catch (e) {
      console.error(
        `Calling Locate Device for client "${client.label || client.hostname}" failed with ${e}`
      );
      toast.error(`Calling Locate Device for client "${client.label || client.hostname}" failed!`);
      return e;
    }
    toast.success(`Locate Device triggered for client "${client.label || client.hostname}"!`);
    onClose(evt);
  }
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      message={`Clicking confirm will trigger device location for client "${
        client.label || client.hostname
      }". The client will turn on its display and chime for 5 seconds.`}
      onConfirm={onConfirm}
    />
  );
}
