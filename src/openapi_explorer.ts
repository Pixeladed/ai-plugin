import { ManifestFetchError } from "./errors";
import type { RedirectValidator } from "./redirect_validator";
import SwaggerParser from "@apidevtools/swagger-parser";

/**
 * This class provides methods for fetching and parsing Open API specifications
 */
export class OpenAPIExplorer {
  constructor(
    // Fetch or fetch polyfill to provide the ability to make requests
    private readonly request: typeof fetch,
    private readonly redirectValidator: RedirectValidator
  ) {}

  async inspect(url: string) {
    const res = await this.request(url);
    this.redirectValidator.validateRedirect(url, res.url);

    if (!res.ok) {
      throw new ManifestFetchError(
        `Fetching Open API request failed with status ${res.status}`,
        res
      );
    }

    const data = await res.json();
    const manifest = await SwaggerParser.parse(data);
    return manifest;
  }
}
