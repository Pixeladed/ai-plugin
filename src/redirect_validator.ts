import { ManifestValidationError } from "./errors";

export class RedirectValidator {
  // According to https://platform.openai.com/docs/plugins/production/defining-the-plugin-s-root-domain
  validateRedirect(original: string, target: string) {
    const parsedOriginal = new URL(original);
    const parsedTarget = new URL(target);

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

  // See https://en.wikipedia.org/wiki/Second-level_domain
  // e.g. example.com -> TLD: "com", SLD: "example"
  isSameSecondDomain(url1: string, url2: string) {
    const parsedUrl1 = new URL(url1);
    const parsedUrl2 = new URL(url2);
    const url1Parts = parsedUrl1.hostname.split(".");
    const url2Parts = parsedUrl2.hostname.split(".");

    if (url1Parts.length === url2Parts.length && url1Parts.length === 1) {
      return parsedUrl1.hostname === parsedUrl2.hostname;
    }

    return url1Parts[url1Parts.length - 2] === url2Parts[url2Parts.length - 2];
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
