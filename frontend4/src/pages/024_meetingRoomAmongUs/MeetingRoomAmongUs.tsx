import React, { useEffect, useMemo, useRef, useState } from "react"
import { Tooltip, IconButton, Divider, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@material-ui/core'
import { useAppState } from "../../providers/AppStateProvider";
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import { blueGrey, red } from '@material-ui/core/colors';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import { useStyles } from "./css";
import MicIcon from '@material-ui/icons/Mic';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { LeaveMeetingDialog } from "./components/dialog/LeaveMeetingDialog";
import { SettingDialog } from "./components/dialog/SettingDialog";
import { AudienceList } from "./components/AudienceList";
import { CreditPanel } from "./components/CreditPanel";
import { ChatArea } from "./components/ChatArea";
import { useScheduler } from "../../providers/hooks/useScheduler";
import { ICONS_ALIVE, ICONS_DEAD, REGIONS, STATES } from "../../common/components/useAmongUs";

type ChimeState = {
    arenaMicrophone:boolean
    arenaSpeaker:boolean
    arenaShareScreen:boolean
    arenaViewScreen:boolean
    fieldMicrophone:boolean
    fieldSpeaker:boolean
}

//// Single Channel
const ChimeState_Arena:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:false,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Lobby:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Task:ChimeState = {
    arenaMicrophone:false,
    arenaSpeaker:false,
    arenaShareScreen:true,
    arenaViewScreen:false,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Discuss:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:false,
    fieldMicrophone:true,
    fieldSpeaker:true,
}


const ChimeState_Task_Dead:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Discuss_Dead:ChimeState = {
    arenaMicrophone:false,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Discuss_Arena:ChimeState = {
    arenaMicrophone:false,
    arenaSpeaker:true,
    arenaShareScreen:false,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}


const ChimeState_Debug:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}


const ChimeStateType = {
    "Arena"          : ChimeState_Arena,
    "Lobby"          : ChimeState_Lobby,
    "Task"           : ChimeState_Task,
    "Discuss"        : ChimeState_Discuss,
    "Task_Dead"      : ChimeState_Task_Dead,
    "Discuss_Dead"   : ChimeState_Discuss_Dead,
    "Discuss_Arena"  : ChimeState_Discuss_Arena,

    "Debug"          :ChimeState_Debug,
}

const mapFileNames = [
    'map00_Skeld.png',
    'map01_Mira.png',
    'map02_Polus.png',
    'map03_dlekS.png',
    'map04_Airship.png',
]

export type ViewMode = "MultiTileView" | "SeparateView"


export const MeetingRoomAmongUs = () => {
    const classes = useStyles();
    const animationRef = useRef(0);

    const { chimeClient, amongusGameState } = useAppState()
    const [settingDialogOpen, setSettingDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

    const [chimeState, setChimeState] = useState<ChimeState>(ChimeStateType.Arena)

    const [userName, _setUserName] = useState<string>()
    const [ captureStream, setCaptureStream ] = useState<MediaStream>()
    const { tenSecondsTaskTrigger } = useScheduler()


    const setUserName = (newUserName:string) =>{
        _setUserName(newUserName)
    }

    const [ viewMode, setViewMode ] = useState<ViewMode>("MultiTileView")
    const [ debugEnable, setDebugEnable] = useState(false)
    const [ screenSize, setScreenSize] = useState<number[]>([640,480])

    const targetTilesId = Object.keys(chimeClient!.videoTileStates).reduce<string>((sum,cur)=>{return `${sum}-${cur}`},"")

    useEffect(()=>{
        console.log("UPDATE HMM INFO")
        chimeClient!.hmmClient?.updateHMMInfo()
    }, [tenSecondsTaskTrigger]) // eslint-disable-line

    // initialize auido/video output
    useEffect(()=>{
        const audioEl = document.getElementById("arena_speaker") as HTMLAudioElement
        chimeClient!.audioOutputDeviceSetting!.setOutputAudioElement(audioEl)
        // @ts-ignore
        document.body.style = 'background: black;';

    },[]) // eslint-disable-line

    // for Share Screen
    const animate = () => {
        const videoEl  = document.getElementById("capture") as HTMLVideoElement
        const canvasEl  = document.getElementById("captureCanvas") as HTMLCanvasElement
        const ctx = canvasEl.getContext("2d")!
        ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height)

        animationRef.current = requestAnimationFrame(animate)
    };
    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, []) // eslint-disable-line


    //// Main Screen Changer
    useEffect(()=>{
        // if(!currentGameState.hmmAttendeeId){
        //     return
        // }
        if(chimeState.arenaViewScreen){
            // hide map
            const mapViewComp = document.getElementById("mapView") as HTMLImageElement
            mapViewComp.style.display = "none"


            const tileviewComp = document.getElementById("tileView") as HTMLVideoElement
            tileviewComp.style.display = "block"
            chimeClient!.meetingSession?.audioVideo.getAllRemoteVideoTiles().forEach((x, index)=>{
                if(viewMode==="MultiTileView"){
                    if(x.state().boundAttendeeId === amongusGameState?.hmmAttendeeId){
                        x.unpause()
                        x.bindVideoElement(tileviewComp)
                        tileviewComp.play()
                        console.log("video stream:", tileviewComp.videoWidth, tileviewComp.videoHeight)
                    }else{
                        x.pause()
                        x.bindVideoElement(null)
                    }
                }else{ // SeparateView
                    const userViewComp = document.getElementById(`userView${index}`) as HTMLVideoElement
                    x.bindVideoElement(userViewComp)
        
                    console.log("video stream:", userViewComp.videoWidth, userViewComp.videoHeight)
                    userViewComp.play()

                    if(x.state().boundAttendeeId === amongusGameState?.hmmAttendeeId){
                        x.pause()
                        x.bindVideoElement(null)
                    }else{
                        x.unpause()
                        x.bindVideoElement(userViewComp)
                    }
                }
            })
        }else{
            // show map
            const mapViewComp = document.getElementById("mapView") as HTMLImageElement
            mapViewComp.style.display = "block"
            mapViewComp.src=`/resources/amongus/map/${amongusGameState ? mapFileNames[amongusGameState.map]:""}`

            const tileviewComp = document.getElementById("tileView") as HTMLVideoElement
            tileviewComp.style.display = "none"
            chimeClient!.meetingSession?.audioVideo.getAllRemoteVideoTiles().forEach((x, index)=>{
                x.pause()
            })

        }
    },[targetTilesId, amongusGameState?.hmmAttendeeId, chimeState.arenaViewScreen]) // eslint-disable-line

    //// UserName Change
    useEffect(()=>{
        if(!userName){
            return
        }
        chimeClient!.hmmClient!.sendRegisterAmongUsUserName(userName, chimeClient!.attendeeId!)
    },[userName]) // eslint-disable-line

    //// Chime State change
    useEffect(()=>{
        const player = amongusGameState?.players.find(x=>{return x.attendeeId === chimeClient!.attendeeId})
        console.log("Find current player:::", player)
        console.log("Find current player:::", amongusGameState)
        console.log("Find current player::GAME STATE:", amongusGameState?.state)

        if(debugEnable){
            setChimeState(ChimeStateType.Debug)
            return
        }

        /////// For Arena
        if(!player){
            // in arena
            console.log("Find current player::: 1")
            if(amongusGameState?.state === 2){
                setChimeState(ChimeStateType.Discuss_Arena)
                return
            }else{
                setChimeState(ChimeStateType.Arena)
                return
            }
        }

        /////// For Field
        /// Lobby
        if(amongusGameState?.state === 0){
            // in lobby(0)
            console.log("Find current player::: 2")
            setChimeState(ChimeStateType.Lobby)
            return
        }

        //// Task
        if(amongusGameState?.state === 1){
            console.log("Find current player::: 3-1")
            // in task
            if(player.isDead || player.disconnected){
                console.log("Find current player::: 3")
                // dead man
                setChimeState(ChimeStateType.Task_Dead)
                return
            }else{
                // task
                console.log("Find current player::: 4")
                setChimeState(ChimeStateType.Task)
                return
            }
        }
        //// Discuss
        if(amongusGameState?.state === 2){
            //in discussing
            if(player.isDead || player.disconnected){
                // dead man
                console.log("Find current player::: 5")
                setChimeState(ChimeStateType.Discuss_Dead)
                return
            }else{
                // discuss
                console.log("Find current player::: 6")
                setChimeState(ChimeStateType.Discuss)
                return
            }
        }
        console.log("Find current player::: 7")

    },[amongusGameState, debugEnable]) // eslint-disable-line

    //// AV Controle
    useEffect(()=>{

        if(chimeState.arenaMicrophone){
            chimeClient!.audioInputDeviceSetting!.unmute()
        }else{
            chimeClient!.audioInputDeviceSetting!.mute()
        }
    },[chimeState.arenaMicrophone]) // eslint-disable-line
    useEffect(()=>{
        if(chimeState.arenaSpeaker){
            chimeClient!.audioOutputDeviceSetting?.setAudioOutputEnable(true)
        }else{
            chimeClient!.audioOutputDeviceSetting?.setAudioOutputEnable(false)
        }
    },[chimeState.arenaSpeaker]) // eslint-disable-line
    useEffect(()=>{
        if(chimeState.arenaShareScreen){
            console.log("ENABLE VIDEO: TRUE")


            //////// captureStream can not be kept between sharedDisplay enable and disable. (captureStream changed to default webcam, severe issue)
            // if(captureStream){
            //     videoInputDeviceSetting!.setVideoInput(captureStream).then(()=>{
            //         videoInputDeviceSetting!.startLocalVideoTile()
            //     })                    
            // }


            // const videoEl  = document.getElementById("capture") as HTMLVideoElement
            // // @ts-ignore
            // const stream = videoEl.captureStream() as MediaStream
            // videoInputDeviceSetting!.setVideoInput(stream).then(()=>{
            //     videoInputDeviceSetting!.startLocalVideoTile()
            // })


            const canvasEl  = document.getElementById("captureCanvas") as HTMLCanvasElement
            // @ts-ignore
            const stream = canvasEl.captureStream() as MediaStream
            chimeClient!.videoInputDeviceSetting!.setVideoInput(stream).then(()=>{
                chimeClient!.videoInputDeviceSetting!.startLocalVideoTile()
            })


        }else{
            console.log("ENABLE VIDEO: FALSE")
            chimeClient!.videoInputDeviceSetting!.stopLocalVideoTile()
        }
    },[chimeState.arenaShareScreen]) // eslint-disable-line


    //// UserName re-register
    useEffect(()=>{
        const player = amongusGameState?.players.find(x=>{return x.name === userName})
        if(!player){
            // no register target name
            return
        }
        if(player.attendeeId){
            if(player.attendeeId === chimeClient!.attendeeId){
                // already registerd
                return
            }else{
                // register other person at the same name. clear my name.
                setUserName("__None__")
                return
            }
        }
        if(!player.attendeeId && userName){
            // not registerd yet and userName is choosen. register 
            chimeClient!.hmmClient!.sendRegisterAmongUsUserName(userName, chimeClient!.attendeeId!)
        }
    },[amongusGameState]) // eslint-disable-line


    //// Capture add listener
    useEffect(()=>{
        const videoEl  = document.getElementById("capture") as HTMLVideoElement

        const listenEvent = (ev: MouseEvent) => {
            if(captureStream){
                captureStream.getTracks().forEach(x=>{
                    x.stop()
                })
                videoEl.srcObject = null
                setCaptureStream(undefined)

            }else{
                chimeClient!.meetingSession?.audioVideo.chooseVideoInputQuality(640,480,3,2000)
                let displayMediaOptions = {
                    video: {
                      cursor: "never",
                      frameRate: 15,
                    },
                    audio: false
                };

                // @ts-ignore
                navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(stream=>{
                    videoEl.srcObject = stream
                    setCaptureStream(stream)
                    videoEl.play().then(()=>{
                    })
                })
            }
        }

        videoEl.addEventListener("click", listenEvent)

       return ()=>{videoEl.removeEventListener("click", listenEvent)}
    },[]) // eslint-disable-line

    
    //////////////////////////
    /// (1) hmm state
    //////////////////////////
    /// (1-1) owner
    const ownerStateComp = useMemo(()=>{
        return (
            chimeClient!.isOwner?
            <>
                <Tooltip title={"Your are owner"}>
                    <EmojiPeopleIcon className={classes.activeState_hmm}  fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Your are not owner"}>
                    <EmojiPeopleIcon className={classes.inactiveState}  fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeClient!.isOwner]) // eslint-disable-line
    /// (1-2) hmm active
    const managerStateComp = useMemo(()=>{
        if(chimeClient!.hmmClient!.hmmActive === false && (!chimeClient!.hmmClient!.hmmLastStatus || chimeClient!.hmmClient!.hmmLastStatus === "N/A")){ // Not active
            return(
                <>
                    <Tooltip title={`hmm not active: ${chimeClient!.hmmClient!.hmmLastStatus}`}>
                        <IconButton classes={{root:classes.menuButton}} onClick={()=>{chimeClient!.hmmClient!.startHMM()}}>                    
                            <SportsEsportsIcon className={classes.inactiveState} fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                </>
            )
        }else if(chimeClient!.hmmClient!.hmmActive === false && chimeClient!.hmmClient!.hmmLastStatus === "PROVISIONING"){ // Invoking && Provisioning
            return (
                <>
                    <Tooltip title={"invoking hmm: provisioning"}>
                        <CircularProgress />               
                    </Tooltip>
                </>
            )
        }else if(chimeClient!.hmmClient!.hmmActive === false && chimeClient!.hmmClient!.hmmLastStatus === "PENDING"){  // Invoking && PENDING
            return (
                <>
                    <Tooltip title={"invoking hmm: pending"}>
                        <CircularProgress />               
                    </Tooltip>
                </>
            )
        }else if(chimeClient!.hmmClient!.hmmActive === true && chimeClient!.hmmClient!.hmmLastStatus === "PENDING"){ // already invoked (1)
            return (
                <>
                    <Tooltip title={"invoking hmm: already invoked"}>
                        <CircularProgress />               
                    </Tooltip>
                </>
            )
        }else if(chimeClient!.hmmClient!.hmmActive === false && chimeClient!.hmmClient!.hmmLastStatus === "RUNNING"){ // already invoked (2)
            return (
                <>
                    <Tooltip title={"invoking hmm: already invoked"}>
                        <CircularProgress />               
                    </Tooltip>
                </>
            )
        }else if(chimeClient!.hmmClient!.hmmActive === true && chimeClient!.hmmClient!.hmmLastStatus === "RUNNING"){ //invoked
            return (
                <>
                    <Tooltip title={"hmm active"}>
                        <IconButton classes={{root:classes.menuButton}} onClick={()=>{chimeClient!.hmmClient!.sendTerminate()}}>                    
                            <SportsEsportsIcon className={classes.activeState_hmm} fontSize="large"/>
                        </IconButton>                    
                    </Tooltip>
                </>
            )
        }else{
            return (
                <>
                    <Tooltip title={`active:${chimeClient!.hmmClient!.hmmActive}, last status: ${chimeClient!.hmmClient!.hmmLastStatus}`}>
                        <IconButton classes={{root:classes.menuButton}} onClick={()=>{chimeClient!.hmmClient!.startHMM()}}>                    
                            <SportsEsportsIcon className={classes.inactiveState} fontSize="large"/>
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    },[chimeClient!.hmmClient!.hmmActive, chimeClient!.hmmClient!.hmmLastStatus]) // eslint-disable-line
    /// (1-3) hmm recording
    const recordingStateComp = useMemo(()=>{
        return (
            chimeClient!.hmmClient!.hmmRecording ?
            <>
                <Tooltip title={"recording"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{chimeClient!.hmmClient!.sendStopRecord()}}>
                        <CameraRollIcon className={classes.activeState_hmm} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"not recording"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{chimeClient!.hmmClient!.sendStartRecord()}}>
                        <CameraRollIcon className={classes.inactiveState} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[chimeClient!.hmmClient!.hmmRecording]) // eslint-disable-line
    /// (1-4) share multi tile
    const shareTileViewStateComp = useMemo(()=>{
        return (
            chimeClient!.hmmClient!.hmmShareTileview ?
            <>
                <Tooltip title={"share tile view"}>
                    <IconButton classes={{root:classes.menuButton}}  onClick={()=>{chimeClient!.hmmClient!.sendStopShareTileView()}}>                    
                        <ScreenShareIcon className={classes.activeState_hmm}  fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"not share share tile view"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{chimeClient!.hmmClient!.sendStartShareTileView()}}>                    
                        <ScreenShareIcon className={classes.inactiveState} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[chimeClient!.hmmClient!.hmmShareTileview])  // eslint-disable-line

    //// (1-x) lastupdate
    const stateLastUpdateTime = useMemo(()=>{
        const datetime = new Date(chimeClient!.hmmClient!.hmmLastUpdate);
        // const d = datetime.toLocaleDateString()
        const t = datetime.toLocaleTimeString()
        // return `${d} ${t}`
        return `${t}`
    },[chimeClient?.hmmClient?.hmmLastUpdate]) // eslint-disable-line


    //////////////////////////
    /// (2) chime state
    //////////////////////////
    /// (2-1) arena mic state
    const arenaMicrophoneComp = useMemo(()=>{
        return (
            chimeState.arenaMicrophone?
            <>
                <Tooltip title={"Mic On"}>
                    <MicIcon className={classes.activeState_arena}  fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Mic Off"}>
                    <MicIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaMicrophone]) // eslint-disable-line

    /// (2-2) arena speaker state
    const arenaSpeakerComp = useMemo(()=>{
        return (
            chimeState.arenaSpeaker?
            <>
                <Tooltip title={"Snd On"}>
                    <VolumeUpIcon className={classes.activeState_arena} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Snd Off"}>
                    <VolumeUpIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaSpeaker])  // eslint-disable-line
    /// (2-3) arena share screen state
    const arenaShareScreenComp = useMemo(()=>{
        return (
            chimeState.arenaShareScreen?
            <>
                <Tooltip title={"ScreenShare On"}>
                    <ScreenShareIcon className={classes.activeState_arena} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"ScreenShare Off"}>
                    <ScreenShareIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaShareScreen])  // eslint-disable-line
    /// (2-4) arena view screen  state
    const arenaViewScreenComp = useMemo(()=>{
        return (
            chimeState.arenaViewScreen?
            <>
                <Tooltip title={"ScreenShare On"}>
                    <ViewComfyIcon className={classes.activeState_arena} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"ScreenShare Off"}>
                    <ViewComfyIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaViewScreen])  // eslint-disable-line

    //// (2-x) game state
    const gameStateComp = useMemo(()=>{
        return(
            <div>
                <div>
                    {amongusGameState ? STATES[amongusGameState.state] : "N/A"}
                </div>
                <div>
                {amongusGameState?.lobbyCode}@{amongusGameState ? REGIONS[amongusGameState.gameRegion]: "N/A"} {amongusGameState?.map}
                </div>
            </div>

        )
    },[amongusGameState?.state, amongusGameState?.gameRegion, amongusGameState?.lobbyCode, amongusGameState?.map]) // eslint-disable-line

    
    //////////////////////////
    /// (3) util
    //////////////////////////
    /// (3-1) Gear
    const gearComp = useMemo(()=>{
        return (
            <>
                <Tooltip title={"config"}>
                    <IconButton classes={{root:classes.menuButton}}>                    
                        <SettingsIcon className={classes.activeState_hmm} fontSize="large" onClick={()=>setSettingDialogOpen(true)}/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[]) // eslint-disable-line
    /// (3-2) Leave
    const leaveComp = useMemo(()=>{
        return (
            <>
                <Tooltip title={"leave"}>
                    <IconButton classes={{root:classes.menuButton}}>                    
                        <ExitToAppIcon className={classes.activeState_hmm} fontSize="large" onClick={()=>setLeaveDialogOpen(true)}/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[])  // eslint-disable-line

    //////////////////////////////
    /// (4) user chooser
    /////////////////////////////
    const userChooser = useMemo(()=>{
        return(
            <FormControl className={classes.formControl} >
                <InputLabel className={classes.label}>UserName</InputLabel>
        
                <Select onChange={(e)=>{setUserName(e.target.value! as string)}} 
                        className={classes.select}
                        value={userName}
                        defaultValue={userName}
                        inputProps={{
                            classes: {
                                icon: classes.icon,
                            },
                            className: classes.input_amongus
                        }}                                
                        >
                    <MenuItem value="__None__">
                        <em>__None__</em>
                    </MenuItem>
                    <MenuItem disabled value={userName}>
                        <em>{userName}</em>
                    </MenuItem>
                    {amongusGameState?.players?.map(p => {
                        return <MenuItem value={p.name} key={p.name}>{p.name}</MenuItem>
                    })}
                </Select>
            </FormControl>
    
        )
    },[amongusGameState?.players])  // eslint-disable-line

    /////////////////////////////
    /// (5) User List
    ////////////////////////////
    const userList = useMemo(()=>{
        return(
            <div>
                {
                    amongusGameState?.players.map(x=>{
                        return(
                            <div>
                                {
                                    (x.isDead && x.isDeadDiscovered) || x.disconnected ? 
                                    <div><img style={{width:"20%"}} src={ICONS_DEAD[x.color]} alt="dead" ></img>{x.name}/{x.chimeName}</div> 
                                    :
                                    <div><img style={{width:"20%"}} src={ICONS_ALIVE[x.color]} alt="alive" ></img>{x.name}/{x.chimeName}</div> 
                                }
                            </div>
                        )}
                    )
                }
            </div>

        )
    },[amongusGameState])


    return (
            <div className={classes.root}>

                <div id="header" style={{display:"flex", flexDirection:"row"}} >

                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex"}}>
                            {ownerStateComp}
                            {managerStateComp}
                            {recordingStateComp}
                            {shareTileViewStateComp}
                        </div>
                        <div>
                            {chimeClient?.hmmClient?.hmmPublicIp?`http://${chimeClient?.hmmClient?.hmmPublicIp}:3000`:""}
                        </div>
                        <div>
                            lastupdate:{stateLastUpdateTime}
                        </div>
                    </div>

                    <span style={{width:"30px"}}/>

                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <div style={{display:"flex"}}>
                                {arenaMicrophoneComp}
                                {arenaSpeakerComp}
                                {arenaShareScreenComp}
                                {arenaViewScreenComp}
                            </div>
                            <span style={{margin:"3px" }}> </span>
                            {/* <div style={{display:"flex"}}>
                                {fieldMicrophoneComp}
                                {fieldSpeakerComp}
                            </div> */}
                        </div>
                        <div>
                            {gameStateComp}
                        </div>
                    </div>

                    <span style={{width:"30px"}}/>


                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <div style={{display:"flex"}}>
                                {gearComp}
                                {leaveComp}
                            </div>
                        </div>
                        <div>
                        </div>
                    </div>

                </div>

                <Divider variant="middle" classes={{root:classes.dividerColor }}/>

                <div id="main" style={{height:"100%", display:"flex", flexDirection:"row"}}>
                    <div style={{width:"20%", display:"flex", flexDirection:"column"}}>
                        {userChooser}
                        {userList}
                    </div>

                    <div style={{width:"65%", height:"100%", display:"flex", flexDirection:"column"}}>
                        <div style={{height:"20%", display:"flex", flexDirection:"row"}}>
                            <div style={{width:"25%", height:"100%", textAlign:"right" }}>
                                click to share your screen
                            </div>
                            <div style={{width:"30%", height:"100%", alignItems:"center" }}>
                            <video width="640" height="480" id="capture" style={{width:"50%", height:"100%", borderStyle:"dashed",borderColor: blueGrey[400]}} />
                            <canvas width={screenSize[0]} height={screenSize[1]} id="captureCanvas" hidden />
                            </div>
                            <div style={{width:"30%", height:"100%", alignItems:"center" }}>
                            </div>
                        </div>


                        <div style={{height:"80%", display:viewMode==="MultiTileView" ? "block":"none" }}>
                            <div style={{height:"100%", display:"flex", flexDirection:"row" }}>
                                <video id="tileView"  style={{width:"97%", height:"100%", borderStyle:"solid",borderColor: blueGrey[900]}} />
                                <img id="mapView"  style={{width:"97%", height:"100%", borderStyle:"solid",borderColor: blueGrey[900]}} alt="map" />
                            </div>
                        </div>

                        <div>
                            <audio id="arena_speaker" hidden />
                        </div>

                        <div style={{height:"80%", display:viewMode==="SeparateView" ? "block":"none" }}>
                            <div style={{display:"flex", flexDirection:"row"}}>
                                <video id="userView0"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView1"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView2"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView3"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"row"}}>
                                <video id="userView4"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView5"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView6"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView7"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"row"}}>
                                <video id="userView8"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView9"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView10"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView11"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            </div>
                            <div style={{display:"flex", flexDirection:"row"}}>
                                <video id="userView12"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView13"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView14"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                                <video id="userView15"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            </div>
                        </div>



                    </div>

                    <div style={{width:"10%", height:"100%", display:"flex", flexDirection:"column"}}>
                        <div id="audiences" style={{height:"40%"}}>
                            <AudienceList />

                        </div>
                        <div id="chat"  style={{height:"40%"}}>
                            <ChatArea />
                        </div>
                        <div>
                            <CreditPanel />
                        </div>

                    </div>

                </div>
                <LeaveMeetingDialog open={leaveDialogOpen} onClose={()=>setLeaveDialogOpen(false)} />
                <SettingDialog open={settingDialogOpen} onClose={()=>setSettingDialogOpen(false)} 
                    viewMode={viewMode} setViewMode={setViewMode} 
                    debugEnable={debugEnable} setDebugEnable={setDebugEnable}
                    screenSize={screenSize} setScreenSize={setScreenSize}
                    />
                <div id="info1"/>
            </div>

    );

}
