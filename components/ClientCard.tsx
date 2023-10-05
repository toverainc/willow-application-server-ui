import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CardActions, Stack, Tooltip } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Image from 'next/image';
import * as React from 'react';
import { BASE_URL } from '../misc/fetchers';
import { Client, ReleaseAsset } from '../misc/model';
import { ApplyConfigDialog, ApplyNvsDialog, ResetDialog } from './ConfirmDialog';
import NameClientDialog from './NameClientDialog';
import OtaDialog from './OtaDialog';

function ClientMenu({ client }: { client: Client }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openOtaDialog, setOpenOtaDialog] = React.useState<boolean>(false);
  const [otaDialogSelectedVersion, setOtaDialogSelectedVersion] = React.useState<
    string | undefined
  >(undefined);
  const [openResetDialog, setOpenResetDialog] = React.useState<boolean>(false);
  const [openApplyConfigDialog, setOpenApplyConfigDialog] = React.useState<boolean>(false);
  const [openApplyNvsDialog, setOpenApplyNvsDialog] = React.useState<boolean>(false);
  const [openNameClientDialog, setOpenNameClientDialog] = React.useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    return true;
  };

  return (
    <div>
      <IconButton
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        <MenuItem onClick={() => handleClose() && setOpenNameClientDialog(true)}>
          Edit Name
        </MenuItem>
        <MenuItem onClick={() => handleClose() && setOpenApplyConfigDialog(true)}>
          Apply Configuration
        </MenuItem>
        <MenuItem onClick={() => handleClose() && setOpenApplyNvsDialog(true)}>
          Apply Connectivity Configuration
        </MenuItem>
        <MenuItem onClick={() => handleClose() && setOpenResetDialog(true)}>Restart</MenuItem>
        <MenuItem onClick={() => handleClose() && setOpenOtaDialog(true)}>Upgrade</MenuItem>
      </Menu>
      <NameClientDialog
        client={client}
        open={openNameClientDialog}
        onClose={() => setOpenNameClientDialog(false)}></NameClientDialog>
      <OtaDialog
        client={client}
        open={openOtaDialog}
        onClose={() => setOpenOtaDialog(false)}></OtaDialog>
      <ResetDialog
        client={client}
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}></ResetDialog>
      <ApplyConfigDialog
        client={client}
        open={openApplyConfigDialog}
        onClose={() => setOpenApplyConfigDialog(false)}></ApplyConfigDialog>
      <ApplyNvsDialog
        client={client}
        open={openApplyNvsDialog}
        onClose={() => setOpenApplyNvsDialog(false)}></ApplyNvsDialog>
    </div>
  );
}

export default function ClientCard({
  client,
  latestReleaseAsset,
  latestReleaseName,
}: {
  client: Client;
  latestReleaseAsset: ReleaseAsset | undefined;
  latestReleaseName: string | undefined;
}) {
  const [openOtaDialog, setOpenOtaDialog] = React.useState<boolean>(false);

  return (
    <Card sx={{ maxWidth: 500, minHeight: 230 }}>
      <CardHeader
        avatar={
          <Image
            src={'static/' + client.platform + '.png'}
            width={50}
            height={50}
            alt={client.platform}></Image>
        }
        action={<ClientMenu client={client}></ClientMenu>}
        title={client.label || client.hostname}
        subheader={client.mac_addr}
        sx={{ paddingBottom: 0 }}
      />
      <CardContent sx={{ paddingLeft: 1, paddingBottom: 0, minWidth:'max-content' }}>
        <List dense={true}>
          <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}>
            <ListItemText sx={{ margin: 0 }} primary={'Hostname: ' + client.hostname} />
          </ListItem>
          <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}>
            <ListItemText sx={{ margin: 0 }} primary={'IP Address: ' + client.ip} />
          </ListItem>
          <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}>
            <ListItemText sx={{ margin: 0 }} primary={'Platform: ' + client.platform} />
          </ListItem>
          <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}>
            <ListItemText sx={{ margin: 0 }} primary={'Version: ' + client.version} />
          </ListItem>
        </List>
      </CardContent>
      <CardActions sx={{ paddingLeft: 1, paddingTop: 0 }}>
        {latestReleaseAsset !== undefined &&
          latestReleaseName !== undefined &&
          latestReleaseName !== client.version && (
            <Stack spacing={2} sx={{ padding: 0 }}>
              <Tooltip
                style={{ boxShadow: 'none' }}
                title={'Upgrade to ' + latestReleaseName}
                enterTouchDelay={0}>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {
                    setOpenOtaDialog(true);
                  }}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <OtaDialog
                client={client}
                open={openOtaDialog}
                selectedRelease={latestReleaseAsset}
                onClose={() => setOpenOtaDialog(false)}></OtaDialog>
            </Stack>
          )}
      </CardActions>
    </Card>
  );
}
