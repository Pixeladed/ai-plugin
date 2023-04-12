# ai-plugin

A Typescript library of tools to help you interact with AI plugins according to Open AI's specifications

---

## Example use case

For an example of how to use a publicly available AI plugin, see [src/scripts/inspect](src/scripts/inspect.ts). Alternativly, you could also run `yarn tool src/script/inspect [URL]` to inspect an AI plugin.

```bash
yarn tool src/scripts/inspect https://www.klarna.com
```

## Notable classes

### `PluginExplorer`

This class provides method for inspecting and loading AI plugin manifests (definitions) from a URL as well as validating the information in a manifest.

### `OpenApiExplorer`

This class provides methods for fetching and validating Open API definitions that allows you to interact with an AI plugin

### `ManifestSchema`

A zod schema that adhere to Open AI's specification for what an AI plugin manifest should contain.

### `AIPlugin`

Represents an AI plugin, its metadata and provide methods for interacting with its API endpoints given a manifest.
