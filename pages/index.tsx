import type { NextPage } from 'next';
import * as React from 'react';
import LeftMenu from '../components/LeftMenu';
import ClientCard from '../components/ClientCard';
import { Client } from '../misc/model';
import { fetcherClients } from '../misc/fetchers';
import Grid from '@mui/material/Grid';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: NextPage = () => {
  const { data, error } = useSWR<Client[]>('/api/client', fetcherClients, {
    refreshInterval: 5000,
  }); //we refresh clients every 5 seconds so we can detect offline, new, & updated clients

  return (
    <LeftMenu>
      <Grid container spacing={2}>
        {data?.map((client) => (
          <React.Fragment key={client.hostname}>
            <Grid item md={4} sm={6} xs={12} lg={3}>
              <ClientCard client={client}></ClientCard>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </LeftMenu>
  );
};

export default Home;
