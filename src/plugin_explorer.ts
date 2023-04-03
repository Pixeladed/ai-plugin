import type { Manifest } from "./manifest_schema";
import { ManifestSchema } from "./manifest_schema";
import { URL } from "url";
import { RedirectValidator } from "./redirect_validator";
import { ManifestFetchError, ManifestValidationError } from "./errors";

/**
 * This class provides methods for finding and parsing AI plugins given an origin.
 * It does not provide capabilities to interact with the plugin but rather to discover if a plugin exist for a website
 * as well as parsing and validation capabilities
 */
export class PluginExplorer {
  constructor(
    /** Path to manifest JSON file, must start with a leading '/' */
    private readonly manifestPath: string = "/.well-known/ai-plugin.json",
    /** Fetch API or fetch polyfill to make requests */
    private readonly request: typeof fetch,
    private readonly redirectValidator: RedirectValidator
  ) {}

  /**
   * Given a URL, provide information on the AI plugin if one is available.
   */
  async scan(url: string): Promise<Manifest | undefined> {
    const manifestUrl = this.resolveManifestUrl(url);
    const res = await this.request(manifestUrl);
    this.redirectValidator.maybeValidateRedirect(manifestUrl, res.url);

    if (!res.ok) {
      if (res.status === 404) {
        return undefined;
      }

      throw new ManifestFetchError(
        `Request failed with status ${res.status}`,
        res
      );
    }

    try {
      const data = await res.json();
      const manifest = await ManifestSchema.parseAsync(data);
      return manifest;
    } catch (error) {
      if (error instanceof Error) {
        throw new ManifestValidationError(error.message, error);
      }
      throw error;
    }
  }

  private resolveManifestUrl(url: string) {
    const parsed = new URL(url);

    if (parsed.pathname === this.manifestPath) {
      return url;
    }

    parsed.pathname = this.manifestPath;
    return parsed.toString();
  }
}
