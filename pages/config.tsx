import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CardContent } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import * as React from 'react';
import useSWR from 'swr';
import InformationCard from '../components/InformationCard';
import LeftMenu from '../components/LeftMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import WebFlashCard from '../components/WebFlashCard';
import { AdvancedSettings, GeneralSettings, NvsSettings } from '../misc/model';
import AdvancedSettingsSection from '../pagecomponents/AdvancedSettingsSection';
import ConnectionSettingsSection from '../pagecomponents/ConnectionSettingsSection';
import GeneralSettingsSection from '../pagecomponents/GeneralSettingsSection';
import { FormErrorContext, OnboardingContext } from './_app';
import { toast } from 'react-toastify';

function SettingsAccordions() {
  const formErrorContext = React.useContext(FormErrorContext);
  const onboardingState = React.useContext(OnboardingContext);
  const initialAccordion = onboardingState.isNvsComplete ? 'General' : 'Connectivity';
  const [expanded, setExpanded] = React.useState<string | false>(initialAccordion);
  const [overrideOnboarding, setOverrideOnboarding] = React.useState(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setOverrideOnboarding(true);
    if (formErrorContext.generalSettingsFormHasErrors) {
      setExpanded('General');
      toast.error('Please correct form errors before changing to a different section!');
    } else {
      setExpanded(isExpanded ? panel : false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Accordion
        expanded={
          onboardingState.isGeneralConfigComplete || overrideOnboarding
            ? expanded === 'Connectivity'
            : !onboardingState.isNvsComplete
        }
        onChange={handleChange('Connectivity')}
        sx={{ boxShadow: 4 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="Connectivity-content"
          id="Connectivity-header">
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Basic</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Connectivity</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ConnectionSettingsSection></ConnectionSettingsSection>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={
          onboardingState.isOnboardingComplete || overrideOnboarding
            ? expanded === 'General'
            : onboardingState.isNvsComplete
        }
        onChange={handleChange('General')}
        sx={{ display: onboardingState.isNvsComplete ? undefined : 'none', boxShadow: 4 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="General-content"
          id="General-header">
          <Typography sx={{ width: '33%', flexShrink: 0 }}>General</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Willow</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <GeneralSettingsSection></GeneralSettingsSection>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === 'Advanced'}
        onChange={handleChange('Advanced')}
        sx={{
          display: onboardingState.isGeneralConfigComplete ? undefined : 'none',
          boxShadow: 4,
        }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="Advanced-content"
          id="Advanced-header">
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Advanced</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Willow (Advanced)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AdvancedSettingsSection></AdvancedSettingsSection>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function GetInformationCard(showPrereleases: boolean) {
  const onboardingContext = React.useContext(OnboardingContext);

  if (onboardingContext.isOnboardingComplete) {
    return <WebFlashCard showPreReleases={showPrereleases}></WebFlashCard>;
  } else if (!onboardingContext.isNvsComplete) {
    return (
      <InformationCard title="Welcome to Willow!">
        <CardContent sx={{ textAlign: 'center' }}>
          To get started, please enter in your WiFi network and password.
          <b>SSID is case sensitive!</b>
          <br />
          We have attempted to guess your WAS url, please ensure the value is correct.
          <br />
          <b>Please Note: The WiFi network defined below must be able to access this server!</b>
        </CardContent>
      </InformationCard>
    );
  } else if (!onboardingContext.isGeneralConfigComplete) {
    return (
      <InformationCard title="Welcome to Willow!">
        <CardContent sx={{ textAlign: 'center' }}>
          Please configure your general settings. Refer to the tooltips for guidance on each config
          value.
        </CardContent>
      </InformationCard>
    );
  }
}

const Config: NextPage = () => {
  const { data: nvsData, isLoading: nvsIsLoading } = useSWR<NvsSettings>('/api/config?type=nvs');
  const { data: configData, isLoading: configIsLoading } =
    useSWR<GeneralSettings>('/api/config?type=config');
  const { data: advancedConfigData, isLoading: advancedConfigIsLoading } =
    useSWR<AdvancedSettings>('/api/config?type=config');

  return nvsIsLoading || configIsLoading || advancedConfigIsLoading ? (
    <LoadingSpinner />
  ) : (
    <LeftMenu>
      {GetInformationCard(advancedConfigData?.show_prereleases ?? false)}
      <SettingsAccordions></SettingsAccordions>
    </LeftMenu>
  );
};
export default Config;
