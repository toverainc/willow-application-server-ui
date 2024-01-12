import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DevicesIcon from '@mui/icons-material/Devices';
import Link from 'next/link';
import SettingsIcon from '@mui/icons-material/Settings';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useMediaQuery } from 'react-responsive';
import { OnboardingContext } from '../pages/_app';
import AppsIcon from '@mui/icons-material/Apps';
import InfoIcon from '@mui/icons-material/Info';
import useSWR from 'swr';
import { VersionInfo } from '../misc/model';
import { Stack } from '@mui/material';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop: any) => prop !== 'open' })<{
  open?: boolean;
  isDesktopOrLaptop?: boolean;
}>(({ theme, open, isDesktopOrLaptop }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isDesktopOrLaptop ? `-${drawerWidth}px` : 'auto',
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  isDesktopOrLaptop?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop: any) => prop !== 'open',
})<AppBarProps>(({ theme, open, isDesktopOrLaptop }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: isDesktopOrLaptop ? `calc(100% - ${drawerWidth}px)` : '100%',
    marginLeft: isDesktopOrLaptop ? `${drawerWidth}px` : 0,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

function MenuItem({
  text,
  children,
  page,
  display,
}: {
  text: string;
  page: string;
  children: React.ReactNode;
  display: boolean;
}) {
  return (
    <Link
      href={page}
      style={{
        textDecoration: 'inherit',
        color: 'inherit',
        display: display ? undefined : 'none',
      }}>
      <ListItem key={text} disablePadding>
        <ListItemButton>
          <ListItemIcon>{children}</ListItemIcon>
          <ListItemText primary={text} />
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

export default function LeftMenu({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  });
  const [open, setOpen] = React.useState(isDesktopOrLaptop);
  const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' });
  const { data: versionData } = useSWR<VersionInfo>('/api/info');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const onboardingState = React.useContext(OnboardingContext);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} isDesktopOrLaptop={isDesktopOrLaptop}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && isDesktopOrLaptop && { display: 'none' }) }}>
            <MenuIcon />
          </IconButton>
          <Link href="/" style={{ textDecoration: 'inherit', color: 'inherit' }}>
            <Typography variant="h6" noWrap component="div">
              Willow Application Server
            </Typography>
          </Link>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
          height: '100%',
        }}
        variant={isDesktopOrLaptop ? 'persistent' : 'temporary'}
        anchor="left"
        open={open}
        onClick={!isDesktopOrLaptop ? handleDrawerClose : () => {}}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <MenuItem text="Clients" page="/" display={onboardingState.isOnboardingComplete}>
            <DevicesIcon></DevicesIcon>
          </MenuItem>
          <MenuItem text="Configuration" page="/config" display={true}>
            <SettingsIcon></SettingsIcon>
          </MenuItem>
          {/*
          <MenuItem text="Local Commands" page="/multinet">
            <DeviceHubIcon></DeviceHubIcon>
          </MenuItem>
      */}
          <MenuItem text="Applications" page="/apps" display={onboardingState.isOnboardingComplete}>
            <AppsIcon></AppsIcon>
          </MenuItem>
          <MenuItem
            text="Asset Management"
            page="/assetmanagement"
            display={onboardingState.isOnboardingComplete}>
            <SystemUpdateAltIcon></SystemUpdateAltIcon>
          </MenuItem>
          <MenuItem text="About" page="/about" display={true}>
            <InfoIcon></InfoIcon>
          </MenuItem>
        </List>
      </Drawer>
      <Main open={open} isDesktopOrLaptop={isDesktopOrLaptop}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
