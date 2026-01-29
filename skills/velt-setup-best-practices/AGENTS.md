# Velt Setup Best Practices
|v1.0.0|Velt|January 2026
|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Velt tasks.
|root: ./rules

## 1. Installation — CRITICAL
|react/installation:{install-react-packages.md}
|non-react/installation:{install-vanilla-packages.md}

## 2. Provider Wiring — CRITICAL
|react/provider-wiring:{provider-client-directive.md,provider-velt-provider-setup.md}
|non-react/provider-wiring:{provider-framework-init.md}

## 3. Identity — CRITICAL
|react/identity:{identity-auth-provider.md}
|shared/identity:{identity-jwt-generation.md,identity-organization-id.md,identity-user-object-shape.md}

## 4. Document Identity — CRITICAL
|shared/document-identity:{document-metadata.md,document-id-generation.md,document-set-document.md}

## 5. Config — HIGH
|shared/config:{config-api-key.md,config-auth-token-security.md,config-domain-safelist.md}

## 6. Project Structure — MEDIUM
|react/project-structure:{structure-folder-organization.md,structure-separation-of-concerns.md}

## 7. Routing Surfaces — MEDIUM
|react/routing-surfaces:{surface-collaboration-wrapper.md,surface-component-placement.md}

## 8. Debugging & Testing — LOW-MEDIUM
|shared/debugging-testing:{debug-common-issues.md,debug-setup-verification.md}
