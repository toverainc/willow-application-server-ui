import type { NextPage } from 'next';
import * as React from 'react';
import LeftMenu from '../components/LeftMenu';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import { Release, ReleaseAsset } from '../misc/model';
import useSWR from 'swr';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';
import { post } from '../misc/fetchers';

import Grid from '@mui/material/Grid';

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return date.toLocaleDateString('en-US', options as any);
}

function ReleaseCard({ release }: { release: Release }) {
  async function handleDownload(asset: ReleaseAsset) {
    await post('/api/release/cache', {
      version: release.name,
      file_name: asset.name,
      gh_url: asset.browser_download_url,
      size: asset.size,
    });
  }

  async function handleDelete(asset: ReleaseAsset) {
    //XXX: not implemented as current API does not return what is already downloaded
  }

  return (
    <Card sx={{ margin: 1, width: '300px' }}>
      <CardHeader
        title={
          <>
            <Link href={release.html_url} target="_blank">
              {release.name}
            </Link>{' '}
            <Typography fontSize={10}>
              {formatTimestamp(release.published_at)}
            </Typography>
          </>
        }
        sx={{ paddingBottom: 0 }}
      />
      <CardContent sx={{ padding: 1 }}>
        <InputLabel sx={{ marginLeft: 1 }}>Hardware Type</InputLabel>
        <List dense={true}>
          {release.assets.map((a) => (
            <ListItem
              key={a.id}
              secondaryAction={
                a.local ? (
                  <Tooltip
                    style={{ boxShadow: 'none' }}
                    title="Delete this release"
                    enterTouchDelay={0}
                  >
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDelete(a)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip
                    style={{ boxShadow: 'none' }}
                    title="Download this release"
                    enterTouchDelay={0}
                  >
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDownload(a)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <ListItemText
                sx={{ margin: 0 }}
                primary={`${a.name.replace(/willow-ota-|\.bin/g, '')}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

const Updates: NextPage = () => {
  const { data, error } = useSWR<Release[]>(
    '/api/releases/github/?refresh=true'
  );

  function cleanReleases(releases: Release[]): Release[] {
    releases.forEach((r) => {
      r.assets = r.assets.filter((r) => r.name.indexOf('-dist-') === -1);
    });
    return releases;
  }
  return (
    <LeftMenu>
      <Grid container spacing={2}>
        {data &&
          cleanReleases(data).map((r) => (
            <ReleaseCard key={r.id} release={r}></ReleaseCard>
          ))}
      </Grid>
    </LeftMenu>
  );
};

export default Updates;
