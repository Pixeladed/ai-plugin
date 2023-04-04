import { URLSearchParams } from "url";
import type { ManifestAuthOauth } from "../manifest_schema";
import { PluginAuthenticationError } from "../errors";

class OAuthAuthenticator {
  private clientUrl: string;
  private scope: string;
  private authorizationUrl: string;
  private authorizationContentType: string;
  // TODO: figure out what this is for
  private verificationTokens: Record<string, string | undefined>;

  constructor(
    config: ManifestAuthOauth,
    private readonly credentials: PluginProvidedOAuthCredentials,
    private readonly redirectUri: string
  ) {
    this.clientUrl = config.client_url;
    this.scope = config.scope;
    this.authorizationUrl = config.authorization_url;
    this.authorizationContentType = config.authorization_content_type;
    this.verificationTokens = config.verification_tokens;
  }

  getAuthenticationUrl() {
    const params = new URLSearchParams();
    params.set("response_type", "code");
    params.set("client_id", this.credentials.clientId);
    params.set("scope", this.scope);
    params.set("redirect_uri", this.redirectUri);
    const redirectUrl = `${this.clientUrl}?${params.toString()}`;
    return redirectUrl;
  }

  async handleCallback(redirectedUrl: string) {
    const url = new URL(redirectedUrl);
    const authorizationCode = url.searchParams.get("code");

    if (!authorizationCode) {
      throw new PluginAuthenticationError(
        "No authorization code provided in OAuth callback"
      );
    }

    const tokenData = await this.exchangeAuthorizationCodeForTokens(
      authorizationCode
    );

    const accessToken = tokenData.access_token;

    return {
      accessToken,
      refreshToken: tokenData.refresh_token,
    };
  }

  async exchangeAuthorizationCodeForTokens(authorizationCode: string) {
    const requestBody = {
      grant_type: "authorization_code",
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      code: authorizationCode,
      redirect_uri: this.redirectUri,
    };
    const response = await fetch(this.authorizationUrl, {
      method: "POST",
      headers: {
        "Content-Type": this.authorizationContentType,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error("Token exchange failed");
    }
    return await response.json();
  }
}

/**
 * This is the set of configuration that has to be provided by the plugin's developer
 * to the consumers of the plugin for OAuth authentication.
 * See https://platform.openai.com/docs/plugins/authentication/oauth
 */
export type PluginProvidedOAuthCredentials = {
  clientId: string;
  clientSecret: string;
};
