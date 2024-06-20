"use client";
import dotenv from "dotenv";
dotenv.config();
import { useUser } from "@clerk/nextjs";
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { FC, useEffect, useState } from "react";
import { getToken } from "./actions";

interface ClientProviderProps {
  children: React.ReactNode;
}

const ClientProvider: FC<ClientProviderProps> = ({ children }) => {
  const videoClient = useInitializeVideoClient();

  if (!videoClient) {
    return (
      <>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="mx-auto animate-spin" />
        </div>
      </>
    );
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

const useInitializeVideoClient = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );

  useEffect(() => {
    if (!userLoaded) return;
    let streamUser: User;

    if (user?.id) {
      streamUser = {
        id: user.id,
        name: user?.username || user?.id,
        image: user?.imageUrl,
      };
    } else {
      const id = nanoid();
      streamUser = {
        id,
        type: "guest",
        name: `Guest ${id}`,
      };
    }
    const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
    if (!apiKey) {
      throw new Error("Stream Api not found");
    }

    const client = new StreamVideoClient({
      apiKey,
      user: streamUser,
      tokenProvider: user?.id ? getToken : undefined,
    });
    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(null);
    };
  }, [user?.id, user?.username, user?.imageUrl, userLoaded]);

  return videoClient;
};

export default ClientProvider;
