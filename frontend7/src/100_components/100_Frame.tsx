import React, { useEffect, useMemo } from "react";
import { SignInDialog } from "./101-1_SignInDialog";
import { Sidebar } from "./100-2_Sidebar";
import { CreateRoomDialog } from "./101-2_CreateRoomDialog";
import { JoinRoomDialog } from "./101-3_JoinRoomDialog";
import { SettingDialog } from "./101-4_SettingDialog";
import { RightSidebar } from "./100-3_RightSidebar";
import { ViewTypes } from "../002_hooks/011_useFrontend";
import { LeaveDialog, LeaveDialogProps } from "./101-5_LeaveDialog";
import { Header } from "./100-1_Header";
import { useAppState } from "../003_provider/AppStateProvider";
import { MainArea } from "./100-4_MainArea";
import { Dialog } from "./101_Dialog";

export type FrameProps = {};

export const Frame = (_props: FrameProps) => {
    const { frontendState, cognitoClientState, backendManagerState } = useAppState();

    /**
     * action linking
     */
    // (x) signin state
    useEffect(() => {
        if (!cognitoClientState.signInCompleted || !backendManagerState.environment) {
            const signInDialogCheckboxs = document.querySelectorAll(".sign-in-checkbox");
            signInDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = true;
                // x.checked = false;
            });
        } else {
            const signInDialogCheckboxs = document.querySelectorAll(".sign-in-checkbox");
            signInDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = false;
            });
        }
    }, [cognitoClientState.signInCompleted, backendManagerState.environment]);

    //// Dialog

    //// for DEBUG
    useEffect(() => {
        frontendState.stateControls.openSidebarCheckbox.updateState(true);
    }, []);
    useEffect(() => {
        frontendState.stateControls.openRightSidebarCheckbox.updateState(true);
    }, []);

    //// initial
    useEffect(() => {
        frontendState.stateControls.viewRadioButtons[ViewTypes.feature].updateState(true);
        frontendState.stateControls.micEnableCheckbox.updateState(true);
        frontendState.stateControls.cameraEnableCheckbox.updateState(false);
        frontendState.stateControls.speakerEnableCheckbox.updateState(true);
        frontendState.stateControls.openBottomNavCheckbox.updateState(true);
    }, []);

    return (
        <>
            <Header />
            <Sidebar />
            <RightSidebar />
            <MainArea />

            <Dialog />
            {/* <SettingDialog />
            <LeaveDialog />
            <CreateRoomDialog />
            <JoinRoomDialog />

            <div>
                {frontendState.stateControls.signInCheckbox.trigger}
                <div className="dialog-container">
                    <SignInDialog />
                </div>
            </div> */}

            <div>
                <audio id="chime-audio-output-element" />
            </div>
            <div className="video-for-recorder-container">
                <video id="video-for-recorder" />
            </div>
        </>
    );
};
