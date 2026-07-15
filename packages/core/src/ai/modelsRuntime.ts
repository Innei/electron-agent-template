import type { AuthContext, CredentialStore, MutableModels } from "@earendil-works/pi-ai";
import { openaiCodexOAuthProvider } from "@earendil-works/pi-ai/oauth";
import { builtinModels } from "@earendil-works/pi-ai/providers/all";

const CODEX_PROVIDER = "openai-codex";

export const SINGLE_KEY_PROVIDERS: ReadonlySet<string> = new Set([
  "anthropic",
  "openai",
  "deepseek",
  "google",
  "xai",
  "groq",
  "mistral",
  "openrouter",
  "together",
  "fireworks",
  "cerebras",
  "moonshotai",
  "kimi-coding",
  "minimax",
  "zai",
  "nvidia",
  "opencode",
]);

const isolatedAuthContext: AuthContext = {
  env: async () => undefined,
  fileExists: async () => false,
};

let singleton: MutableModels | null = null;

function installStaticCodexOAuth(models: MutableModels): void {
  const provider = models.getProvider(CODEX_PROVIDER);
  const oauth = provider?.auth.oauth;
  if (!provider || !oauth) {
    throw new Error("modelsRuntime: openai-codex OAuth provider is unavailable");
  }

  // pi-ai's built-in providers dynamically import their OAuth implementations at
  // runtime; the desktop main process is bundled into a single artifact with no such
  // file. The app only reuses the codex CLI login state, so the credential conversion
  // and refresh logic needed for actual requests is statically bound here.
  models.setProvider({
    ...provider,
    auth: {
      ...provider.auth,
      oauth: {
        name: oauth.name,
        async login() {
          throw new Error("OpenAI Codex login is managed by the codex CLI; sign in from a terminal first");
        },
        async refresh(credential) {
          return {
            ...(await openaiCodexOAuthProvider.refreshToken(credential)),
            type: "oauth" as const,
          };
        },
        async toAuth(credential) {
          return { apiKey: openaiCodexOAuthProvider.getApiKey(credential) };
        },
      },
    },
  });
}

export function initModelsRuntime(credentials: CredentialStore): MutableModels {
  if (singleton) {
    throw new Error("modelsRuntime: already initialized; call setModelsRuntimeForTests(null) first in tests");
  }
  const models = builtinModels({ credentials, authContext: isolatedAuthContext });
  installStaticCodexOAuth(models);
  singleton = models;
  return singleton;
}

export function getModelsRuntime(): MutableModels {
  if (!singleton) {
    throw new Error("modelsRuntime: not initialized; call initModelsRuntime at startup before use");
  }
  return singleton;
}

export function setModelsRuntimeForTests(models: MutableModels | null): void {
  singleton = models;
}
