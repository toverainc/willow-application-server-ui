import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import React from "react";
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { fetcher } from '../misc/fetchers';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#583759',
    },
    secondary: {
      main: '#fbe870',
    },
  },
})

export class HttpError extends Error {
  constructor(status: number, msg: string) {
    super(`${status}: ${msg}`);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default function App({ Component, pageProps }: AppProps) { //XXX: write a real fetcher
  return <>
    <Head>
      <meta charSet="utf-8" />
      <title>Willow Application Server Web</title>

      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <link rel="shortcut icon" href="/static/favicon.svg" />
    </Head>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SWRConfig value={{ fetcher }}>
        <Component {...pageProps} />
      </SWRConfig>
    </ThemeProvider>
  </>
}