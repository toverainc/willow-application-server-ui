import { Box, Card, CardContent, CardHeader, Grid } from '@mui/material';
import { NextPage } from 'next';
import useSWR from 'swr';
import InformationCard from '../components/InformationCard';
import LeftMenu from '../components/LeftMenu';
import { VersionInfo } from '../misc/model';
import { useMediaQuery } from 'react-responsive';

const About: NextPage = () => {
  const { data: versionData } = useSWR<VersionInfo>('/api/info');
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  });
  return (
    <LeftMenu>
      <h2 style={{ textAlign: 'center' }}>About</h2>
      <Box sx={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
        <InformationCard title="Versions">
          <CardContent sx={{ textAlign: 'center', padding: 0 }}>
            <b>WAS:</b> {versionData?.was.version}
          </CardContent>
        </InformationCard>
      </Box>
    </LeftMenu>
  );
};

export default About;
