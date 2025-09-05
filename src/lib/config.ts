import toml from '@iarna/toml';

// Use dynamic imports for Node.js modules to prevent client-side errors
let fs: any;
let path: any;
if (typeof window === 'undefined') {
  // We're on the server
  fs = require('fs');
  path = require('path');
}

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  MODELS: {
    OPENAI: {
      API_KEY: string;
    };
    GROQ: {
      API_KEY: string;
    };
    ANTHROPIC: {
      API_KEY: string;
    };
    GEMINI: {
      API_KEY: string;
    };
    OLLAMA: {
      API_URL: string;
    };
    DEEPSEEK: {
      API_KEY: string;
    };
    AIMLAPI: {
      API_KEY: string;
    };
    LM_STUDIO: {
      API_URL: string;
    };
    CUSTOM_OPENAI: {
      API_URL: string;
      API_KEY: string;
      MODEL_NAME: string;
    };
  };
  API_ENDPOINTS: {
    SEARXNG: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// --- MODIFIED FUNCTION ---
// Memoize the config so we don't read the file every time.
let loadedConfig: Config | null = null;
const loadConfig = (): Config => {
  if (loadedConfig) {
    return loadedConfig;
  }
  // Server-side only
  if (typeof window === 'undefined') {
    // Use the CONFIG_PATH environment variable if it exists, otherwise default to the working directory.
    const configPath = process.env.CONFIG_PATH || path.join(process.cwd(), configFileName);
    try {
      if (fs.existsSync(configPath)) {
        loadedConfig = toml.parse(fs.readFileSync(configPath, 'utf-8')) as any as Config;
        return loadedConfig!;
      }
    } catch (e) {
      console.error(`Error loading or parsing config file at ${configPath}:`, e);
    }
  }

  // Client-side or file-not-found fallback
  // The structure is returned to prevent "cannot read property of undefined" errors.
  return {
    GENERAL: { SIMILARITY_MEASURE: '', KEEP_ALIVE: '' },
    MODELS: {
      OPENAI: { API_KEY: '' },
      GROQ: { API_KEY: '' },
      ANTHROPIC: { API_KEY: '' },
      GEMINI: { API_KEY: '' },
      OLLAMA: { API_URL: '' },
      DEEPSEEK: { API_KEY: '' },
      AIMLAPI: { API_KEY: '' },
      LM_STUDIO: { API_URL: '' },
      CUSTOM_OPENAI: { API_URL: '', API_KEY: '', MODEL_NAME: '' },
    },
    API_ENDPOINTS: { SEARXNG: '' },
  };
};

// --- MODIFIED GETTERS TO PRIORITIZE ENVIRONMENT VARIABLES ---

export const getSimilarityMeasure = () => process.env.SIMILARITY_MEASURE || loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getKeepAlive = () => process.env.KEEP_ALIVE || loadConfig().GENERAL.KEEP_ALIVE;

export const getOpenaiApiKey = () => process.env.OPENAI_API_KEY || loadConfig().MODELS.OPENAI.API_KEY;

export const getGroqApiKey = () => process.env.GROQ_API_KEY || loadConfig().MODELS.GROQ.API_KEY;

export const getAnthropicApiKey = () => process.env.ANTHROPIC_API_KEY || loadConfig().MODELS.ANTHROPIC.API_KEY;

export const getGeminiApiKey = () => process.env.GEMINI_API_KEY || loadConfig().MODELS.GEMINI.API_KEY;

export const getSearxngApiEndpoint = () => process.env.SEARXNG_URL || loadConfig().API_ENDPOINTS.SEARXNG;

export const getOllamaApiEndpoint = () => process.env.OLLAMA_API_URL || loadConfig().MODELS.OLLAMA.API_URL;

export const getDeepseekApiKey = () => process.env.DEEPSEEK_API_KEY || loadConfig().MODELS.DEEPSEEK.API_KEY;

export const getAimlApiKey = () => process.env.AIMLAPI_KEY || loadConfig().MODELS.AIMLAPI.API_KEY;

export const getCustomOpenaiApiKey = () => process.env.CUSTOM_OPENAI_API_KEY || loadConfig().MODELS.CUSTOM_OPENAI.API_KEY;

export const getCustomOpenaiApiUrl = () => process.env.CUSTOM_OPENAI_API_URL || loadConfig().MODELS.CUSTOM_OPENAI.API_URL;

export const getCustomOpenaiModelName = () => process.env.CUSTOM_OPENAI_MODEL_NAME || loadConfig().MODELS.CUSTOM_OPENAI.MODEL_NAME;

export const getLMStudioApiEndpoint = () => process.env.LM_STUDIO_API_URL || loadConfig().MODELS.LM_STUDIO.API_URL;


const mergeConfigs = (current: any, update: any): any => {
    // ... (rest of the file is unchanged)
  if (update === null || update === undefined) {
    return current;
  }

  if (typeof current !== 'object' || current === null) {
    return update;
  }

  const result = { ...current };

  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      const updateValue = update[key];

      if (
        typeof updateValue === 'object' &&
        updateValue !== null &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = mergeConfigs(result[key], updateValue);
      } else if (updateValue !== undefined) {
        result[key] = updateValue;
      }
    }
  }

  return result;
};

export const updateConfig = (config: RecursivePartial<Config>) => {
  // Server-side only
  if (typeof window === 'undefined') {
    const configPath = process.env.CONFIG_PATH || path.join(process.cwd(), configFileName);
    const currentConfig = loadConfig();
    const mergedConfig = mergeConfigs(currentConfig, config);
    fs.writeFileSync(
      configPath,
      toml.stringify(mergedConfig),
    );
  }
};
