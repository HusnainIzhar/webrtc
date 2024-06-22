"use client";

import AudioVolumeIndicator from "@/components/AudioVolumeIndicator";
import Button from "@/components/Button";
import FlexibleCallLayout from "@/components/FlexibleCallLayout";
import PermissionPrompt from "@/components/PermissionPrompt";
import useLoadCall from "@/hooks/useLoadCall";
import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs";
import {
  Call,
  CallControls,
  CallingState,
  DeviceSettings,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  VideoPreview,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MeetingpPageProps {
  id: string;
}

export default function MeetingPage({ id }: MeetingpPageProps) {
  const { call, callLoading } = useLoadCall(id);
  const client = useStreamVideoClient();
  const { user, isLoaded: userLoaded } = useUser();

  if (!userLoaded || callLoading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (!client) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (!call) {
    return <p className="text-center font-bold">Call not found</p>;
  }

  const notAllowedToJoin =
    call.type === "Private" &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));
  if (notAllowedToJoin) {
    return (
      <p className="text-center font-bold">
        You are not allowed to Join the Meeting
      </p>
    );
  }
  return (
    <StreamCall call={call}>
      <StreamTheme>
        <MeetingScreen />
      </StreamTheme>
    </StreamCall>
  );
}

function MeetingScreen() {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callEndedAt = useCallEndedAt();
  const call = useStreamCall();
  const [setupComplete, setSetupComplete] = useState(false);
  const callStartsAt = useCallStartsAt();
  async function handleSetupComplete() {
    call.join();
    setSetupComplete(true);
  }
  const calIsInFuture = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;
  if (callHasEnded) {
    return <MeetingEndedScreen />;
  }
  if (calIsInFuture) {
    return <UpComingMeetingScreen />;
  }
  const description = call.state.custom.description;
  return (
    <div className="space-y-6">
      {description && (
        <p className="text-center">
          Meeting description: <span className="font-bold">{description}</span>
        </p>
      )}
      {setupComplete ? (
        <CallUi />
      ) : (
        <SetupUI onSetupComplete={handleSetupComplete} />
      )}
    </div>
  );
}

interface SetupUIProps {
  onSetupComplete: () => void;
}

function SetupUI({ onSetupComplete }: SetupUIProps) {
  const call = useStreamCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const micState = useMicrophoneState();
  const camState = useCameraState();
  const [micCamDisabled, setMicCamDisabled] = useState(false);

  useEffect(() => {
    if (micCamDisabled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [micCamDisabled, call]);
  if (!micState.hasBrowserPermission || !camState.hasBrowserPermission) {
    return <PermissionPrompt />;
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-enter text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center gap-3">
        <AudioVolumeIndicator/>
        <DeviceSettings />
      </div>
      <label className="flex items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={micCamDisabled}
          onChange={(e) => setMicCamDisabled(e.target.checked)}
        />
        Join with mic and camera off
      </label>
      <Button onClick={onSetupComplete}>Join Meeting</Button>
    </div>
  );
}

function CallUi(){
  const {useCallCallingState} = useCallStateHooks();
  const callingState = useCallCallingState();
  if(callingState !== CallingState.JOINED){
    return <Loader2 className="mx-auto animate-spin"/>
  }
  return <FlexibleCallLayout/>
}

function UpComingMeetingScreen() {
  const call = useStreamCall();
  return (
    <div className="flex flex-col items-center gap-6">
      <p>
        This meeting has not started yet.it will start at{" "}
        <span className="font-bold">
          {call.state.startsAt?.toLocaleString()}
        </span>
      </p>
      {call.state.custom.description && (
        <p>
          Description:{" "}
          <span className="font-bold">{call.state.custom.description}</span>
        </p>
      )}
      <Link href="/">Go Home</Link>
    </div>
  );
}

function MeetingEndedScreen() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-bold">This meeting has ended</p>
      <Link href={"/"}>Go Home</Link>
    </div>
  );
}
