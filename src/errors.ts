/**
 * Failed to validate the manifest for an AI plugin
 */
export class ManifestValidationError extends Error {
  constructor(message: string, readonly cause?: Error) {
    super(message);
  }
}

/**
 * Failed to fetch the manifest for an AI plugin
 */
export class ManifestFetchError extends Error {
  constructor(message: string, readonly response: Response) {
    super(message);
  }
}

export class PluginAuthenticationError extends Error {}

export class PluginAPIError extends Error {}

export class UnreachableError extends Error {
  constructor(val: never) {
    super(`Unreachable codepath reached, received value ${val}`);
  }
}
