import { AgentDispatchClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
      try {
            const body = await request.json();
            const { roomName, agentName, metadata } = body;

            if (!roomName || !agentName) {
                  return NextResponse.json(
                        { error: 'roomName and agentName are required' },
                        { status: 400 }
                  );
            }

            const host = process.env.LIVEKIT_URL?.replace('wss://', 'https://');
            console.log('Dispatching request:', { roomName, agentName, host });

            if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !host) {
                  console.error('Missing configuration:', {
                        hasKey: !!process.env.LIVEKIT_API_KEY,
                        hasSecret: !!process.env.LIVEKIT_API_SECRET,
                        host
                  });
                  return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 });
            }

            const agentDispatchClient = new AgentDispatchClient(
                  host,
                  process.env.LIVEKIT_API_KEY,
                  process.env.LIVEKIT_API_SECRET
            );

            // create a dispatch request for an agent to join a room
            const dispatch = await agentDispatchClient.createDispatch(roomName, agentName, {
                  metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
            });

            console.log('Dispatch created successfully:', dispatch.id);

            return NextResponse.json({ dispatch });
      } catch (error: any) {
            console.error('DISPATCH ERROR DETAIL:', error);
            return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
      }
}

export async function GET(request: Request) {
      try {
            const { searchParams } = new URL(request.url);
            const roomName = searchParams.get('room');

            if (!roomName) {
                  return NextResponse.json({ error: 'roomName is required' }, { status: 400 });
            }

            if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
                  return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 });
            }

            const agentDispatchClient = new AgentDispatchClient(
                  process.env.LIVEKIT_URL,
                  process.env.LIVEKIT_API_KEY,
                  process.env.LIVEKIT_API_SECRET
            );

            const dispatches = await agentDispatchClient.listDispatch(roomName);
            console.log(`There are ${dispatches.length} dispatches in ${roomName}`);

            return NextResponse.json({ dispatches });
      } catch (error: any) {
            console.error('List dispatch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}

export async function DELETE(request: Request) {
      try {
            const { searchParams } = new URL(request.url);
            const roomName = searchParams.get('room');
            const dispatchId = searchParams.get('dispatchId');

            if (!roomName || !dispatchId) {
                  return NextResponse.json(
                        { error: 'roomName and dispatchId are required' },
                        { status: 400 }
                  );
            }

            if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
                  return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 });
            }

            const agentDispatchClient = new AgentDispatchClient(
                  process.env.LIVEKIT_URL,
                  process.env.LIVEKIT_API_KEY,
                  process.env.LIVEKIT_API_SECRET
            );

            await agentDispatchClient.deleteDispatch(roomName, dispatchId);
            console.log(`Deleted dispatch ${dispatchId} in ${roomName}`);

            return NextResponse.json({ success: true });
      } catch (error: any) {
            console.error('Delete dispatch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}
