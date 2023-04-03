import { AIPlugin } from "../ai_plugin";
import { ManifestSchema } from "../manifest_schema";
import { PluginExplorer } from "../plugin_explorer";
import { RedirectValidator } from "../redirect_validator";

const main = async () => {
  const url = process.argv[2];
  if (!url) {
    throw new Error("A url must be provided");
  }

  const explorer = new PluginExplorer(
    fetch,
    ManifestSchema,
    new RedirectValidator()
  );

  console.log("Provided url", url);

  const manifest = await explorer.inspect(url);
  console.log("Fetched manifest", manifest?.name_for_human);

  if (!manifest) {
    return;
  }

  const plugin = new AIPlugin(manifest);
  console.log("Plugin", plugin);
};

main();
