"use client";

import { useUser } from "@clerk/nextjs";
import {
  Call,
  MemberRequest,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { getUserIds } from "./actions";
import Button from "@/components/Button";
import Link from "next/link";

export default function CreateMeetingPage() {
  const [descriptionInput, setDescriptionInput] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [participantsInput, setParticipantsInput] = useState("");
  const [call, setCall] = useState<Call>();

  const client = useStreamVideoClient();
  const { user } = useUser();

  async function createMeeting() {
    if (!client || !user) {
      return;
    }
    try {
      const id = crypto.randomUUID();
      const callType = participantsInput ? "Private" : "default";
      const call = client.call(callType, id);
      const memberEmails = participantsInput
        .split(",")
        .map((email) => email.trim());
      const memberIds = await getUserIds(memberEmails);
      const members: MemberRequest[] = memberIds
        .map((id: any) => ({ user_id: id, role: "call_member" }))
        .concat({ user_id: user.id, role: "call_member" })
        .filter(
          (v: any, i: any, a: any) =>
            a.findIndex((v2: any) => v2.user_id === v.user_id) === i
        );

      const starts_at = new Date(startTimeInput || Date.now()).toISOString();
      await call.getOrCreate({
        data: {
          starts_at,
          members,
          custom: { description: descriptionInput },
        },
      });
      setCall(call);
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  }

  if (!client || !user) {
    return <Loader2 className="mx-auto animate-spin" />;
  }
  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="text-center text-2xl font-bold">
        Welcome {user.username}
      </h1>
      <div className="mx-auto w-80 space-y-6 rounded-md bg-slate-100 p-5">
        <h2 className="text-xl font-bold">Create a new meeting</h2>
        <DescriptionInput
          value={descriptionInput}
          onChange={setDescriptionInput}
        />
        <StartTimeInput value={startTimeInput} onChange={setStartTimeInput} />
        <ParticipantsInput
          value={participantsInput}
          onChange={setParticipantsInput}
        />
        <Button onClick={createMeeting} className="w-full">
          {" "}
          Create Meeting
        </Button>
      </div>
      {call && <MeetingLink call={call} />}
    </div>
  );
}

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  const [active, setActive] = useState(false);
  return (
    <div className="space-y-2">
      <div className="font-medium">Meeting info</div>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked);
            onChange("");
          }}
        />
        Add descripton
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Description</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={500}
            className="w-full rounded-md border border-gray-300 p-2"
          ></textarea>
        </label>
      )}
    </div>
  );
}

interface StartTimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

function StartTimeInput({ value, onChange }: StartTimeInputProps) {
  const [active, setActive] = useState(false);
  const formatDateTimeLocal = (date: Date): string => {
    const pad = (num: number): string => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getPakistanCurrentTime = (): Date => {
    const currentUTC = new Date();
    const utcOffset = currentUTC.getTimezoneOffset() * 60_000;
    const pakistanOffset = 5 * 60 * 60_000;
    return new Date(currentUTC.getTime() + utcOffset + pakistanOffset);
  };

  const dateTimeLocalNow = formatDateTimeLocal(getPakistanCurrentTime());
  return (
    <div className="space-y-2">
      <div className="font-medium">Meeting start:</div>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Start meeting immediately
      </label>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={active}
          onChange={() => {
            setActive(true);
            onChange(dateTimeLocalNow);
          }}
        />
        Start meeting at date/time
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Start time</span>{" "}
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={dateTimeLocalNow}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </label>
      )}
    </div>
  );
}

interface ParticipantsInputProps {
  value: string;
  onChange: (value: string) => void;
}

function ParticipantsInput({ value, onChange }: ParticipantsInputProps) {
  const [active, setActive] = useState(false);
  return (
    <div className="space-y-2">
      <div className="font-medium">Participants</div>
      <label className="flex items-center gap-1.5">
        {" "}
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Everyone with Link can Join
      </label>
      <label className="flex items-center gap-1.5">
        {" "}
        <input
          type="radio"
          checked={active}
          onChange={() => {
            setActive(true);
          }}
        />
        Private Meeting
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Participant emails</span>{" "}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter Participants email addresses separated bycommas"
            className="w-full rounded-md border border-gray-300 p-2"
          ></textarea>
        </label>
      )}
    </div>
  );
}

interface MeetingLinkProps {
  call: Call;
}

function MeetingLink({ call }: MeetingLinkProps) {
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call.id}`;
  return (
    <div className="text-center flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span>
          Invitation link:{" "}
          <Link href={meetingLink} className="font-medium">
            {meetingLink}
          </Link>
        </span>
        <button
          title="Copy Link"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            alert("Copied to Clipboard");
          }}
        >
          <Copy />
        </button>
      </div>
      <a
        href={getMailtoLink(
          meetingLink,
          call.state.startedAt,
          call.state.custom.description
        )}
        className="text-blue-500 hover:underline"
      >
        Send email invitation
      </a>
    </div>
  );
}

function getMailtoLink(
  meetingLink: string,
  startsAt?: Date,
  description?: string
) {
  const startDateFormatted = startsAt
    ? startsAt.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : undefined;
  const subject =
    "Join Meeting" + (startDateFormatted ? `at ${startDateFormatted}` : "");

  const body =
    `Join my meeting at ${meetingLink}.` +
    (startDateFormatted
      ? `\n\nThe meeting starts at ${startDateFormatted}.`
      : "") +
    (description ? `n\n\Description: ${description}` : "");
  return `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
