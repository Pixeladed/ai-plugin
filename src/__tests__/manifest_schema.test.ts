import { aPluginManifest } from "../fixtures";
import { ManifestSchema } from "../manifest_schema";

describe("ManifestSchema", () => {
  it("correctly parses example plugin manifest", () => {
    // example from https://platform.openai.com/docs/plugins/getting-started/plugin-manifest
    const raw = aPluginManifest();
    const res = ManifestSchema.safeParse(raw);
    expect(res.success).toBe(true);
  });
});
