import { SignedIn } from "@clerk/nextjs";
import CreateMeetingPage from "./createMeetingPage";

export default function Home() {
  return (
    <>
      <SignedIn>
        <CreateMeetingPage />
      </SignedIn>
    </>
  );
}
