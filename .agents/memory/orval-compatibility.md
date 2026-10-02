---
name: Orval compatibility
description: Orval version and generated-client compatibility constraints for this workspace.
---

Keep Orval code generation compatible with this workspace's React Query and Zod versions. Orval 8.22 supports the current Zod 3-generated schemas; newer Orval releases may emit Zod 4-only helpers. Configure generated React Query hooks for v5 explicitly. Keep vulnerable transitive dependencies such as js-yaml patched through a narrow pnpm override when the selected Orval version still depends on an affected range.

**Why:** A routine generator upgrade can create generated code that passes some type checks but fails at runtime when the project uses a different Zod major.

**How to apply:** When upgrading Orval, regenerate both clients, run library/API checks, start the API server, and audit the complete dependency tree before accepting the version.