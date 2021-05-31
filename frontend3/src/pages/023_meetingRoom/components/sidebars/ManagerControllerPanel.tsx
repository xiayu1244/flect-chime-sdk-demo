import React, { useEffect, useMemo, useState } from 'react';
import { Link, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { getManagerInfo, getMeetingInfo, listAmongUsService, startManager, updateAmongUsService } from '../../../../api/api';
import { HMMCmd, HMMMessage } from '../../../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM';
import { getDateString } from '../../../../utils';

type StatusData = {
    timestamp: number,
    active: boolean,
    recording: boolean,
}

export const ManagerControllerPanel = () => {
    const classes = useStyles();
    const { meetingName, attendeeId, idToken, accessToken, refreshToken, sendHMMCommand, hMMCommandData, updateMeetingInfo, ownerId,
         startHMM, updateHMMInfo, publicIp } = useAppState()
    const [ url, setURL] = useState<string>()
    const [ statusData, setStatusData ] = useState<StatusData>()

    const handleStartManagerClicked = async () =>{
        // const res = await startManager(meetingName!, attendeeId!, idToken!, accessToken!, refreshToken!)
        // console.log("start manager",res)
        // const url = res['url']
        // const host = window.location.hostname
        // if(url.indexOf(host) != -1){
        //     setURL(url)
        // }else{
        //     const noProtocolUrl = url.substring("https://".length)
        //     const paramString   = noProtocolUrl.substring(noProtocolUrl.indexOf("/"))
        //     const newUrl = `https://192.168.0.4:3000${paramString}`
        //     console.log("NEWURL", newUrl)
        //     setURL(newUrl)
        // }
    }

    const handleGetManagerInfoClicked = async () =>{
        const res = await getManagerInfo(meetingName!, attendeeId!, idToken!, accessToken!, refreshToken!)
        console.log(`get manager info ${res}`)
    }

    const handleGetMeetingInfoClicked = async () =>{
        const res = await getMeetingInfo(meetingName!, idToken!, accessToken!, refreshToken!)
        console.log(`get meeting info ${res}`)
    }

    useEffect(()=>{
        console.log("receive HMMCommandData 0" )
        if(hMMCommandData.length === 0){
            return
        }
        const latestCommand = hMMCommandData.slice(-1)[0]
        console.log("receive HMMCommandData 1 ",hMMCommandData )
        const mess = latestCommand.data as HMMMessage
        console.log("receive HMMCommandData 2 ", mess)
        console.log("receive HMMCommandData 3 ", mess.command)
        
        if(mess.command === "NOTIFY_STATUS"){
            const statusData:StatusData={
                timestamp:new Date().getTime(),
                active: true,
                recording: true
            }
            setStatusData(statusData)
        }
    },[hMMCommandData])


    const hmmstatus = useMemo(()=>{
        if(!statusData){
            return (<>no status data</>)
        }
        const dateString = getDateString(statusData.timestamp)
        return(
            <>
                lastupdate:{dateString}, recording:{statusData.recording ? "yes":"no"}
            </>
        )

    },[statusData])

    return (
            <div className={classes.root}>
                <Typography variant="body1" color="textSecondary">
                    Manager
                </Typography>

                <Link onClick={(e: any) => { startHMM() }}>
                    startManager
                </Link>

                <Typography variant="body1" color="textSecondary">
                    <a href={url}  target="_blank" rel="noopener noreferrer">{url}</a>
                </Typography>

                <a onClick={()=>{sendHMMCommand( {command: HMMCmd.START_RECORD} )}}>START_RECORD</a>
                <a onClick={()=>{sendHMMCommand( {command: HMMCmd.STOP_RECORD} )}}>STOP_RECORD</a>


                

                <div>
                    <a onClick={()=>{sendHMMCommand( {command:HMMCmd.TERMINATE} )}}>TERMINATE!</a>
                </div>
                <div>
                    <a onClick={()=>{sendHMMCommand( {command: HMMCmd.GET_LOCAL_IP} )}}>GET_LOCAL_IP!</a>
                </div>                

                {/* <div>
                    <a onClick={()=>{handleActivateAmongUsServiceClicked()}}>Activate AMONGUS SERVICE</a>
                </div>                
                <div>
                    <a onClick={()=>{handleInactivateAmongUsServiceClicked()}}>Inactivate AMONGUS SERVICE</a>
                </div>                
                <div>
                    <a onClick={()=>{handleListAmongUsServiceClicked()}}>List AMONGUS SERVICE</a>
                </div>                 */}

                
                <div>
                    {hmmstatus}
                </div>
                
                <div>
                    <br/>
                    <a onClick={()=>{updateHMMInfo()}}>get_manager_info</a>
                </div>


                <div>
                    <a onClick={()=>{updateMeetingInfo()}}>updateMeetingInfo</a>
                    <br/>
                    {ownerId}
                    <br />
                    {publicIp}
                </div>


            </div>

    );
}

 