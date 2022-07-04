import { DefaultDeviceController } from "amazon-chime-sdk-js";

const RecordAudioType = {
    remote: "remote",
    local: "local"
} as const
type RecordAudioType = typeof RecordAudioType[keyof typeof RecordAudioType]


export class Recorder {
    // PeerConnection Pair
    offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };
    private configuration = {};
    private pc1 = new RTCPeerConnection(this.configuration);
    private pc2 = new RTCPeerConnection(this.configuration);

    // Default Stream
    private createBlackCanvas = () => {
        const canvas = document.createElement("canvas")
        const width = 640;
        const height = 480
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.fillRect(0, 0, width, height);
        setInterval(async () => {
            console.log("update image")
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = "#000000"
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#aa0000"
            ctx.font = 'bold 48px serif';
            ctx.fillText(`NOW:${new Date().getTime()}`, 30, 60);
        }, 1000 * 1)
        return canvas.captureStream()
    }
    private createSilentAudioStream = () => {
        const ctx = DefaultDeviceController.getAudioContext();
        const dst = ctx.createMediaStreamDestination()

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.1;
        gainNode.connect(dst);

        const oscillator = ctx.createOscillator();
        oscillator.frequency.value = 440;
        oscillator.connect(gainNode);
        oscillator.start();
        return dst.stream;
    }

    private createDefaultStream = () => {
        const video = this.createBlackCanvas()
        const audio = this.createSilentAudioStream()
        return new MediaStream([video.getVideoTracks()[0], audio.getAudioTracks()[0]])
    }


    // Streams 
    private localStream: MediaStream | null = null
    private remoteStream: MediaStream | null = null
    // Senders
    private videoSender: RTCRtpSender | null = null
    private audioSender: RTCRtpSender | null = null

    private mediaRecorder: MediaRecorder | null = null

    // WebRTCのストリームを受け取って再生するVideoElement
    private videoElement


    constructor() {
        this.videoElement = document.createElement("video")
        this.videoElement.volume = 0
        this.init()
    }
    init = async () => {
        this.pc1.addEventListener('icecandidate', e => this.onIceCandidate(this.pc1, e));
        this.pc2.addEventListener('icecandidate', e => this.onIceCandidate(this.pc2, e));

        this.pc1.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc1, e));
        this.pc2.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc2, e));
        this.pc2.addEventListener('track', this.gotRemoteStream);
    }



    onCreateSessionDescriptionError = (error: any) => {
        console.warn(`Failed to create session description: ${error.toString()}`);
    }

    onCreateOfferSuccess = async (desc: any) => {
        // console.log(`Offer from pc1\n${desc.sdp}`);
        // console.log('pc1 setLocalDescription start');
        try {
            await this.pc1.setLocalDescription(desc);
            this.onSetLocalSuccess(this.pc1);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }

        // console.log('pc2 setRemoteDescription start');
        try {
            await this.pc2.setRemoteDescription(desc);
            this.onSetRemoteSuccess(this.pc2);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }

        // console.log('pc2 createAnswer start');
        try {
            const answer = await this.pc2.createAnswer();
            await this.onCreateAnswerSuccess(answer);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }
    }


    onSetLocalSuccess = (pc: any) => {
        console.log(`${this.getName(pc)} setLocalDescription complete`);
    }
    onSetRemoteSuccess = (pc: any) => {
        console.log(`${this.getName(pc)} setRemoteDescription complete`);
    }

    onSetSessionDescriptionError = (error: any) => {
        console.warn(`Failed to set session description: ${error.toString()}`);
    }

    gotRemoteStream = (e: any) => {
        if (this.remoteStream !== e.streams[0]) {
            this.remoteStream = e.streams[0];
            console.log('pc2 received remote stream');
        }
    }

    onCreateAnswerSuccess = async (desc: any) => {
        // console.log(`Answer from pc2:\n${desc.sdp}`);
        // console.log('pc2 setLocalDescription start');
        try {
            await this.pc2.setLocalDescription(desc);
            this.onSetLocalSuccess(this.pc2);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
        // console.log('pc1 setRemoteDescription start');
        try {
            await this.pc1.setRemoteDescription(desc);
            this.onSetRemoteSuccess(this.pc1);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
    }



    onIceCandidate = async (pc: any, event: any) => {
        try {
            await (this.getOtherPc(pc).addIceCandidate(event.candidate));
            this.onAddIceCandidateSuccess(pc);
        } catch (e) {
            this.onAddIceCandidateError(pc, e);
        }
        // console.log(`${this.getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }

    onAddIceCandidateSuccess = (pc: any) => {
        console.log(`${this.getName(pc)} addIceCandidate success`);
    }

    onAddIceCandidateError = (pc: any, error: any) => {
        console.log(`${this.getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
    }

    onIceStateChange = (pc: any, event: any) => {
        if (pc) {
            console.log(`${this.getName(pc)} ICE state: ${pc.iceConnectionState}`);
            console.log('ICE state change event: ', event);
        }
    }

    getName = (pc: any) => {
        return (pc === this.pc1) ? 'pc1' : 'pc2';
    }

    getOtherPc = (pc: any) => {
        return (pc === this.pc1) ? this.pc2 : this.pc1;
    }

    /// Public Methods
    private audioContext: AudioContext | null = null
    private audioOutputNode: MediaStreamAudioDestinationNode | null = null
    private remoteAudioMediaStream = new MediaStream()
    private localAudioMediaStream = new MediaStream()
    private remoteAudioSource: MediaStreamAudioSourceNode | null = null
    private localAudioSource: MediaStreamAudioSourceNode | null = null
    private remoteAudioTrack: MediaStreamTrack | null = null
    private localAudioTrack: MediaStreamTrack | null = null

    // remoteAudioSource.connect(audioOutputNode)
    // localAudioSource.connect(audioOutputNode)

    replaceVideoTrack = (track: MediaStreamTrack) => {
        this.videoSender?.replaceTrack(track)
    }

    private replaceAudioTrack = (type: RecordAudioType, track: MediaStreamTrack) => {
        if (!this.audioContext) {
            this.audioContext = DefaultDeviceController.getAudioContext();

        }
        if (!this.audioOutputNode) {
            this.audioOutputNode = this.audioContext.createMediaStreamDestination();
        }
        const targetTrack = type === RecordAudioType.remote ? this.remoteAudioTrack : this.localAudioTrack
        if (targetTrack?.id === track.id) {
            console.log(`[tracks]:::${type}:: not change`)
            return
        }
        if (type === RecordAudioType.remote) {
            this.remoteAudioTrack = track
        } else {
            this.localAudioTrack = track
        }

        const targetAudioSource = type === RecordAudioType.remote ? this.remoteAudioSource : this.localAudioSource
        if (targetAudioSource) {
            targetAudioSource.disconnect()
        }

        const targetAudioMediaStream = type === RecordAudioType.remote ? this.remoteAudioMediaStream : this.localAudioMediaStream
        targetAudioMediaStream.getTracks().forEach(x => {
            targetAudioMediaStream.removeTrack(x)
            x.stop()
        })
        targetAudioMediaStream.addTrack(track)
        if (type === RecordAudioType.remote) {
            this.remoteAudioSource = this.audioContext.createMediaStreamSource(targetAudioMediaStream)
            this.remoteAudioSource.connect(this.audioOutputNode)
        } else {
            this.localAudioSource = this.audioContext.createMediaStreamSource(targetAudioMediaStream)
            this.localAudioSource.connect(this.audioOutputNode)
        }

        const tracks = this.audioOutputNode.stream.getAudioTracks()
        this.audioSender?.replaceTrack(tracks[0])
    }
    replaceLocalAudioTrack = (track: MediaStreamTrack) => {
        this.replaceAudioTrack(RecordAudioType.local, track)
    }

    replaceRemoteAudioTrack = (track: MediaStreamTrack) => {
        this.replaceAudioTrack(RecordAudioType.remote, track)
    }

    chunks: Blob[] = [];
    startRecording = async (dataCallback: (data: any) => Promise<void>) => {
        if (!this.localStream) {
            this.localStream = this.createDefaultStream()
            this.localStream.getTracks().forEach((track) => {
                if (track.kind == "video") {
                    console.log("video track added")
                    this.videoSender = this.pc1.addTrack(track, this.localStream!)

                } else if (track.kind == "audio") {
                    console.log("audio track added")
                    this.audioSender = this.pc1.addTrack(track, this.localStream!)
                }
            })
        }

        try {
            const offer = await this.pc1.createOffer(this.offerOptions);
            await this.onCreateOfferSuccess(offer);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }


        const updateChimeMediaStream = () => {
            const video = document.getElementById("main-video-area-video-0") as HTMLVideoElement
            const audio = document.getElementById("chime-audio-output-element") as HTMLAudioElement
            if (video) {
                // @ts-ignore
                const ms = video.captureStream()
                this.replaceVideoTrack(ms.getVideoTracks()[0])
            } else {
                this.replaceVideoTrack(this.localStream!.getVideoTracks()[0])
            }

            // @ts-ignore
            const audioMS = audio.captureStream()
            this.replaceRemoteAudioTrack(audioMS.getAudioTracks()[0])
        }


        setTimeout(() => {
            const updateChimeMediaStreamInner = () => {
                updateChimeMediaStream()
                setTimeout(() => {
                    updateChimeMediaStreamInner()
                }, 1000 * 2)
            }
            updateChimeMediaStreamInner()
        }, 1000 * 0)


        // const recVideo = document.getElementById("video-for-recorder") as HTMLVideoElement
        // recVideo.srcObject = this.remoteStream!
        // recVideo.play()
        this.videoElement.srcObject = this.remoteStream!
        this.videoElement.play()


        console.log("start recording", this.remoteStream)
        console.log("start recording", this.remoteStream?.getTracks())
        if (!this.remoteStream) {
            console.warn("remote stream is not ready.")
            return
        }
        this.mediaRecorder = new MediaRecorder(this.remoteStream);
        // this.mediaRecorder = new MediaRecorder(ms);
        this.mediaRecorder.ondataavailable = (e) => {
            console.log("Added Data", e);
            this.chunks.push(e.data);
        }
        this.mediaRecorder.onstop = (e) => {
            console.log("data available after MediaRecorder.stop() called.");
            const blob = new Blob(this.chunks, {
                type: 'video/webm'
            });
            dataCallback(blob)
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            document.body.appendChild(a);
            // @ts-ignore
            a.style = 'display: none';
            a.href = url;
            a.download = 'test.mp4';
            a.click();
            window.URL.revokeObjectURL(url);
            this.chunks = [];
        };
        this.mediaRecorder.start();
    }
    stopRecording = () => {
        if (!this.mediaRecorder) {
            console.warn("reacorder is not ready.")
            return
        }
        this.mediaRecorder.stop();
    }

}
