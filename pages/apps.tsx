import { NextPage } from 'next';
import LeftMenu from '../components/LeftMenu';
import { Grid } from '@mui/material';
import AppCard from '../components/AppCard';

const Apps: NextPage = () => {
  return (
    <LeftMenu>
      <h2 style={{ textAlign: 'center' }}>Applications</h2>
      <Grid container spacing={2}>
        <Grid item md={4} sm={6} xs={12} lg={3}>
          <AppCard
            appTitle="Notify (EXPERIMENTAL)"
            appDescription="Trigger notifications on your Willow devices."
            pageKey="notify"
          />
        </Grid>
      </Grid>
    </LeftMenu>
  );
};

export default Apps;
