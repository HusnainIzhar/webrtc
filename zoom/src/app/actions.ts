"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import dotenv from 'dotenv';
dotenv.config();


export async function getToken() {
  const streamApiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
  const streamApiSecret = process.env.NEXT_PUBLIC_STREAM_SECRET;

  if (!streamApiKey || !streamApiSecret) {
    throw new Error("Stream API or Secret not found!");
  }
  const user = await currentUser();
  if (!user) {
    throw new Error("user not authenticated");
  }
  const streamClient = new StreamClient(streamApiKey, streamApiSecret);
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;
  const token = streamClient.createToken(user.id, expirationTime, issuedAt);
  return token;
}
