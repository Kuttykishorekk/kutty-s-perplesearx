# 📈 Perplefina - An AI-powered Financial News & Data Analysis Engine 🔍 <!-- omit in toc -->

**A specialized financial search engine built for the [Trading Goose](https://trading-goose.github.io) Multi-LLM Agent Portfolio Management Project**

*Modified from Perplexica to provide dedicated financial news and data analysis capabilities for autonomous trading agents*

<hr/>


![preview](.assets/perplexica-screenshot.png?)

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Preview](#preview)
- [Features](#features)
- [Installation](#installation)
  - [Getting Started with Docker (Recommended)](#getting-started-with-docker-recommended)
  - [Non-Docker Installation](#non-docker-installation)
  - [Ollama Connection Errors](#ollama-connection-errors)
- [Using as a Search Engine](#using-as-a-search-engine)
- [Using Perplexica's API](#using-perplexicas-api)
- [Expose Perplexica to a network](#expose-perplexica-to-network)
- [One-Click Deployment](#one-click-deployment)
- [Upcoming Features](#upcoming-features)
- [Support Us](#support-us)
  - [Donations](#donations)
- [Contribution](#contribution)
- [Help and Support](#help-and-support)

## Overview

Perplefina is a specialized fork of Perplexica, developed as a core component of the **Trading Goose Multi-LLM Agent Portfolio Management System**. This project integrates multiple AI agents to autonomously analyze markets, make trading decisions, and manage investment portfolios.

### Trading Goose Project Integration

Perplefina serves as the financial intelligence layer for Trading Goose, providing:
- **Real-time Market Intelligence**: Feeds trading agents with up-to-date financial news and market data
- **Multi-Agent Support**: Designed to handle concurrent requests from multiple LLM agents analyzing different market sectors
- **API-First Architecture**: Built for seamless integration with the Trading Goose agent orchestration system

### Key Capabilities

This AI-powered search engine specializes in financial data retrieval, offering:
- Deep searches into financial sources for market insights and economic indicators
- Custom focus modes optimized for algorithmic trading strategies
- Advanced reranking algorithms tuned for financial relevance
- Integration with SearxNG configured with specialized financial search engines

Learn more about the Trading Goose project at [trading-goose.github.io](https://trading-goose.github.io)

Want to know more about its architecture and how it works? You can read it [here](https://github.com/ItzCrazyKns/Perplexica/tree/master/docs/architecture/README.md).

## Preview

![video-preview](.assets/perplexica-preview.gif)

## Features

### Trading Goose Integration Features
- **Multi-Agent API Support**: Handle concurrent requests from multiple trading agents
- **Custom Model Configuration**: Support for any OpenAI-compatible API for agent diversity
- **Financial Focus Modes**: Specialized search modes tailored for trading strategies
- **High-Performance Architecture**: Optimized for the rapid decision-making needs of algorithmic trading

### Core Capabilities
- **Local LLMs**: Support for local models via Ollama for sensitive financial data processing
- **Two Main Modes:**
  - **Copilot Mode:** (In development) Enhanced search with multi-query generation
  - **Normal Mode:** Standard query processing with web search
  
### Financial Focus Modes
Specialized modes designed for the Trading Goose agents:
- **News Mode:** Real-time financial news for market sentiment analysis
- **Fundamentals Mode:** Company earnings, financial statements, and valuation metrics
- **Macro Economy Mode:** Economic indicators, Fed policy, inflation data
- **Social Mode:** Reddit, Twitter, and forum sentiment for alternative data signals
- **Web Search Mode:** General market research and analysis
- **Writing Assistant Mode:** Report generation for portfolio updates
- **Current Information:** Some search tools might give you outdated info because they use data from crawling bots and convert them into embeddings and store them in a index. Unlike them, Perplexica uses SearxNG, a metasearch engine to get the results and rerank and get the most relevant source out of it, ensuring you always get the latest information without the overhead of daily data updates.
- **API**: Integrate Perplexica into your existing applications and make use of its capibilities.

It has many more features like image and video search. Some of the planned features are mentioned in [upcoming features](#upcoming-features).

## Installation

Perplefina uses a hybrid approach: the main application runs with npm, while the SearxNG search engine runs in Docker for optimal performance.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for SearxNG)

### Installation Steps

1. Clone the Perplefina repository:

   ```bash
   git clone https://github.com/trading-goose/Perplefina.git
   cd Perplefina
   ```

2. Set up and start the SearxNG search engine:

   ```bash
   cd searxng
   docker compose up -d
   ```

   This will start the SearxNG engine with specialized financial search configurations.

3. Navigate back to the root directory and configure the application:

   ```bash
   cd ..
   ```

4. Rename the `sample.config.toml` file to `config.toml` and fill in the following fields:

   - `OPENAI`: Your OpenAI API key. **You only need to fill this if you wish to use OpenAI's models**.
   - `OLLAMA`: Your Ollama API URL. You should enter it as `http://host.docker.internal:PORT_NUMBER`. If you installed Ollama on port 11434, use `http://host.docker.internal:11434`. For other ports, adjust accordingly. **You need to fill this if you wish to use Ollama's models instead of OpenAI's**.
   - `GROQ`: Your Groq API key. **You only need to fill this if you wish to use Groq's hosted models**.
   - `ANTHROPIC`: Your Anthropic API key. **You only need to fill this if you wish to use Anthropic models**.
   - `Gemini`: Your Gemini API key. **You only need to fill this if you wish to use Google's models**.
   - `DEEPSEEK`: Your Deepseek API key. **Only needed if you want Deepseek models.**
   - `AIMLAPI`: Your AI/ML API key. **Only needed if you want to use AI/ML API models and embeddings.**

     **Note**: You can change these after starting Perplefina from the settings dialog.

   - `SIMILARITY_MEASURE`: The similarity measure to use (This is filled by default; you can leave it as is if you are unsure about it.)

5. Install dependencies and build the application:

   ```bash
   npm install
   npm run build
   ```

6. Start the application:

   ```bash
   npm run start
   ```

7. Access Perplefina at http://localhost:3000 in your web browser.

**Note**: Ensure that SearxNG is running (via docker compose in the searxng directory) before starting the main application.

### Quick Start Commands

```bash
# Clone the repository
git clone https://github.com/trading-goose/Perplefina.git
cd Perplefina

# Start SearxNG search engine
cd searxng
docker compose up -d
cd ..

# Configure the application
cp sample.config.toml config.toml
# Edit config.toml with your API keys

# Build and start Perplefina
npm install
npm run build
npm run start
```

### Stopping the Services

```bash
# Stop the main application
# Press Ctrl+C in the terminal running npm run start

# Stop SearxNG
cd searxng
docker compose down
```

See the [installation documentation](https://github.com/ItzCrazyKns/Perplexica/tree/master/docs/installation) for more information like updating, etc.

### Ollama Connection Errors

If you're encountering an Ollama connection error, it is likely due to the backend being unable to connect to Ollama's API. To fix this issue you can:

1. **Check your Ollama API URL:** Ensure that the API URL is correctly set in the settings menu.
2. **Update API URL Based on OS:**

   - **Windows:** Use `http://host.docker.internal:11434`
   - **Mac:** Use `http://host.docker.internal:11434`
   - **Linux:** Use `http://<private_ip_of_host>:11434`

   Adjust the port number if you're using a different one.

3. **Linux Users - Expose Ollama to Network:**

   - Inside `/etc/systemd/system/ollama.service`, you need to add `Environment="OLLAMA_HOST=0.0.0.0:11434"`. (Change the port number if you are using a different one.) Then reload the systemd manager configuration with `systemctl daemon-reload`, and restart Ollama by `systemctl restart ollama`. For more information see [Ollama docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux)

   - Ensure that the port (default is 11434) is not blocked by your firewall.

## Using as a Financial Research Tool

If you wish to use Perplefina as your primary financial research tool or add a shortcut for quick market analysis from your browser's search bar, follow these steps:

1. Open your browser's settings.
2. Navigate to the 'Search Engines' section.
3. Add a new site search with the following URL: `http://localhost:3000/?q=%s`. Replace `localhost` with your IP address or domain name, and `3000` with the port number if Perplefina is not hosted locally.
4. Click the add button. Now, you can use Perplefina directly from your browser's search bar for quick financial queries.

## Using Perplefina's API

### Trading Goose Agent Integration

Perplefina's API is designed to be the primary data source for Trading Goose agents. Each agent can:
- Query different financial focus modes based on their specialization
- Use custom LLM configurations for diverse analysis perspectives  
- Stream responses for real-time decision making
- Process concurrent requests without interference

### API Documentation

For detailed API usage, including custom model configuration and financial focus modes, see the [API documentation](./docs/API/SEARCH.md).

### Example: Trading Agent Query
```javascript
// Example: A Trading Goose agent querying for market analysis
const response = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatModel: {
      provider: 'openai',
      model: 'gpt-4-turbo',
      apiKey: process.env.AGENT_API_KEY
    },
    focusMode: 'fundamentals',
    query: 'NVDA earnings analysis and forward PE ratio',
    maxSources: 20,
    optimizationMode: 'balanced'
  })
});
```

## Expose Perplefina to network

Perplefina runs on Next.js and handles all API requests. It works right away on the same network and stays accessible even with port forwarding.

## Project Links

- **Trading Goose Project**: [trading-goose.github.io](https://trading-goose.github.io)
- **Perplefina Repository**: [github.com/trading-goose/Perplefina](https://github.com/trading-goose/Perplefina)
- **API Documentation**: [Search API Docs](./docs/API/SEARCH.md)

## Credits

Perplefina is based on the excellent [Perplexica](https://github.com/ItzCrazyKns/Perplexica) project by ItzCrazyKns, modified and enhanced for the Trading Goose Multi-LLM Agent Portfolio Management System.
