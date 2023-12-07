import '@fontsource/raleway';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import useSWR, { SWRConfig } from 'swr';
import { fetcher } from '../misc/fetchers';
import {
  AdvancedSettings,
  FormErrorStates,
  GeneralSettings,
  NvsSettings,
  OnboardingState,
  SettingsState,
  TZDictionary,
} from '../misc/model';

import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/globals.css';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#583759',
    },
    secondary: {
      main: '#fbe870',
    },
  },
  typography: {
    fontFamily: '"Raleway"',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          'background-color': '#583759',
          color: '#ffffff',
          '&:hover': {
            'background-color': '#fbe870',
            color: '#000000',
          },
        },
      },
    },
  },
});

export const OnboardingContext = React.createContext<OnboardingState>({
  isNvsComplete: false,
  isGeneralConfigComplete: false,
  isOnboardingComplete: false,
});

export const SettingsContext = React.createContext<SettingsState>({
  nvsSettings: undefined,
  generalSettings: undefined,
  defaultGeneralSettings: undefined,
  advancedSettings: undefined,
  defaultAdvancedSettings: undefined,
  tzDictionary: undefined,
});

export const FormErrorContext = React.createContext<FormErrorStates>({
  WisUrlError: { Error: false, HelperText: '' },
  WisTtsUrlError: { Error: false, HelperText: '' },
  HassHostError: { Error: false, HelperText: '' },
  HassPortError: { Error: false, HelperText: '' },
  OpenhabUrlError: { Error: false, HelperText: '' },
  RestUrlError: { Error: false, HelperText: '' },
  MqttHostError: { Error: false, HelperText: '' },
  MqttPortError: { Error: false, HelperText: '' },
});

export class HttpError extends Error {
  constructor(status: number, msg: string) {
    super(`${status}: ${msg}`);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const { data: nvsData, isLoading: nvsIsLoading } = useSWR<NvsSettings>(
    '/api/config?type=nvs',
    fetcher
  );
  const { data: generalSettings, isLoading: generalSettingsIsLoading } = useSWR<GeneralSettings>(
    '/api/config?type=config',
    fetcher
  );
  const { data: defaultGeneralSettings, isLoading: defaultGeneralSettingsIsLoading } =
    useSWR<GeneralSettings>('/api/config?type=config&default=true', fetcher);
  const { data: advancedSettings, isLoading: advancedSettingsIsLoading } = useSWR<AdvancedSettings>(
    '/api/config?type=config',
    fetcher
  );
  const { data: defaultAdvancedSettings, isLoading: defaultAdvancedSettingsIsLoading } =
    useSWR<AdvancedSettings>('/api/config?type=config&default=true', fetcher);
  const { data: tzDictionary, isLoading: tzDictionaryIsLoading } = useSWR<TZDictionary>(
    '/api/config?type=tz',
    fetcher
  );

  const onboardingContext = useContext(OnboardingContext);
  onboardingContext.isGeneralConfigComplete = generalSettings
    ? Object.keys(generalSettings).length > 0
    : false;
  onboardingContext.isNvsComplete = nvsData ? Object.keys(nvsData).length > 0 : false;
  onboardingContext.isOnboardingComplete =
    onboardingContext.isGeneralConfigComplete && onboardingContext.isNvsComplete;

  const settingsContext = useContext(SettingsContext);
  settingsContext.nvsSettings = nvsData;
  settingsContext.generalSettings = generalSettings;
  settingsContext.defaultGeneralSettings = defaultGeneralSettings;
  settingsContext.advancedSettings = advancedSettings;
  settingsContext.defaultAdvancedSettings = defaultAdvancedSettings;
  settingsContext.tzDictionary = tzDictionary;

  const formErrorContext = useContext(FormErrorContext);

  //XXX: write a real fetcher
  return nvsIsLoading ||
    generalSettingsIsLoading ||
    defaultGeneralSettingsIsLoading ||
    advancedSettingsIsLoading ||
    defaultAdvancedSettingsIsLoading ||
    tzDictionaryIsLoading ? (
    <LoadingSpinner />
  ) : (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Willow Application Server</title>

        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <link rel="shortcut icon" href="/admin/static/favicon.svg" />
      </Head>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SWRConfig value={{ fetcher }}>
          <SettingsContext.Provider value={settingsContext}>
            <OnboardingContext.Provider value={onboardingContext}>
              <FormErrorContext.Provider value={formErrorContext}>
                <Component {...pageProps} />
              </FormErrorContext.Provider>
            </OnboardingContext.Provider>
          </SettingsContext.Provider>
        </SWRConfig>
      </ThemeProvider>
    </>
  );
}
