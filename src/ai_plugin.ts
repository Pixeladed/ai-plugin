import type { AuthProvider, TokenProvider } from "./auth_provider";
import type { Manifest } from "./manifest_schema";
import { OpenAPIExplorer } from "./openapi_explorer";
import { OpenAPIProvider } from "./openapi_provider";
import type { Method } from "./openapi_provider";

/**
 * A class that represents an AI plugin, providing capabilities to interact with the plugin's API
 */
export class AIPlugin {
  readonly schemaVersion: string;
  readonly nameForModel: string;
  readonly nameForHuman: string;
  readonly descriptionForModel: string;
  readonly descriptionForHuman: string;
  readonly logoUrl: string;
  readonly contactEmail: string;
  readonly legalInfoUrl: string;

  private openApiProviderPromise: Promise<OpenAPIProvider> | undefined;

  constructor(
    readonly manifest: Manifest,
    private readonly request: typeof fetch,
    private readonly authProvider: AuthProvider,
    private readonly openApiExplorer: OpenAPIExplorer
  ) {
    this.schemaVersion = manifest.schema_version;
    this.nameForModel = manifest.name_for_model;
    this.nameForHuman = manifest.name_for_human;
    this.descriptionForModel = manifest.description_for_model;
    this.descriptionForHuman = manifest.description_for_human;
    this.logoUrl = manifest.logo_url;
    this.contactEmail = manifest.contact_email;
    this.legalInfoUrl = manifest.legal_info_url;
    this.initOpenApiProvider();
  }

  async interact(
    endpoint: string,
    method: Method,
    parameters: unknown,
    tokenProvider: TokenProvider
  ) {
    const provider = await this.getOpenApiProvider();
    const res = await provider.interact(
      endpoint,
      method,
      parameters,
      tokenProvider
    );
    return res;
  }

  private async initOpenApiProvider() {
    const promise = new Promise<OpenAPIProvider>(async (resolve) => {
      const spec = await this.openApiExplorer.inspect(this.manifest.api.url);
      const provider = new OpenAPIProvider(
        spec,
        this.request,
        this.authProvider
      );
      resolve(provider);
    });
    this.openApiProviderPromise = promise;
    return promise;
  }

  private async getOpenApiProvider() {
    if (this.openApiProviderPromise) {
      return await this.openApiProviderPromise;
    }
    return await this.initOpenApiProvider();
  }
}
