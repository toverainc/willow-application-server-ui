import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { WAS_FLASH_URL } from '../misc/fetchers';

export default function WebFlashCard() {
  return (
    <Card sx={{ marginTop: 1, marginBottom: 1, marginLeft: "auto", marginRight: "auto", maxWidth: "800px" }}>
            <CardHeader
                title={<>Ready to flash. Go to <a target="_blank" rel="noreferrer" href={WAS_FLASH_URL}>https://flash.heywillow.io</a></>}
                sx={{ textAlign:"center" }}
            />
        </Card>
  );
}