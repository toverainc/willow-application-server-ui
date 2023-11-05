import { Box, InputLabel, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { CopyBlock, nord } from 'react-code-blocks';
import { CopyBlockProps } from 'react-code-blocks/dist/components/CopyBlock';
import { useMediaQuery } from 'react-responsive';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function CodePanels({ curlRequest }: { curlRequest: string }) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  });
  const copyBlockProps = {
    text: curlRequest,
    language: 'bash',
    showLineNumbers: false,
    codeBlock: false,
    theme: nord,
    wrapLongLines: true,
    customStyle: { maxWidth: isDesktopOrLaptop ? '800px' : '345px', display: 'flex' },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <InputLabel>Generated Code</InputLabel>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleChange} aria-label="Generated Code">
          <Tab label="CURL" {...a11yProps(0)} />
          <Tab label="Home Assistant" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={selectedTab} index={0}>
        <CopyBlock {...copyBlockProps} />
      </CustomTabPanel>
      <CustomTabPanel value={selectedTab} index={1}>
        Home Assistant
      </CustomTabPanel>
    </Box>
  );
}
