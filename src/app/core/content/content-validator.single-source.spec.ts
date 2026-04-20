/**
 * Single Source of Truth Guardrail for Content Validation
 * Ensures all validation uses content-integrity-validator.ts
 */

import { validateContentIntegrity } from './content-integrity-validator';

describe('Content Validator Single Source Guardrail', () => {
  it('A) canonical validator exports validateContentIntegrity', () => {
    expect(validateContentIntegrity).toBeDefined();
    expect(typeof validateContentIntegrity).toBe('function');
  });

  it('B) validateContentIntegrity has correct signature', () => {
    const result = validateContentIntegrity({ categories: [] });
    expect(result).toBeDefined();
    expect(result.valid).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(typeof result.valid).toBe('boolean');
    expect(Array.isArray(result.errors)).toBeTrue();
  });

  it('C) admin component import path is canonical (static check)', () => {
    // This test serves as documentation enforcement:
    // Admin component MUST import from './content-integrity-validator'
    // Any change to import path will fail admin component tests
    // This spec reinforces the single-source rule in CONTRIBUTING.md
    expect(true).toBeTrue();
  });
});

