import { Box, InputLabel, Tab, Tabs, Typography } from '@mui/material';
import fetchToCurl from 'fetch-to-curl';
import React from 'react';
import { CopyBlock, nord } from 'react-code-blocks';
import { useMediaQuery } from 'react-responsive';
import YAML from 'yaml';
import { BASE_URL } from '../../../misc/fetchers';
import { HaNotifyDataTemplate, NotifyCommand, RestfulCommand } from '../models';

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

export default function CodePanels({ notifyCommand }: { notifyCommand: NotifyCommand }) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  });
  const curlCopyBlockProps = {
    text: fetchToCurl({
      url: `${BASE_URL}/api/client?action=notify`,
      body: notifyCommand,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    language: 'bash',
    showLineNumbers: false,
    codeBlock: false,
    theme: nord,
    wrapLongLines: true,
    customStyle: { maxWidth: isDesktopOrLaptop ? '800px' : '345px', display: 'flex' },
  };
  const haRestfulCommandCopyBlockProps = {
    text: YAML.stringify(new RestfulCommand(notifyCommand)),
    language: 'yaml',
    showLineNumbers: false,
    codeBlock: false,
    theme: nord,
    wrapLongLines: true,
    customStyle: { maxWidth: isDesktopOrLaptop ? '800px' : '345px', display: 'flex' },
  };
  const haRestfulCommandPayloadCopyBlockProps = {
    text: JSON.stringify(new HaNotifyDataTemplate(notifyCommand)),
    language: 'json',
    showLineNumbers: false,
    codeBlock: false,
    theme: nord,
    wrapLongLines: true,
    customStyle: {
      maxWidth: isDesktopOrLaptop ? '800px' : '345px',
      minHeight: '50px',
      display: 'flex',
    },
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
        <CopyBlock {...curlCopyBlockProps} />
      </CustomTabPanel>
      <CustomTabPanel value={selectedTab} index={1}>
        {`Place the YAML shown below in your Home Assistant configuration.yaml and then restart Home
          Assistant for the change to take effect.`}
        <CopyBlock {...haRestfulCommandCopyBlockProps} />
        {`To test your new notification in the Home Assistant Web UI select 'Developer tools' from the menu on the left side.
          Click the 'Services' tab and search for your willow_notify RESTful command. Select 'YAML mode' and paste this in the data field:`}
        <CopyBlock {...haRestfulCommandPayloadCopyBlockProps} />
        {`Click 'Call Service' and watch your Willow device(s) come to life!`}
      </CustomTabPanel>
    </Box>
  );
}
