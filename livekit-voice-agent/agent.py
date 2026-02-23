import logging
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AudioConfig,
    BackgroundAudioPlayer,
    BuiltinAudioClip,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
)
from livekit.plugins import (
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.plugins import google
from prompt import SYSTEM_PROMPT, WELCOME_MESSAGE, AGENT_CONFIG

logger = logging.getLogger("agent-dummyCode")

load_dotenv(".env.local")

# These will now use the values from prompt.py


class DefaultAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=SYSTEM_PROMPT,
        )

    async def on_enter(self):
        await self.session.generate_reply(
            instructions=f"Greet user with \"{WELCOME_MESSAGE}\"",
            allow_interruptions=False,
        )


server = AgentServer()

@server.rtc_session(agent_name=AGENT_CONFIG["agent_name"])
async def entrypoint(ctx: JobContext):
    

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model=AGENT_CONFIG["model"],
            voice=AGENT_CONFIG["voice"],
            temperature=AGENT_CONFIG["temperature"],
            instructions=SYSTEM_PROMPT,
        ),
    )

    await session.start(
        agent=DefaultAgent(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )

    background_audio = BackgroundAudioPlayer(
        ambient_sound=AudioConfig(BuiltinAudioClip.OFFICE_AMBIENCE, volume=AGENT_CONFIG["ambient_volume"]),
    )

    await background_audio.start(room=ctx.room, agent_session=session)


if __name__ == "__main__":
    cli.run_app(server)
