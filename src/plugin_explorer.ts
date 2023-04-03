import type { Manifest } from "./manifest_schema";
import { URL } from "url";

/**
 * This class provides methods for finding and parsing AI plugins given an origin.
 * It does not provide capabilities to interact with the plugin but rather to discover if a plugin exist for a website
 * as well as parsing and validation capabilities
 */
export class PluginExplorer {
  constructor(
    /** Path to manifest JSON file, must start with a leading '/' */
    private readonly manifestPath: string = "/.well-known/ai-plugin.json"
  ) {}

  /**
   * Given a URL, provide information on the AI plugin if one is available.
   * Exploration is based on the root domain - as specified by https://platform.openai.com/docs/plugins/production/defining-the-plugin-s-root-domain
   */
  scan(url: string): Promise<PluginExplorerScanResult> {
    const manifestUrl = this.resolveManifestUrl(url);
    throw new Error();
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
