import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MinidenticonImg from '../components/MinidenticonImg'
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OtaDialog from './OtaDialog'
import { Client, formatMacAddress } from '../misc/model'
import { ResetDialog, ApplyConfigDialog, ApplyNvsDialog } from './ConfirmDialog'

function ClientMenu({ client }: { client: Client }) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [openOtaDialog, setOpenOtaDialog] = React.useState<boolean>(false);
    const [openResetDialog, setOpenResetDialog] = React.useState<boolean>(false);
    const [openApplyConfigDialog, setOpenApplyConfigDialog] = React.useState<boolean>(false);
    const [openApplyNvsDialog, setOpenApplyNvsDialog] = React.useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
        return true
    };

    return (
        <div>
            <IconButton
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleClose}>Edit Name</MenuItem>
                <MenuItem onClick={() => handleClose() && setOpenApplyConfigDialog(true)}>Apply Config</MenuItem>
                <MenuItem onClick={() => handleClose() && setOpenApplyNvsDialog(true)}>Apply NVS</MenuItem>
                <MenuItem onClick={() => handleClose() && setOpenResetDialog(true)}>Restart</MenuItem>
                <MenuItem onClick={() => handleClose() && setOpenOtaDialog(true)}>OTA Update</MenuItem>
            </Menu>
            <OtaDialog client={client} open={openOtaDialog} onClose={() => setOpenOtaDialog(false)}></OtaDialog>
            <ResetDialog client={client} open={openResetDialog} onClose={() => setOpenResetDialog(false)}></ResetDialog>
            <ApplyConfigDialog client={client} open={openApplyConfigDialog} onClose={() => setOpenApplyConfigDialog(false)}></ApplyConfigDialog>
            <ApplyNvsDialog client={client} open={openApplyNvsDialog} onClose={() => setOpenApplyNvsDialog(false)}></ApplyNvsDialog>
        </div>
    );
}

export default function ClientCard({ client }: { client: Client }) {

    return (
        <Card sx={{ maxWidth: 500 }}>
            <CardHeader
                avatar={
                    //<Avatar sx={{ bgcolor: 'gray' }} >
                    <MinidenticonImg username={formatMacAddress(client.mac_addr)}></MinidenticonImg>
                    //</Avatar>
                }
                action={<ClientMenu client={client}></ClientMenu>}
                title={client.label || client.hostname}
                subheader={formatMacAddress(client.mac_addr)}
                sx={{ paddingBottom: 0 }}
            />
            <CardContent sx={{ padding: 1 }}>
                <List dense={true}>
                    <ListItem sx={{ paddingTop: 0, paddingBottom: 0}}><ListItemText sx={{ margin: 0 }} primary={"Hostname: " + client.hostname} /></ListItem>
                    <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}><ListItemText sx={{ margin: 0 }} primary={"Remote: " + client.ip + ":" + client.port} /></ListItem>
                    <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}><ListItemText sx={{ margin: 0 }} primary={"Hardware Type: " + client.hw_type} /></ListItem>
                    <ListItem sx={{ paddingTop: 0, paddingBottom: 0 }}><ListItemText sx={{ margin: 0 }} primary={"Version: " + client.user_agent} /></ListItem>
                </List>
            </CardContent>
            {/*
            <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                    <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="share">
                    <ShareIcon />
                </IconButton>
            </CardActions>
             */}
        </Card>
    );
}