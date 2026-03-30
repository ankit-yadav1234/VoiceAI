# Use an official lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies if required (for audio processing etc)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy only the files needed for installation first (for caching)
COPY pyproject.toml ./

# Install the project dependencies directly
# (Using pip since pyproject.toml with dependencies is standard)
RUN pip install --no-cache-dir .

# Copy the rest of the application files
COPY . .

# Run the livekit agent in "start" mode
CMD ["python", "agent.py", "start"]
