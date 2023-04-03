import { URL } from "url";
import { aPluginManifest } from "../fixtures";
import { PluginExplorer } from "../plugin_explorer";
import type { RedirectValidator } from "../redirect_validator";
import { mock } from "jest-mock-extended";
import { ManifestFetchError, ManifestValidationError } from "../errors";
import type { Schema } from "zod";
import type { Manifest } from "../manifest_schema";

describe("PluginExplorer", () => {
  let fakeFetch: jest.MockedFunction<typeof fetch>;
  let schema: jest.Mocked<Schema<Manifest>>;
  let redirectValidator: jest.Mocked<RedirectValidator>;
  let explorer: PluginExplorer;

  beforeEach(() => {
    fakeFetch = jest.fn();
    schema = mock();
    redirectValidator = mock();
    explorer = new PluginExplorer(fakeFetch, schema, redirectValidator);
  });

  describe("inspect", () => {
    it("returns a plugin's manifest", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockResolvedValue(manifest);
      redirectValidator.isSameSecondDomain.mockReturnValue(true);
      const result = await explorer.inspect(
        `https://${rootDomain.host}/.well-known/ai-plugin.json`
      );
      expect(result).toEqual(manifest);
    });

    it("automatically append well known manifest path", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockResolvedValue(manifest);
      redirectValidator.isSameSecondDomain.mockReturnValue(true);
      await explorer.inspect(`https://${rootDomain.host}/`);
      expect(fakeFetch).toHaveBeenCalledWith(
        `https://${rootDomain.host}/.well-known/ai-plugin.json`
      );
    });

    it("returns undefined if there is no manifest", async () => {
      fakeFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);
      const result = await explorer.inspect("https://example.com/");
      expect(result).toBeUndefined();
    });

    it("throws if fetch failed", async () => {
      fakeFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);
      const op = () => explorer.inspect("https://example.com/");
      await expect(op).rejects.toThrowError(ManifestFetchError);
    });

    it("throws if schema parsing failed", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      const error = new ManifestValidationError("schema parsing error");
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockRejectedValue(error);
      redirectValidator.isSameSecondDomain.mockReturnValue(true);
      const op = () => explorer.inspect(`https://${rootDomain.host}/`);
      await expect(op).rejects.toThrowError(error);
    });

    it("throws if unknown error is thrown", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      const error = new Error("unknown error");
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockRejectedValue(error);
      redirectValidator.isSameSecondDomain.mockReturnValue(true);
      const op = () => explorer.inspect(`https://${rootDomain.host}/`);
      await expect(op).rejects.toThrowError(ManifestValidationError);
    });

    it("throws if API url is invalid", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockResolvedValue(manifest);
      redirectValidator.validateRedirect.mockImplementation(
        (origin, target) => {
          if ([origin, target].includes(manifest.api.url)) {
            throw new Error("invalid api url");
          }
        }
      );
      const op = () =>
        explorer.inspect(
          `https://${rootDomain.host}/.well-known/ai-plugin.json`
        );
      await expect(op).rejects.toThrow(ManifestValidationError);
    });

    it("throws if legal info url is invalid", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockResolvedValue(manifest);
      redirectValidator.isSameSecondDomain.mockImplementation((url1, url2) => {
        if ([url1, url2].includes(manifest.legal_info_url)) {
          return false;
        }
        return true;
      });
      const op = () =>
        explorer.inspect(
          `https://${rootDomain.host}/.well-known/ai-plugin.json`
        );
      await expect(op).rejects.toThrow(ManifestValidationError);
    });

    it("throws if contact email domain is invalid", async () => {
      const manifest = aPluginManifest();
      const rootDomain = new URL(manifest.api.url);
      fakeFetch.mockResolvedValue({
        ok: true,
        json: async () => manifest,
      } as Response);
      schema.parseAsync.mockResolvedValue(manifest);
      redirectValidator.isSameSecondDomain.mockImplementation((url1, url2) => {
        if ([url1, url2].includes(manifest.contact_email.split("@")[1])) {
          return false;
        }
        return true;
      });
      const op = () =>
        explorer.inspect(
          `https://${rootDomain.host}/.well-known/ai-plugin.json`
        );
      await expect(op).rejects.toThrow(ManifestValidationError);
    });
  });
});
