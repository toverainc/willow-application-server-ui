import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { WAS_FLASH_URL } from '../misc/fetchers';

export default function WebFlashCard() {
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
            <a target="_blank" rel="noreferrer" href={WAS_FLASH_URL}>
              Willow Web Flasher
            </a>{' '}
            to flash your devices.
          </>
        }
        sx={{ textAlign: 'center' }}
      />
    </Card>
  );
}
