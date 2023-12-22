import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { WAS_FLASH_URL } from '../misc/fetchers';
import { CardContent } from '@mui/material';
import Link from 'next/link';

export default function WebFlashCard({ showPreReleases }: { showPreReleases: boolean }) {
  return (
    <Card
      sx={{
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '800px',
        boxShadow: 4,
      }}>
      <CardHeader
        title={
          <>
            Go to the{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href={`${WAS_FLASH_URL}&showPreReleases=${showPreReleases}`}>
              Willow Web Flasher
            </a>{' '}
            to flash your new devices.
          </>
        }
        sx={{ textAlign: 'center', paddingBottom: 1 }}
      />
      <CardContent sx={{ textAlign: 'center', paddingTop: 0 }}>
        Devices already running Willow can be updated in the <Link href={'/'}>Clients</Link> tab.
      </CardContent>
    </Card>
  );
}
