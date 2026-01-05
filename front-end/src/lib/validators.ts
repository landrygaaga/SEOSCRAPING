import { z } from "zod";

/**
 * Validation basique (frontend) :
 * - URL obligatoire
 * - format URL valide
 */
export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL obligatoire")
  .url("URL invalide (ex: https://example.com)");

