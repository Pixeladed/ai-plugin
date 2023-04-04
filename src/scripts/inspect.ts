import { AIPlugin } from "../ai_plugin";
import { AuthProvider } from "../auth_provider";
import type { TokenProvider } from "../auth_provider";
import { ManifestSchema } from "../manifest_schema";
import { OpenAPIExplorer } from "../openapi_explorer";
import type { Method } from "../openapi_provider";
import { PluginExplorer } from "../plugin_explorer";
import { RedirectValidator } from "../redirect_validator";

const main = async () => {
  const [, , url, method, endpoint, parameters, ...others] = process.argv;
  if (!url) {
    throw new Error("A url must be provided");
  }

  const redirectValidator = new RedirectValidator();
  const explorer = new PluginExplorer(fetch, ManifestSchema, redirectValidator);

  console.log("Provided url", url);

  const manifest = await explorer.inspect(url);
  console.log("Fetched manifest", manifest?.name_for_human);

  if (!manifest) {
    return;
  }

  const authProvider = new AuthProvider(manifest, "openai");
  const openApiExplorer = new OpenAPIExplorer(fetch, redirectValidator);

  const plugin = new AIPlugin(manifest, fetch, authProvider, openApiExplorer);
  console.log("Plugin", plugin);

  if (endpoint && method) {
    // TODO: interact with authenticated plugins
    const tokenProvider: TokenProvider = {
      getOAuthToken: async () => "",
      getUserToken: async () => "",
    };
    const res = await plugin.interact(
      endpoint,
      method as Method,
      parameters,
      tokenProvider
    );
    console.log("Interacted with", method, endpoint, parameters);
    console.log("Received", await res.text());
  }
};

main();
