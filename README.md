# Voice AI Agent & Web App

A powerful real-time Voice AI application built with **LiveKit**, **Next.js**, and **Python**.

## Project Structure

This repository contains two main components:

1.  **`livekit-voice-agent`**: The backend Python agent that handles real-time audio processing, LLM integration, and voice responses.
2.  **`livekit-web-app`**: The frontend Next.js application that provides a modern, responsive user interface for interacting with the AI agent.

## Features

- 🎙️ **Real-time Voice Interaction**: Low-latency audio communication using LiveKit.
- 🤖 **AI Powered**: Integrated with advanced LLMs for intelligent responses.
- 💻 **Modern UI**: Built with Next.js and Tailwind CSS for a premium experience.
- 📱 **Responsive Design**: Optimized for desktop and mobile devices.

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- LiveKit Cloud account (or self-hosted server)

### Setup Backend (Voice Agent)

1. Navigate to the agent directory:
   ```bash
   cd livekit-voice-agent
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your `.env.local` file with LiveKit and LLM API keys.
4. Run the agent:
   ```bash
   python agent.py dev
   ```

### Setup Frontend (Web App)

1. Navigate to the web app directory:
   ```bash
   cd livekit-web-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env.local` file with LiveKit connection details.
4. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Backend**: Python, [LiveKit Agents SDK](https://github.com/livekit/agents)
- **Frontend**: Next.js, TypeScript, [LiveKit React Components](https://github.com/livekit/components-react)
- **Communication**: WebRTC via LiveKit

## License

Created by **Ankit Yadav**.
