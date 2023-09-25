import type { NextPage } from 'next';
import * as React from 'react';
import LeftMenu from '../components/LeftMenu';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { ReleaseAsset } from '../misc/model';
import useSWR from 'swr';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';
import { post } from '../misc/fetchers';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';

import Grid from '@mui/material/Grid';

function groupBy<T>(
  items: T[],
  keyOrKeyFn: keyof T | ((item: T) => string | number)
): Record<string | number, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = typeof keyOrKeyFn === 'function' ? keyOrKeyFn(item) : item[keyOrKeyFn];
      (acc[key as any] = acc[key as any] || []).push(item);
      return acc;
    },
    {} as Record<string | number, T[]>
  );
}

function ReleaseCard({ release }: { release: ReleaseAsset[] }) {
  async function handleDownload(asset: ReleaseAsset) {
    await post('/api/release?action=cache', {
      version: asset.name,
      platform: asset.platform,
      willow_url: asset.willow_url,
      size: asset.size,
    });
  }

  return (
    <Card sx={{ margin: 1, width: '300px' }}>
      <CardHeader
        title={
          <>
            <Link href={release[0].html_url} target="_blank">
              {release[0].name}
            </Link>{' '}
            <Typography fontSize={10}>{(release[0].size / (1024 * 1024)).toFixed(2)}MB</Typography>
          </>
        }
        sx={{ paddingBottom: 0 }}
      />
      <CardContent sx={{ padding: 1 }}>
        <InputLabel sx={{ marginLeft: 1 }}>Hardware Type</InputLabel>
        <List dense={true}>
          {release.map((a) => (
            <ListItem
              key={a.willow_url}
              secondaryAction={
                !a.cached ? (
                  <Tooltip
                    style={{ boxShadow: 'none' }}
                    title="Download this release"
                    enterTouchDelay={0}>
                    <IconButton edge="end" aria-label="delete" onClick={(e) => handleDownload(a)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip
                    style={{ boxShadow: 'none' }}
                    title="Release Downloaded"
                    enterTouchDelay={0}>
                    <DownloadDoneIcon></DownloadDoneIcon>
                  </Tooltip>
                )
              }>
              <ListItemText sx={{ margin: 0 }} primary={a.platform} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

//super gross function that merges willow releases and our api format
//works but possibly update with new API format?
export function mergeReleases(willowReleases: any[] | undefined): ReleaseAsset[] {
  const ret: ReleaseAsset[] = [];
  for (const release of willowReleases || []) {
    for (const a of release.assets) {
      if (a.build_type != 'ota') continue; //Not OTA file ignore
      const name: string = release.tag_name;
      const platform: string = a.platform;
      const ra: ReleaseAsset = {
        name,
        platform,
        file_name: a.name,
        willow_url: a.browser_download_url,
        size: a.size,
        was_url: a.was_url,
        cached: a.cached,
        html_url: release.html_url,
      };
      ret.push(ra);
    }
  }
  return ret;
}

const Updates: NextPage = () => {
  const { data: willowData, error: willowError } = useSWR<any[]>('/api/release?type=was');

  return (
    <LeftMenu>
      <Grid container spacing={2}>
        {Object.entries(groupBy<ReleaseAsset>(mergeReleases(willowData), 'name')).map(
          ([name, releases]) => (
            <ReleaseCard key={name} release={releases}></ReleaseCard>
          )
        )}
      </Grid>
    </LeftMenu>
  );
};

export default Updates;