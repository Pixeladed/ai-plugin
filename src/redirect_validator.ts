import { ManifestValidationError } from "./errors";

export class RedirectValidator {
  // According to https://platform.openai.com/docs/plugins/production/defining-the-plugin-s-root-domain
  maybeValidateRedirect(original: string, res: Response) {
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
