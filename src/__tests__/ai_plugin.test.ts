import { AIPlugin } from "../ai_plugin";
import type { Manifest } from "../manifest_schema";

describe("AIPlugin", () => {
  let manifest: Manifest;
  let plugin: AIPlugin;

  beforeEach(() => {
    manifest = {
      schema_version: "v1",
      name_for_human: "TODO Plugin",
      name_for_model: "todo",
      description_for_human:
        "Plugin for managing a TODO list. You can add, remove and view your TODOs.",
      description_for_model:
        "Plugin for managing a TODO list. You can add, remove and view your TODOs.",
      auth: {
        type: "none",
      },
      api: {
        type: "openapi",
        url: "http://localhost:3333/openapi.yaml",
        is_user_authenticated: false,
      },
      logo_url: "http://localhost:3333/logo.png",
      contact_email: "support@example.com",
      legal_info_url: "http://www.example.com/legal",
    };

    plugin = new AIPlugin(manifest);
  });

  it("correctly maps the plugin's information", () => {
    expect(plugin.schemaVersion).toEqual(manifest.schema_version);
    expect(plugin.nameForHuman).toEqual(manifest.name_for_human);
    expect(plugin.nameForModel).toEqual(manifest.name_for_model);
    expect(plugin.descriptionForHuman).toEqual(manifest.description_for_human);
    expect(plugin.descriptionForModel).toEqual(manifest.description_for_model);
    expect(plugin.logoUrl).toEqual(manifest.logo_url);
    expect(plugin.contactEmail).toEqual(manifest.contact_email);
    expect(plugin.legalInfoUrl).toEqual(manifest.legal_info_url);
  });
});
