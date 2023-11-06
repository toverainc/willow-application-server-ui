import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import Link from 'next/link';

export default function AppCard({
  appTitle,
  appDescription,
  pageKey,
}: {
  appTitle: string;
  appDescription: string;
  pageKey: string;
}) {
  return (
    <Link href={`/apps/${pageKey}`} style={{ textDecoration: 'none' }}>
      <Card sx={{ maxWidth: 500, minWidth: 'max-content', minHeight: 'max-content', boxShadow: 4 }}>
        <CardActionArea>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {appTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appDescription}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
}
