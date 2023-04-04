import type { Manifest } from "./manifest_schema";

export class AuthProvider {
  constructor(private readonly manifest: Manifest) {}

  async getAuthHeaders(): Promise<Record<string, string>> {
    return {};
  }
}
