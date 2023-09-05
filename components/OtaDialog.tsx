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

import { Client, Release } from '../misc/model'

//URL_WAS_API_RELEASE_CACHE = 'http://localhost:8502/api/release/cache'

export default function OtaDialog({ client, open, onClose }: { client: Client, open: boolean, onClose: (event: any) => void }) {
    const { data: releaseData, error } = useSWR<Release[]>('/api/releases/?refresh=true')
    const [release, setRelease] = React.useState<string>('');

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Flash Release OTA</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{marginBottom: 2}}>
                    Select a release to update the client &quot;{client.label || client.hostname}&quot; OTA
                </DialogContentText>
                <FormControl fullWidth>
                    <InputLabel id="release-label">Release</InputLabel>
                    <Select
                        labelId="release-label"
                        fullWidth={true}
                        value={release}
                        label="Release"
                        onChange={(event) => setRelease(event.target.value as string)}
                    >{releaseData?.map(release=><MenuItem key={release.id} value={release.name}>{release.name}</MenuItem>)}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onClose}>Flash Release</Button>
            </DialogActions>
        </Dialog>
    );
}
