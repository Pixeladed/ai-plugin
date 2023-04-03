import type { Manifest } from "./manifest_schema";
import { ManifestSchema } from "./manifest_schema";
import { URL } from "url";

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
    private readonly request: typeof fetch
  ) {}

  /**
   * Given a URL, provide information on the AI plugin if one is available.
   * Exploration is based on the root domain - as specified by https://platform.openai.com/docs/plugins/production/defining-the-plugin-s-root-domain
   */
  async scan(url: string): Promise<PluginExplorerScanResult> {
    const manifestUrl = this.resolveManifestUrl(url);
    let data: unknown;
    try {
      const res = await this.request(manifestUrl);
      this.maybeValidateRedirect(manifestUrl, res);
      data = await res.json();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return { ok: false, error };
    }

    let manifest: Manifest;
    try {
      manifest = await ManifestSchema.parseAsync(data);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      return { ok: false, error };
    }

    return { ok: true, manifest };
  }

  private resolveManifestUrl(url: string) {
    const parsed = new URL(url);

    if (parsed.pathname === this.manifestPath) {
      return url;
    }

    parsed.pathname = this.manifestPath;
    return parsed.toString();
  }

  // According to https://platform.openai.com/docs/plugins/production/defining-the-plugin-s-root-domain
  private maybeValidateRedirect(original: string, res: Response) {
    const parsedOriginal = new URL(original);
    const parsedTarget = new URL(res.url);

    if (this.isReidrectedToNonWwwParentDomain(parsedOriginal, parsedTarget)) {
      throw new ManifestValidationError(
        "Redirect to parent level domain is disallowed"
      );
    }

    if (this.isRedirectedToDifferentSubDomain(parsedOriginal, parsedTarget)) {
      throw new ManifestValidationError(
        "Redirect to same level subdomain is disallowed"
      );
    }

    if (this.isRedirectedToDifferentDomain(parsedOriginal, parsedTarget)) {
      throw new ManifestValidationError(
        "Redirect to another domain is disallowed"
      );
    }

    return;
  }

  private isReidrectedToNonWwwParentDomain(original: URL, target: URL) {
    return (
      original.hostname.split(".").length > target.hostname.split(".").length &&
      !original.hostname.startsWith("www")
    );
  }

  private isRedirectedToDifferentSubDomain(original: URL, target: URL) {
    const originalParts = original.hostname.split(".");
    const targetParts = target.hostname.split(".");
    return (
      originalParts.length === targetParts.length &&
      !original.hostname.startsWith("www") &&
      !this.isSameArray(originalParts, targetParts)
    );
  }

  private isRedirectedToDifferentDomain(original: URL, target: URL) {
    const originalParts = original.hostname.split(".");
    const targetParts = target.hostname.split(".");
    return (
      originalParts.length === targetParts.length &&
      !this.isSameArray(originalParts, targetParts)
    );
  }

  private isSameArray<T>(arr1: T[], arr2: T[]) {
    return arr1.every((item) => arr2.includes(item));
  }
}

export type PluginExplorerScanSuccess = {
  ok: true;
  manifest: Manifest;
};

export type PluginExplorerScanFailure = {
  ok: false;
  error: Error;
};

export type PluginExplorerScanResult =
  | PluginExplorerScanSuccess
  | PluginExplorerScanFailure;

export class ManifestValidationError extends Error {}
