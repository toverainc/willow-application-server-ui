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
import { Release, ReleaseAsset } from '../misc/model';
import useSWR from 'swr';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';
import { post } from '../misc/fetchers';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';

import Grid from '@mui/material/Grid';
import { OnboardingContext } from './_app';
import { useRouter } from 'next/navigation';

function ReleaseCard({ release }: { release: Release }) {
  async function handleDownload(asset: ReleaseAsset) {
    await post('/api/release?action=cache', {
      version: asset.name,
      platform: asset.platform,
      willow_url: asset.browser_download_url,
      size: asset.size,
    });
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
              {(
                release.assets
                  .filter((asset) => asset.cached)
                  .reduce((totalSize, asset) => totalSize + asset.size, 0) /
                (1024 * 1024)
              ).toFixed(2)}
              MB
            </Typography>
          </>
        }
        sx={{ paddingBottom: 0 }}
      />
      <CardContent sx={{ padding: 1 }}>
        <InputLabel sx={{ marginLeft: 1 }}>Hardware Type</InputLabel>
        <List dense={true}>
          {release.assets
            .filter((asset) => asset.build_type !== 'dist')
            .map((asset: ReleaseAsset) => (
              <ListItem
                key={asset.browser_download_url}
                secondaryAction={
                  !asset.cached ? (
                    <Tooltip
                      style={{ boxShadow: 'none' }}
                      title="Download this release"
                      enterTouchDelay={0}>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDownload(asset)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      style={{ boxShadow: 'none' }}
                      title="Release Downloaded"
                      enterTouchDelay={0}>
                      <IconButton edge="end" aria-label="delete" disabled>
                        <DownloadDoneIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }>
                <ListItemText sx={{ margin: 0 }} primary={asset.platform} />
              </ListItem>
            ))}
        </List>
      </CardContent>
    </Card>
  );
}

const Updates: NextPage = () => {
  const { data: releaseData, error: releaseDataError } = useSWR<Release[]>('/api/release?type=was');
  const onboardingContext = React.useContext(OnboardingContext);
  const router = useRouter();

  if (!onboardingContext.isOnboardingComplete) {
    router.replace('/config');
    return <></>;
  }

  return (
    <LeftMenu>
      <Grid container spacing={2}>
        {releaseData?.map((release: Release) => (
          <ReleaseCard key={release.name} release={release}></ReleaseCard>
        ))}
      </Grid>
    </LeftMenu>
  );
};

export default Updates;
