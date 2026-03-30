import logging
import asyncio
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
    llm,
    room_io,
)

from llama_index.core import (
    SimpleDirectoryReader,
    StorageContext,
    VectorStoreIndex,
    load_index_from_storage,
    Settings,
)
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding


from pathlib import Path


from livekit.plugins import (
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.plugins import google
from prompt import SYSTEM_PROMPT, WELCOME_MESSAGE, AGENT_CONFIG

logger = logging.getLogger("agent-dummyCode")

load_dotenv(".env.local")

# Configure LlamaIndex embeddings for retrieval (no LLM needed — the Realtime model handles synthesis)
Settings.embed_model = GoogleGenAIEmbedding(model_name="models/gemini-embedding-001")


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


THIS_DIR = Path(__file__).parent
DATA_DIR = THIS_DIR / "data"
PERSIST_DIR = THIS_DIR / "query-engine-storage"


def _data_is_stale() -> bool:
    """Check if any data file is newer than the cached index."""
    if not PERSIST_DIR.exists():
        return True
    # Get the oldest index file's modification time
    index_files = list(PERSIST_DIR.iterdir())
    if not index_files:
        return True
    index_mtime = min(f.stat().st_mtime for f in index_files)
    # Check if any data file is newer
    for data_file in DATA_DIR.rglob("*"):
        if data_file.is_file() and data_file.stat().st_mtime > index_mtime:
            return True
    return False


def _build_index():
    """Build or load the vector store index."""
    if _data_is_stale():
        logger.info("Building fresh index from data/ directory...")
        # Remove old cache if it exists
        if PERSIST_DIR.exists():
            import shutil
            shutil.rmtree(PERSIST_DIR)
        documents = SimpleDirectoryReader(DATA_DIR).load_data()
        logger.info(f"Loaded {len(documents)} documents")
        idx = VectorStoreIndex.from_documents(documents)
        idx.storage_context.persist(persist_dir=PERSIST_DIR)
        logger.info("Index built and saved to disk.")
        return idx
    else:
        logger.info("Loading existing index from cache...")
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
        idx = load_index_from_storage(storage_context)
        logger.info("Index loaded successfully.")
        return idx


index = _build_index()


@llm.function_tool
async def query_info(query: str) -> str:
    """Get more information about a specific topic. Use this tool whenever the user asks a question about any topic."""
    retriever = index.as_retriever(similarity_top_k=3)
    nodes = await retriever.aretrieve(query)
    if not nodes:
        return "No relevant information found."
    # Return the raw text chunks — let the Realtime model summarize
    results = []
    for node in nodes:
        results.append(node.get_content())
    combined = "\n\n---\n\n".join(results)
    logger.info(f"Retrieved {len(nodes)} chunks for query: {query}")
    return combined



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
        tools=[query_info],
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
    
    # ----------------------------------------------------
    # ANTI-ABUSE: Auto-Disconnect Timer (3 Minutes)
    # ----------------------------------------------------
    async def auto_disconnect():
        try:
            # Wait for 3 minutes (180 seconds)
            await asyncio.sleep(180)
            logger.info("Session hit 3-minute hard limit. Automatically disconnecting to save quotas.")
            await session.generate_reply("My 3-minute limit is up to save API usage! Disconnecting now, goodbye!")
            # Give it a second to say goodbye
            await asyncio.sleep(4)
        except Exception as e:
            logger.error(f"Disconnect timer error: {e}")
        finally:
            await ctx.room.disconnect()

    # Start the timeout task safely in the background
    asyncio.create_task(auto_disconnect())


if __name__ == "__main__":
    cli.run_app(server)
