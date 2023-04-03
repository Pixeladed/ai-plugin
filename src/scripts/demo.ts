import { ManifestSchema } from "../manifest_schema";
import { PluginExplorer } from "../plugin_explorer";
import { RedirectValidator } from "../redirect_validator";

const main = async () => {
  const explorer = new PluginExplorer(
    fetch,
    ManifestSchema,
    new RedirectValidator()
  );
  const url = "https://www.klarna.com/";

  console.log("Provided url", url);

  const manifest = await explorer.inspect(url);

  console.log("Fetched manifest", manifest);
};

main();
