import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import useSWR from 'swr';
import { DeleteCache } from '../components/ConfirmDialog';
import LeftMenu from '../components/LeftMenu';
import { Release, ReleaseAsset } from '../misc/model';
import { OnboardingContext } from './_app';

function ReleaseCard({ release }: { release: Release }) {
  const [openDialogState, setOpenDialogState] = React.useState(new Map<string, boolean>());

  return (
    <Card sx={{ maxWidth: 500, minWidth: 'max-content', boxShadow: 4 }}>
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
      <CardContent sx={{ padding: 1, minWidth: 'max-content' }}>
        <InputLabel sx={{ marginLeft: 1 }}>Hardware Type</InputLabel>
        <List dense={true}>
          {release.assets
            .filter((asset) => asset.build_type !== 'dist' && asset.cached)
            .map((asset: ReleaseAsset) => (
              <ListItem
                key={asset.browser_download_url}
                secondaryAction={
                  <div>
                    <DeleteCache
                      asset={asset}
                      release={release}
                      open={openDialogState.get(asset.was_url) ?? false}
                      onClose={() => {
                        return (
                          true &&
                          setOpenDialogState(
                            new Map<string, boolean>(openDialogState).set(asset.was_url, false)
                          )
                        );
                      }}></DeleteCache>
                    <Tooltip
                      style={{ boxShadow: 'none' }}
                      title="Delete From Storage"
                      enterTouchDelay={0}>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() =>
                          setOpenDialogState(
                            new Map<string, boolean>(openDialogState).set(asset.was_url, true)
                          )
                        }>
                        <DeleteForeverTwoToneIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }>
                <ListItemText sx={{ margin: 0, maxWidth: 300 }} primary={asset.platform} />
              </ListItem>
            ))}
        </List>
      </CardContent>
    </Card>
  );
}

const AssetManagement: NextPage = () => {
  const { data: releaseData, error: releaseDataError } = useSWR<Release[]>('/api/release?type=was');
  const onboardingContext = React.useContext(OnboardingContext);
  const router = useRouter();

  if (!onboardingContext.isOnboardingComplete) {
    router.replace('/config');
    return <></>;
  }

  return (
    <LeftMenu>
      <h2 style={{ textAlign: 'center' }}>Willow Releases</h2>
      <Grid container spacing={2}>
        {releaseData
          ?.filter((release) => release.assets.some((asset) => asset.cached))
          .map((release: Release) => (
            <React.Fragment key={release.name}>
              <Grid item md={4} sm={6} xs={12} lg={3}>
                <ReleaseCard key={release.name} release={release}></ReleaseCard>
              </Grid>
            </React.Fragment>
          ))}
      </Grid>
    </LeftMenu>
  );
};

export default AssetManagement;
