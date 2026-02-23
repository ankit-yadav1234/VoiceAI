import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const roomName = searchParams.get('room') || 'voice-room-' + Math.floor(Math.random() * 10000);
      console.log(roomName);
      const participantName = searchParams.get('participant') || 'user-' + Math.floor(Math.random() * 1000);
      console.log(participantName);

      if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
            return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 });
      }

      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
            identity: participantName,
      });

      at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
      });

      // Note: We are now using explicit dispatch via /api/dispatch in the frontend
      // so we don't need the automatic RoomConfiguration here.

      return NextResponse.json({
            token: await at.toJwt(),
            url: process.env.LIVEKIT_URL,
            roomName: roomName,
      });
}
