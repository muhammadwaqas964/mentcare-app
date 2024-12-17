# Use Python 3.9 slim image
FROM python:3.9-slim

# Install required dependencies (including pkg-config, Chrome, and lsb-release)
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libmariadb-dev \
    wget \
    curl \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Add Google Chrome repository and install Google Chrome (using 'bookworm' for Debian)
RUN wget -q -O /usr/share/keyrings/google-archive-keyring.gpg https://dl.google.com/linux/linux_signing_key.pub \
    || { echo "Failed to download signing key"; exit 1; }

RUN echo "deb [signed-by=/usr/share/keyrings/google-archive-keyring.gpg] https://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
    || { echo "Failed to add Google Chrome repository"; exit 1; }

RUN apt-get update \
    || { echo "Failed to update apt repositories"; exit 1; }

RUN apt-get install -y google-chrome-stable \
    || { echo "Failed to install Google Chrome"; exit 1; }

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

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code into the container
COPY ../backend /app/backend

# Expose the necessary port for Flask
EXPOSE 5000

# Set the command to run the Flask app
CMD ["flask", "run", "--host=0.0.0.0"]
