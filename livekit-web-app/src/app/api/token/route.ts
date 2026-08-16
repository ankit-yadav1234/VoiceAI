import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const roomName = searchParams.get('room') || 'voice-room-' + Math.floor(Math.random() * 10000);
      const participantName = searchParams.get('participant') || 'user-' + Math.floor(Math.random() * 1000);
      
      const persona = searchParams.get('persona') || 'general';
      const voice = searchParams.get('voice') || 'Anyar';
      const prompt = searchParams.get('prompt') || '';

      if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
            return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 });
      }

      const metadataJson = JSON.stringify({ persona, voice, prompt });

      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
            identity: participantName,
            metadata: metadataJson,
      });

      at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
      });

      (at as unknown as { roomConfig: RoomConfiguration }).roomConfig = new RoomConfiguration({
            agents: [
                  new RoomAgentDispatch({
                        agentName: 'my-agent',
                        metadata: metadataJson,
                  }),
            ],
      });

      return NextResponse.json({
            token: await at.toJwt(),
            url: process.env.LIVEKIT_URL,
            roomName: roomName,
      });
}

