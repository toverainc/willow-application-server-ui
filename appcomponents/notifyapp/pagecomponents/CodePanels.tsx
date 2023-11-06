import { Box, InputLabel, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { CopyBlock, nord } from 'react-code-blocks';
import { useMediaQuery } from 'react-responsive';
import YAML from 'yaml';
import { HaNotifyDataTemplate, NotifyCommand, RestfulCommand } from '../models';
import fetchToCurl from 'fetch-to-curl';
import { BASE_URL } from '../../../misc/fetchers';
import Link from 'next/link';

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
        <h3>
          Place the yaml below into your configuration.yaml in Home Assistant, then restart Home
          Assistant for the changes to take effect.
        </h3>
        <CopyBlock {...haRestfulCommandCopyBlockProps} />
        <h3>
          Call your new 'willow_notify' service in HA with the data below (refer to{' '}
          <Link
            href={
              'https://www.home-assistant.io/integrations/rest_command/#how-to-test-your-new-rest-command'
            }
            target="_blank">
            How to test your new REST command
          </Link>{' '}
          for more information). This service can be called in scripts and automations within Home
          Assistant!
        </h3>
        <CopyBlock {...haRestfulCommandPayloadCopyBlockProps} />
      </CustomTabPanel>
    </Box>
  );
}
