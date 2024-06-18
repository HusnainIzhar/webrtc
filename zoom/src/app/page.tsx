import { SignedIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <SignedIn>
        <h1>hello world</h1>
      </SignedIn>
    </>
  );
}
