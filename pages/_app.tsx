import '@fontsource/raleway';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useContext, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { fetcher } from '../misc/fetchers';
import useSWR from 'swr';
import { GeneralSettings, NvsSettings } from '../misc/model';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import LoadingSpinner from '../components/LoadingSpinner';

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

export const OnboardingContext = React.createContext({
  isNvsComplete: false,
  isGeneralConfigComplete: false,
  isOnboardingComplete: false,
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
  const { data: configData, isLoading: configIsLoading } = useSWR<GeneralSettings>(
    '/api/config?type=config',
    fetcher
  );

  const onboardingContext = useContext(OnboardingContext);
  onboardingContext.isGeneralConfigComplete = configData
    ? Object.keys(configData).length > 0
    : false;
  onboardingContext.isNvsComplete = nvsData ? Object.keys(nvsData).length > 0 : false;
  onboardingContext.isOnboardingComplete =
    onboardingContext.isGeneralConfigComplete && onboardingContext.isNvsComplete;

  //XXX: write a real fetcher
  return nvsIsLoading || configIsLoading ? (
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
          <OnboardingContext.Provider value={onboardingContext}>
            <Component {...pageProps} />
          </OnboardingContext.Provider>
        </SWRConfig>
      </ThemeProvider>
    </>
  );
}
