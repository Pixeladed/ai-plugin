import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { PluginAPIError, UnreachableError } from "./errors";
import type { AuthProvider, TokenProvider } from "./auth_provider";
import type { OpenApiSpec } from "./openapi_explorer";

/**
 * Provides the ability to interact with an API given an Open API specification
 */
export class OpenAPIProvider {
  constructor(
    readonly spec: OpenApiSpec,
    // Fetch or fetch polyfill for making requests
    private readonly request: typeof fetch,
    private readonly authProvider: AuthProvider
  ) {}

  async interact(
    endpoint: string,
    method: Method,
    parameters: unknown,
    tokenProvider: TokenProvider
  ) {
    const endpointSpec = this.getEndpointSpec(endpoint, method);

    if (!endpointSpec) {
      throw new PluginAPIError(
        `Plugin does not specify ${method} method for path ${endpoint}`
      );
    }

    const baseUrl = this.getBaseUrl(this.spec);

    if (!baseUrl) {
      throw new PluginAPIError(
        "Unable to parse Open API specification base url"
      );
    }

    const authHeaders = await this.authProvider.getAuthHeaders(tokenProvider);
    const { url, requestBody } = this.getRequestInfo(
      baseUrl,
      method,
      endpoint,
      parameters
    );

    return this.request(url, {
      method,
      ...requestBody,

      headers: { ...authHeaders },
    });
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

  private getBaseUrl(spec: OpenApiSpec) {
    if (spec.openapi.startsWith("2")) {
      const doc = spec as OpenAPIV2.Document;
      return doc.host;
    }

    if (spec.openapi.startsWith("3.0")) {
      const doc = spec as OpenAPIV3.Document;
      return doc.servers?.[0].url;
    }

    if (spec.openapi.startsWith("3.1")) {
      const doc = spec as OpenAPIV3_1.Document;
      return doc.servers?.[0].url;
    }

    throw new PluginAPIError(
      `Unsupported Open API version ${this.spec.openapi}`
    );
  }

  private getRequestInfo(
    baseUrl: string,
    method: Method,
    endpoint: string,
    parameters: unknown
  ) {
    const url = this.getRequestUrl(baseUrl, method, endpoint, parameters);
    const requestBody = this.getRequestBody(method, parameters);
    return { url, requestBody };
  }

  private getRequestUrl(
    baseUrl: string,
    method: Method,
    endpoint: string,
    parameters: unknown
  ) {
    const url = new URL(baseUrl);
    url.pathname = endpoint;
    switch (method) {
      case "GET":
        url.search = new URLSearchParams(
          parameters as Record<any, any>
        ).toString();
        break;
      case "HEAD":
      case "OPTIONS":
      case "DELETE":
      case "PATCH":
      case "POST":
      case "PUT":
        break;
      default:
        throw new UnreachableError(method);
    }

    return url.toString();
  }

  private getRequestBody(method: Method, parameters: unknown) {
    switch (method) {
      case "GET":
        return {};
      case "HEAD":
      case "OPTIONS":
        return {};
      case "DELETE":
      case "PATCH":
      case "POST":
      case "PUT":
        return { body: JSON.stringify(parameters) };
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
