import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { CardContent } from '@mui/material';
import React from 'react';

export default function InformationCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
      {title.length > 0 && <CardHeader title={title} sx={{ textAlign: 'center' }} />}
      {children}
    </Card>
  );
}

function GetMessages(messages: string[]) {
  messages.forEach((message) => {});
}
