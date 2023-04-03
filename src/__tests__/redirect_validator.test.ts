import { ManifestValidationError } from "../errors";
import { RedirectValidator } from "../redirect_validator";

describe("RedirectValidator", () => {
  let validator: RedirectValidator;

  beforeEach(() => {
    validator = new RedirectValidator();
  });

  describe("validateRedirect", () => {
    it("allows redirect to the same domain", () => {
      const op = () =>
        validator.validateRedirect(
          "https://example.com/.well-known/ai-plugin.json",
          "https://example.com/.well-known/ai-plugin.json"
        );
      expect(op).not.toThrow();
    });

    it("allows redirect from www to root domain", () => {
      const op = () =>
        validator.validateRedirect(
          "https://www.example.com/.well-known/ai-plugin.json",
          "https://example.com/.well-known/ai-plugin.json"
        );
      expect(op).not.toThrow();
    });

    it("allows redirect to a sub domain", () => {
      const op = () =>
        validator.validateRedirect(
          "https://foo.example.com/.well-known/ai-plugin.json",
          "https://bar.foo.example.com/.well-known/ai-plugin.json"
        );
      expect(op).not.toThrow();
    });

    it("allows redirect to a sub domain with extended path", () => {
      const op = () =>
        validator.validateRedirect(
          "https://foo.example.com/.well-known/ai-plugin.json",
          "https://bar.foo.example.com/baz/.well-known/ai-plugin.json"
        );
      expect(op).not.toThrow();
    });

    it("disallows redirect to parent level domain", () => {
      const op = () =>
        validator.validateRedirect(
          "https://foo.example.com/.well-known/ai-plugin.json",
          "https://example.com/baz/.well-known/ai-plugin.json"
        );
      expect(op).toThrowError(ManifestValidationError);
    });

    it("disallows redirect to same level sub domain", () => {
      const op = () =>
        validator.validateRedirect(
          "https://foo.example.com/.well-known/ai-plugin.json",
          "https://bar.example.com/baz/.well-known/ai-plugin.json"
        );
      expect(op).toThrowError(ManifestValidationError);
    });

    it("disallows redirect to another domain", () => {
      const op = () =>
        validator.validateRedirect(
          "https://example.com/.well-known/ai-plugin.json",
          "https://example2.com/.well-known/ai-plugin.json"
        );
      expect(op).toThrowError(ManifestValidationError);
    });
  });

  describe("isSameSecondDomain", () => {
    it("allows 2 urls with the same second level domain", () => {
      expect(
        validator.isSameSecondDomain(
          "https://example.com",
          "https://example.org"
        )
      ).toBe(true);
    });

    it("disallows 2 urls with different second level domain", () => {
      expect(
        validator.isSameSecondDomain(
          "https://example.com",
          "https://example2.org"
        )
      ).toBe(false);
    });
  });
});
