import type { Manifest } from "./manifest_schema";

/**
 * A class that represents an AI plugin, providing capabilities to interact with the plugin's API
 */
export class AIPlugin {
  readonly schemaVersion: string;
  readonly nameForModel: string;
  readonly nameForHuman: string;
  readonly descriptionForModel: string;
  readonly descriptionForHuman: string;
  readonly logoUrl: string;
  readonly contactEmail: string;
  readonly legalInfoUrl: string;

  constructor(readonly manifest: Manifest) {
    this.schemaVersion = manifest.schema_version;
    this.nameForModel = manifest.name_for_model;
    this.nameForHuman = manifest.name_for_human;
    this.descriptionForModel = manifest.description_for_model;
    this.descriptionForHuman = manifest.description_for_human;
    this.logoUrl = manifest.logo_url;
    this.contactEmail = manifest.contact_email;
    this.legalInfoUrl = manifest.legal_info_url;
  }
}
