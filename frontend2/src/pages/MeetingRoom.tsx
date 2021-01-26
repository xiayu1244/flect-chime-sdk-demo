import React, { useEffect } from "react"
import clsx from 'clsx';
import { Container, Avatar, Typography, TextField, Button, Grid, Link, Box, CssBaseline, CircularProgress, FormControlLabel, Checkbox, AppBar, Drawer, Toolbar, IconButton, Divider, GridList, GridListTile, ListSubheader, GridListTileBar } from '@material-ui/core'
import { Menu, Notifications, ChevronLeft, ChevronRight, ExpandMore, AllOut, Info } from '@material-ui/icons'
import { createMuiTheme, makeStyles, ThemeProvider, withStyles } from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useSignInState } from "../providers/SignInStateProvider"
import { useAppState } from "../providers/AppStateProvider";
import { useMeetingState } from "../providers/MeetingStateProvider";
import { AttendeesTable } from "../components/AttendeesTable";

import { CustomAccordion } from "../components/CustomAccordion";
import { VideoTilesView } from "../components/VideoTileView";
import { useMessageState } from "../providers/MessageStateProvider";

const toolbarHeight = 20
const drawerWidth = 240;
const accordionSummaryHeight = 20


const theme = createMuiTheme({
    mixins: {
        toolbar: {
            minHeight: toolbarHeight,
        }
    },
});


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },

    ////////////////
    // ToolBar
    ////////////////
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    toolbar: {
        // paddingRight: 24, // keep right padding when drawer closed
    },
    menuButton: {
        // marginRight: 36,
        width: toolbarHeight, height: toolbarHeight,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    appBarSpacer: {
        height: toolbarHeight
    },

    ////////////////
    // SideBar
    ////////////////
    drawerPaper: {
        // marginLeft: drawerWidth,
        marginTop: theme.mixins.toolbar.height,

        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(3),
        },
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },



    ////////////////
    // Main
    ////////////////
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    gridList: {
        width: '100%',
        // height: 450,
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
}));




const tileData = [
    {
        userName: 'AAAA1',
        info: 'infooooo'
    },
    {
        userName: 'AAAA12',
        info: 'infooooo'
    },
    {
        userName: 'AAAA3',
        info: 'infooooo'
    },
    {
        userName: 'AAAA4',
        info: 'infooooo'
    },
    {
        userName: 'AAAA5',
        info: 'infooooo'
    },
]


const GridListTileBar2 = withStyles({
    root: {
      height: 15,
    },
    title: {
        fontSize:10,
    },
  })(GridListTileBar);

export const MeetingRoom = () => {
    const { userId, idToken, accessToken, refreshToken } = useAppState()
    const { meetingName, userName, isLoading, joinMeeting, meetingSession, attendees, stateCounter } = useMeetingState()
    const { handleSignOut } = useSignInState()
    const classes = useStyles()
    const history = useHistory()
    const {setMessage} = useMessageState()
    
    const [open, setOpen] = React.useState(false);
    const toggleDrawerOpen = () => {
        setOpen(!open);
    };

    const onJoinMeetingClicked = () => {
        joinMeeting(meetingName || "", userName || "", userId, idToken, accessToken, refreshToken).then(() => {
            history.push(routes.WAITING_ROOM)
        }).catch(e => {
            console.log(e)
            setMessage("Exception", "Enter Room Failed", [`a`, `a`] )     
        })
    }
    
    const onSignOutClicked = () => {
        handleSignOut(userId).then(() => {
            history.push(routes.HOME)
        }).catch(e => {
            history.push(routes.HOME)
        })
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className={classes.root}>


                <AppBar position="absolute" className={clsx(classes.appBar)}>
                    <Toolbar className={classes.toolbar}>
                        {
                            open ?
                                <Button color="inherit" className={clsx(classes.menuButton)} startIcon={<ChevronLeft />} onClick={toggleDrawerOpen}>
                                    menu
                        </Button>
                                :
                                <Button color="inherit" className={clsx(classes.menuButton)} endIcon={<ChevronRight />} onClick={toggleDrawerOpen}>
                                    menu
                        </Button>
                        }
                        <Typography color="inherit" noWrap className={classes.title}>
                            Meeting
                    </Typography>
                        <IconButton color="inherit" className={clsx(classes.menuButton)} >
                            <Notifications />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Drawer
                    variant="permanent"
                    classes={{
                        paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                    }}
                    open={open}
                >
                    <div className={classes.appBarSpacer} />
                    <CustomAccordion title="Member">
                        <div style={{ height: 200, width: '100%' }}>
                            <AttendeesTable attendees={attendees}/>
                        </div>
                    </CustomAccordion>
                </Drawer>

                <main className={classes.content}>
                    <div className={classes.appBarSpacer} />
                    <VideoTilesView tiles={meetingSession!.audioVideo.getAllVideoTiles()} attendees={attendees}/>
                </main>
            </div>
        </ThemeProvider>
    )
}
