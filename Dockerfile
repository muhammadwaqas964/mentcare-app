# Use Debian Bookworm Slim base image
FROM debian:bookworm-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libmariadb-dev \
    wget \
    curl \
    unzip \
    ca-certificates \
    gnupg2 \
    lsb-release \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Manually download and add Google's GPG key
RUN curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | tee /etc/apt/trusted.gpg.d/google.asc \
    || { echo "Failed to add Google Chrome GPG key"; exit 1; }

# Add Google Chrome repository
RUN echo "deb [signed-by=/etc/apt/trusted.gpg.d/google.asc] https://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
    || { echo "Failed to add Google Chrome repository"; exit 1; }

# Update apt repositories
RUN apt-get update || { echo "Failed to update apt repositories"; exit 1; }

# Install Google Chrome
RUN apt-get install -y google-chrome-stable \
    || { echo "Failed to install Google Chrome"; exit 1; }

# Clean up apt cache
RUN rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN LATEST=$(curl -sSL https://chromedriver.storage.googleapis.com/LATEST_RELEASE) \
    && wget -N https://chromedriver.storage.googleapis.com/$LATEST/chromedriver_linux64.zip \
    && unzip chromedriver_linux64.zip -d /usr/local/bin/ \
    && rm chromedriver_linux64.zip

# Set working directory
WORKDIR /app

# Copy the requirements file into the container
COPY ../requirements.txt /app/

# Create a virtual environment and install Python dependencies
RUN python3 -m venv /venv \
    && /venv/bin/pip install --no-cache-dir -r requirements.txt

# Set environment variables for Flask to use virtual environment's Python
ENV PATH="/venv/bin:$PATH"

# Copy the backend code into the container
COPY ../backend /app/backend

# Expose the necessary port for Flask
EXPOSE 5000

# Set the command to run the Flask app
CMD ["flask", "run", "--host=0.0.0.0"]