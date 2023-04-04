import type { OpenAPI } from "openapi-types";
import { PluginAPIError, UnreachableError } from "./errors";
import type { Manifest } from "./manifest_schema";

/**
 * Provides the ability to interact with an API given an Open API specification
 */
export class OpenAPIProvider {
  constructor(
    private readonly manifest: Manifest,
    private readonly spec: OpenAPI.Document,
    // Fetch or fetch polyfill for making requests
    private readonly request: typeof fetch
  ) {}

  async interact(endpoint: string, method: Method, parameters: unknown) {
    const endpointSpec = this.getEndpointSpec(endpoint, method);

    if (!endpointSpec) {
      throw new PluginAPIError(
        `Plugin does not specify ${method} method for path ${endpoint}`
      );
    }

    const url = new URL(this.manifest.api.url);
    url.pathname = endpoint;
    const res = await this.request(url, {
      method,
      body: JSON.stringify(parameters),
    });
    return res;
  }

  private getEndpointSpec(endpoint: string, method: Method) {
    if (!this.spec.paths) {
      throw new PluginAPIError("Plugin does not specify any Open API paths");
    }

    const endpointSpec = this.spec.paths[endpoint];
    if (!endpointSpec) {
      throw new PluginAPIError(
        `Plugin does not specify Open API path: "${endpoint}"`
      );
    }

    switch (method) {
      case "GET":
        return endpointSpec.get;
      case "POST":
        return endpointSpec.post;
      case "DELETE":
        return endpointSpec.delete;
      case "HEAD":
        return endpointSpec.head;
      case "OPTIONS":
        return endpointSpec.options;
      case "PUT":
        return endpointSpec.put;
      case "PATCH":
        return endpointSpec.patch;
      default:
        throw new UnreachableError(method);
    }
  }
}

export type Method =
  | "GET"
  | "POST"
  | "PATCH"
  | "DELETE"
  | "PUT"
  | "HEAD"
  | "OPTIONS";
