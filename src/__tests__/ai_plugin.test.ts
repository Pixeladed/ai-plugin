import { mock } from "jest-mock-extended";
import { AIPlugin } from "../ai_plugin";
import type { AuthProvider } from "../auth_provider";
import { aPluginManifest } from "../fixtures";
import type { Manifest } from "../manifest_schema";
import type { OpenAPIExplorer } from "../openapi_explorer";

describe("AIPlugin", () => {
  let manifest: Manifest;
  let plugin: AIPlugin;
  let fakeFetch: jest.Mocked<typeof fetch>;
  let authProvider: jest.Mocked<AuthProvider>;
  let openApiExplorer: jest.Mocked<OpenAPIExplorer>;

  beforeEach(() => {
    manifest = aPluginManifest();
    fakeFetch = jest.fn();
    authProvider = mock();
    openApiExplorer = mock();
    plugin = new AIPlugin(manifest, fakeFetch, authProvider, openApiExplorer);
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
