import type { NextPage } from 'next';
import * as React from 'react';
import LeftMenu from '../components/LeftMenu';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { OnboardingContext } from './_app';
import { useRouter } from 'next/navigation';

const Home: NextPage = () => {
  const onboardingContext = React.useContext(OnboardingContext);
  const router = useRouter();

  if (!onboardingContext.isOnboardingComplete) {
    router.replace('/config');
    return <></>;
  }
  return (
    <LeftMenu>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          marginTop: 3,
        }}>
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          <DeviceHubIcon style={{ transform: 'scale(3)' }}></DeviceHubIcon>
          <br></br>
          The speech recognition mode is not set to Multinet<br></br>This feature is coming soon
        </Typography>
      </Box>
    </LeftMenu>
  );
};

export default Home;
