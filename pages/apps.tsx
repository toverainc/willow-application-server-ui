import { NextPage } from 'next';
import LeftMenu from '../components/LeftMenu';
import { Grid } from '@mui/material';
import AppCard from '../components/AppCard';

const Apps: NextPage = () => {
  return (
    <LeftMenu>
      <h2 style={{ textAlign: 'center' }}>Applications</h2>
      <Grid container spacing={2} sx={{ ml: 0, mt: 1 }}>
        <AppCard
          appTitle="Notify"
          appDescription="Trigger notifications on your Willow devices"
          pageKey="notify"
        />
      </Grid>
    </LeftMenu>
  );
};

export default Apps;
