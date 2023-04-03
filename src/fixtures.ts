import type { Manifest } from "./manifest_schema";

export const aPluginManifest = (overrides?: Partial<Manifest>): Manifest => {
  return {
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
      has_user_authentication: false,
    },
    logo_url: "http://localhost:3333/logo.png",
    contact_email: "support@example.com",
    legal_info_url: "http://www.example.com/legal",
    ...overrides,
  };
};
