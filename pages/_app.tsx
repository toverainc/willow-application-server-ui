import { Raleway } from 'next/font/google';
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
  TZDictionary,
  VersionInfo,
} from '../misc/model';

import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/globals.css';

export const raleway = Raleway({ subsets: ['latin'], display: 'swap' });

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
    fontFamily: raleway.style.fontFamily,
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
  const { data: nvsData } = useSWR<NvsSettings>('/api/config?type=nvs', fetcher);
  const { data: generalSettings } = useSWR<GeneralSettings>('/api/config?type=config', fetcher);
  const { data: advancedSettings } = useSWR<AdvancedSettings>('/api/config?type=config', fetcher);
  const { data: defaultGeneralSettings } = useSWR<GeneralSettings>(
    '/api/config?type=config&default=true',
    fetcher
  );
  const { data: defaultAdvancedSettings } = useSWR<AdvancedSettings>(
    '/api/config?type=config&default=true',
    fetcher
  );
  const { data: tzDictionary } = useSWR<TZDictionary>('/api/config?type=tz', fetcher);
  const { data: versionData } = useSWR<VersionInfo>('/api/info', fetcher);

  const onboardingContext = useContext(OnboardingContext);
  onboardingContext.isGeneralConfigComplete = generalSettings
    ? Object.keys(generalSettings).length > 0
    : false;
  onboardingContext.isNvsComplete = nvsData
    ? nvsData.WAS?.URL?.length > 0 &&
      nvsData.WIFI?.PSK?.length > 0 &&
      nvsData.WIFI?.SSID?.length > 0
    : false;
  onboardingContext.isOnboardingComplete =
    onboardingContext.isGeneralConfigComplete && onboardingContext.isNvsComplete;

  const formErrorContext = useContext(FormErrorContext);

  return !nvsData ||
    !generalSettings ||
    !defaultGeneralSettings ||
    !advancedSettings ||
    !defaultAdvancedSettings ||
    !tzDictionary ||
    !versionData ? (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <LoadingSpinner />
    </div>
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
          <OnboardingContext.Provider value={onboardingContext}>
            <FormErrorContext.Provider value={formErrorContext}>
              <div className={raleway.className}>
                <Component {...pageProps} />
              </div>
            </FormErrorContext.Provider>
          </OnboardingContext.Provider>
        </SWRConfig>
      </ThemeProvider>
    </>
  );
}
