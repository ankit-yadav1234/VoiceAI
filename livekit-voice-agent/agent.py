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
            instructions=f"Greet the user warmly with exact words: '{WELCOME_MESSAGE}'",
            allow_interruptions=True,
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


_global_index = None


def get_index():
    """Lazily load the index on first tool invocation rather than blocking startup."""
    global _global_index
    if _global_index is None:
        _global_index = _build_index()
    return _global_index


@llm.function_tool
async def query_info(query: str) -> str:
    """Search internal knowledge base files ONLY when user explicitly asks about uploaded files or internal project documents."""
    idx = get_index()
    retriever = idx.as_retriever(similarity_top_k=3)
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



def get_resilient_llm():
    """Builds a resilient LLM with FallbackAdapter, supporting primary to secondary failover and chaos testing."""
    enable_chaos = AGENT_CONFIG.get("enable_chaos_test", False)
    primary_model = "invalid-chaos-model-name" if enable_chaos else AGENT_CONFIG.get("primary_model", "gemini-2.5-flash-native-audio-preview-12-2025")
    fallback_model = AGENT_CONFIG.get("fallback_model", "gemini-2.5-flash-native-audio-preview-12-2025")

    if enable_chaos:
        logger.warning("[CHAOS TEST] Chaos mode active: Primary model set to invalid name to verify fallback failover.")

    try:
        logger.info(f"Initializing primary Realtime LLM ({primary_model})...")
        return google.realtime.RealtimeModel(
            model=primary_model,
            voice=AGENT_CONFIG["voice"],
            temperature=AGENT_CONFIG["temperature"],
            instructions=SYSTEM_PROMPT,
        )
    except Exception as err:
        logger.error(f"Primary model initialization failed: {err}. Degrading gracefully to fallback model ({fallback_model}).")
        return google.realtime.RealtimeModel(
            model=fallback_model,
            voice=AGENT_CONFIG["voice"],
            temperature=AGENT_CONFIG["temperature"],
            instructions=SYSTEM_PROMPT,
        )

server = AgentServer()

@server.rtc_session(agent_name=AGENT_CONFIG["agent_name"])
async def entrypoint(ctx: JobContext):
    # Initialize Realtime Session with ultra-low latency & preemptive generation flags
    session = AgentSession(
        llm=get_resilient_llm(),
        tools=[query_info],
        preemptive_generation=True,
        min_endpointing_delay=0.15,
        max_endpointing_delay=1.2,
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

    # ----------------------------------------------------
    # ANTI-ABUSE: Auto-Disconnect Timer (3 Minutes)
    # ----------------------------------------------------
    async def auto_disconnect():
        try:
            # Wait for 3 minutes (180 seconds)
            await asyncio.sleep(180)
            logger.info("Session hit 3-minute hard limit. Automatically disconnecting to save quotas.")
            await session.generate_reply(instructions="My 3-minute limit is up to save API usage! Disconnecting now, goodbye!")
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
