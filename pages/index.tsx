import Grid from '@mui/material/Grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import useSWR from 'swr';
import ClientCard from '../components/ClientCard';
import LeftMenu from '../components/LeftMenu';
import { fetcher } from '../misc/fetchers';
import { Client, Release } from '../misc/model';
import { OnboardingContext } from './_app';

const Home: NextPage = () => {
  const router = useRouter();
  const { data: clientData, error: clientError } = useSWR<Client[]>('/api/client', fetcher, {
    refreshInterval: 5000,
  }); //we refresh clients every 5 seconds so we can detect offline, new, & updated clients
  const onboardingContext = React.useContext(OnboardingContext);
  const { data: releaseData, error: releaseError } = useSWR<Release[]>('/api/release?type=was');
  const [latestRelease, setLatestRelease] = React.useState<Release | undefined>(undefined);

  React.useEffect(() => {
    setLatestRelease((releaseData?.filter((release) => release.latest) ?? [undefined])[0]);
  }, [releaseData]);

  if (!onboardingContext.isOnboardingComplete) {
    router.replace('/config');
    return <></>;
  }
  return (
    <LeftMenu>
      <Grid container spacing={2}>
        {clientData?.map((client: any) => (
          <React.Fragment key={client.hostname}>
            <Grid item md={4} sm={6} xs={12} lg={3}>
              <ClientCard
                client={client}
                latestReleaseAsset={
                  (latestRelease?.assets?.filter(
                    (r) => r.platform == client.platform && r.was_url
                  ) ?? [undefined])[0] ?? undefined
                }
                latestReleaseName={latestRelease?.name}></ClientCard>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </LeftMenu>
  );
};

export default Home;
