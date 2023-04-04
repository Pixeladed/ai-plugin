import { PluginAPIError, UnreachableError } from "./errors";
import type { Manifest, HttpAuthorizationType } from "./manifest_schema";

export class AuthProvider {
  constructor(
    private readonly manifest: Manifest,
    /**
     * This is the name of the service to look up when looking
     * at `auth.verification_tokens` in service_http and user_http authentication types
     */
    private readonly serviceName: string
  ) {}

  async getAuthHeaders(
    tokenProvider: TokenProvider
  ): Promise<Record<string, string>> {
    const auth = this.manifest.auth;
    switch (auth.type) {
      case "none":
        return {};
      case "oauth":
        return {
          Authorization: this.getAuthHeader(
            "bearer",
            await tokenProvider.getOAuthToken()
          ),
        };
      case "service_http":
        return {
          Authorization: this.getAuthHeader(
            auth.authorization_type,
            this.getTokenForService(auth.verification_token)
          ),
        };
      case "user_http":
        return {
          Authorization: this.getAuthHeader(
            auth.authorization_type,
            await tokenProvider.getUserToken()
          ),
        };
      default:
        throw new UnreachableError(auth);
    }
  }

  private getAuthHeader(type: HttpAuthorizationType, token: string) {
    switch (type) {
      case "basic":
        return `Basic ${token}`;
      case "bearer":
        return `Bearer ${token}`;
      default:
        throw new UnreachableError(type);
    }
  }

  private getTokenForService(tokens: Record<string, string | undefined>) {
    const token = tokens[this.serviceName];
    if (!token) {
      throw new PluginAPIError(
        `No API token provided for service ${this.serviceName}`
      );
    }

    return token;
  }
}

export interface TokenProvider {
  getOAuthToken(): Promise<string>;
  getUserToken(): Promise<string>;
}
