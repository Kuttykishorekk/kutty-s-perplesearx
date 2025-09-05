# Perplefina Search API Documentation

## Overview

Perplefina's Search API provides powerful financial search and analysis capabilities. You can run different types of financial searches, use custom AI models, and get the most recent market information. This API supports specialized focus modes for financial research, custom model configurations, and advanced search parameters.

## Endpoint

### **POST** `http://localhost:3000/api/search`

**Note**: Replace `3000` with any other port if you've changed the default PORT

### Request

The API accepts a JSON object in the request body, where you define the focus mode, chat models, embedding models, and your query.

#### Request Body Structure

```json
{
  "chatModel": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "sk-...",  // Optional: for custom API key
    "baseUrl": "https://api.openai.com/v1"  // Optional: for custom endpoint
  },
  "optimizationMode": "balanced",
  "focusMode": "news",
  "query": "Tesla latest earnings report",
  "history": [
    ["human", "What are the latest market trends?"],
    ["assistant", "The market has been showing strong momentum..."]
  ],
  "systemInstructions": "Focus on financial metrics and market impact.",
  "maxSources": 15,
  "maxToken": 4000,
  "includeImages": false,
  "includeVideos": false,
  "stream": false
}
```

### Request Parameters

- **`chatModel`** (object, optional): Defines the chat model to be used for the query. You can either use system-configured models or provide custom model configuration.

  - `provider` (string): Specifies the provider for the chat model (e.g., `openai`, `ollama`, `groq`, `anthropic`).
  - `model` (string): The specific model from the chosen provider (e.g., `gpt-4o-mini`, `llama3`).
  - **Custom Model Configuration** (all fields required for custom models):
    - `apiKey` (string): Your API key for the model provider.
    - `baseUrl` (string, optional): Custom base URL if using a self-hosted or proxy endpoint.

- **`focusMode`** (string, required): Specifies which focus mode to use. Available modes:

  - **Financial Modes:**
    - `news`: Searches latest financial news and market updates (uses news engines).
    - `fundamentals`: Analyzes company fundamentals, earnings, and financial statements.
    - `macroEconomy`: Provides macroeconomic data, indicators, and analysis.
    - `social`: Searches social media and forums for market sentiment and discussions.
  
  - **General Modes:**
    - `webSearch`: General web search across all engines.
    - `academicSearch`: Academic papers and research (uses arxiv, google scholar, pubmed).
    - `writingAssistant`: Writing help without web search.
    - `wolframAlphaSearch`: Computational and data analysis queries.
    - `youtubeSearch`: YouTube video search.
    - `redditSearch`: Reddit discussion search.

- **`optimizationMode`** (string, optional): Specifies the optimization mode to control the balance between performance and quality. Defaults to `balanced`. Available modes:

  - `speed`: Prioritize speed without reranking results.
  - `balanced`: Use embedding models for reranking to improve result relevance.

- **`query`** (string, required): The search query or question.

- **`maxSources`** (number, optional): Maximum number of sources to retrieve. Defaults vary by focus mode (10-25).

- **`maxToken`** (number, optional): Maximum number of tokens for the response. Default is 4000.

- **`includeImages`** (boolean, optional): Whether to include images in search results. Default is false.

- **`includeVideos`** (boolean, optional): Whether to include videos in search results. Default is false.

- **`systemInstructions`** (string, optional): Custom instructions provided by the user to guide the AI's response. These instructions are treated as user preferences and have lower priority than the system's core instructions. For example, you can specify a particular writing style, format, or focus area.

- **`history`** (array, optional): An array of message pairs representing the conversation history. Each pair consists of a role (either 'human' or 'assistant') and the message content. This allows the system to use the context of the conversation to refine results. Example:

  ```json
  [
    ["human", "What is Perplexica?"],
    ["assistant", "Perplexica is an AI-powered search engine..."]
  ]
  ```

- **`stream`** (boolean, optional): When set to `true`, enables streaming responses. Default is `false`.

### Response

The response from the API includes both the final message and the sources used to generate that message.

#### Standard Response (stream: false)

```json
{
  "message": "Tesla reported strong Q3 2024 earnings with revenue of $25.18 billion, exceeding analyst expectations. Here are the key highlights:\n\n- **Revenue Growth**: Total revenue increased 8% year-over-year to $25.18 billion, beating consensus estimates of $24.38 billion.\n\n- **Profitability**: Net income reached $2.17 billion with an operating margin of 10.8%, demonstrating improved operational efficiency.\n\n- **Vehicle Deliveries**: Tesla delivered 462,890 vehicles in Q3, marking a 6.4% increase from the previous quarter.",
  "sources": [
    {
      "pageContent": "Tesla reported third-quarter revenue of $25.18 billion, beating Wall Street estimates...",
      "metadata": {
        "title": "Tesla Q3 2024 Earnings Beat Expectations",
        "url": "https://finance.yahoo.com/news/tesla-q3-earnings"
      }
    },
    {
      "pageContent": "Tesla's Q3 net income rose to $2.17 billion, with operating margins improving to 10.8%...",
      "metadata": {
        "title": "Tesla Reports Record Q3 Profitability",
        "url": "https://www.cnbc.com/tesla-earnings"
      }
    }
  ]
}
```

#### Streaming Response (stream: true)

When streaming is enabled, the API returns a stream of newline-delimited JSON objects. Each line contains a complete, valid JSON object. The response has Content-Type: application/json.

Example of streamed response objects:

```
{"type":"init","data":"Stream connected"}
{"type":"sources","data":[{"pageContent":"...","metadata":{"title":"...","url":"..."}},...]}
{"type":"response","data":"Perplexica is an "}
{"type":"response","data":"innovative, open-source "}
{"type":"response","data":"AI-powered search engine..."}
{"type":"done"}
```

Clients should process each line as a separate JSON object. The different message types include:

- **`init`**: Initial connection message
- **`sources`**: All sources used for the response
- **`response`**: Chunks of the generated answer text
- **`done`**: Indicates the stream is complete

### Fields in the Response

- **`message`** (string): The search result, generated based on the query and focus mode.
- **`sources`** (array): A list of sources that were used to generate the search result. Each source includes:
  - `pageContent`: A snippet of the relevant content from the source.
  - `metadata`: Metadata about the source, including:
    - `title`: The title of the webpage.
    - `url`: The URL of the webpage.

### Error Handling

If an error occurs during the search process, the API will return an appropriate error message with an HTTP status code.

- **400**: If the request is malformed or missing required fields (e.g., no focus mode or query).
- **500**: If an internal server error occurs during the search.

## Examples

### Using Custom Model API

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "chatModel": {
      "provider": "openai",
      "model": "gpt-4-turbo",
      "apiKey": "your-api-key-here",
      "baseUrl": "https://api.openai.com/v1"
    },
    "focusMode": "fundamentals",
    "query": "Apple stock PE ratio and earnings growth",
    "optimizationMode": "balanced",
    "maxSources": 20,
    "maxToken": 5000
  }'
```

### Financial News Search

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "focusMode": "news",
    "query": "Federal Reserve interest rate decision impact on tech stocks",
    "optimizationMode": "speed",
    "maxSources": 25,
    "systemInstructions": "Focus on the most recent developments and market reactions"
  }'
```

### Macro Economy Analysis

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "focusMode": "macroEconomy",
    "query": "US inflation data and GDP growth trends 2024",
    "optimizationMode": "balanced",
    "maxSources": 20,
    "includeImages": true
  }'
```

### Social Sentiment Analysis

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "focusMode": "social",
    "query": "Reddit sentiment on NVDA stock after earnings",
    "optimizationMode": "balanced",
    "maxSources": 20,
    "includeVideos": true
  }'
```

### Streaming Response Example

```javascript
const response = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    focusMode: 'news',
    query: 'Latest cryptocurrency market trends',
    stream: true,
    maxSources: 15
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line) {
      const data = JSON.parse(line);
      if (data.type === 'response') {
        console.log('Chunk:', data.data);
      } else if (data.type === 'sources') {
        console.log('Sources:', data.data);
      }
    }
  }
}
```
