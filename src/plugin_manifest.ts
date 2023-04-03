import { z } from "zod";

// Extracted from https://platform.openai.com/docs/plugins/getting-started/plugin-manifest

const HttpAuthorizationTypeSchema = z.enum(["bearer", "basic"]);

const ManifestAuthTypeSchema = z.enum([
  "none",
  "service_http",
  "user_http",
  "oauth",
]);

const BaseManifestAuthSchema = z.object({
  type: ManifestAuthTypeSchema,
  instructions: z.optional(z.string()),
});

const ManifestNoAuthAuthSchema = BaseManifestAuthSchema.extend({
  type: z.literal(ManifestAuthTypeSchema.enum.none),
}).describe("No authentication");

const ManifestServiceHttpAuthSchema = BaseManifestAuthSchema.extend({
  type: z.literal(ManifestAuthTypeSchema.enum.service_http),
  authorization_type: HttpAuthorizationTypeSchema,
  verification_token: z.record(z.string(), z.string()),
}).describe("App-level API keys");

const ManifestUserHttpAuthSchema = BaseManifestAuthSchema.extend({
  type: z.literal(ManifestAuthTypeSchema.enum.user_http),
  authorization_type: HttpAuthorizationTypeSchema,
}).describe("User-level HTTP authentication");

const ManifestOAuthAuthSchema = BaseManifestAuthSchema.extend({
  type: z.literal(ManifestAuthTypeSchema.enum.oauth),
  client_url: z
    .string()
    .describe(
      "OAuth URL where a user is directed to for the OAuth authentication flow to begin"
    ),
  scope: z
    .string()
    .describe(
      "OAuth scopes required to accomplish operations on the user's behalf."
    ),
  authorization_url: z
    .string()
    .describe("Endpoint used to exchange OAuth code with access token"),
  authorization_content_type: z
    .string()
    .describe(
      "When exchanging OAuth code with access token, the expected header 'content-type'. For example: 'content-type: application/json'"
    ),
  verification_tokens: z
    .record(z.string(), z.string())
    .describe(
      "When registering the OAuth client ID and secrets, the plugin service will surface a unique token"
    ),
}).describe("OAuth authentication");

const ApiSchema = z
  .object({
    type: z.literal("openapi"),
    url: z.string(),
    is_user_authenticated: z.boolean(),
  })
  .describe("API specification");

export const PluginManifestSchema = z
  .object({
    schema_version: z.string().describe("Manifest schema version"),
    name_for_model: z
      .string()
      .describe("Name the model will used to target the plugin"),
    name_for_human: z
      .string()
      .describe("Human-readable name, such as the full company name"),
    description_for_model: z
      .string()
      .describe(
        "Description better tailored to the model, such as token context length considerations or keyword usage for improved plugin prompting"
      ),
    description_for_human: z
      .string()
      .describe("Human-readable description of the plugin"),
    auth: z
      .discriminatedUnion("type", [
        ManifestServiceHttpAuthSchema,
        ManifestUserHttpAuthSchema,
        ManifestOAuthAuthSchema,
        ManifestNoAuthAuthSchema,
      ])
      .describe("Authentication schema"),
    api: ApiSchema,
    logo_url: z.string().describe("URL used to fetch the plugin's logo"),
    contact_email: z
      .string()
      .describe(
        "Email contact for safety/moderation reachout, support, and deactivation"
      ),
    legal_info_url: z
      .string()
      .describe("Redirect URL for users to view plugin information"),
  })
  .describe("A manifest object describing the AI plugin");
