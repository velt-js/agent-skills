---
title: Use Custom Encryption Provider for Sensitive Data
impact: MEDIUM
impactDescription: Protects collaborative data at rest
tags: encryption, security, privacy, custom
---

## Use Custom Encryption Provider for Sensitive Data

Encrypt CRDT data before it's stored in Velt by registering a custom encryption provider. For CRDT, input data is `Uint8Array | number[]`.

**Correct (React - encryption provider):**

```tsx
import { VeltProvider } from '@veltdev/react';

async function encryptData(config: EncryptConfig<number[]>): Promise<string> {
  const encryptedData = await yourEncryptDataMethod(config.data);
  return encryptedData;
}

async function decryptData(config: DecryptConfig<string>): Promise<number[]> {
  const decryptedData = await yourDecryptDataMethod(config.data);
  return decryptedData;
}

const encryptionProvider: VeltEncryptionProvider<number[], string> = {
  encrypt: encryptData,
  decrypt: decryptData,
};

function App() {
  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      encryptionProvider={encryptionProvider}
    >
      <CollaborativeEditor />
    </VeltProvider>
  );
}
```

**Correct (Vanilla JS):**

```ts
import { initVelt } from '@veltdev/client';

const encryptionProvider = {
  encrypt: async (config) => {
    return await yourEncryptMethod(config.data);
  },
  decrypt: async (config) => {
    return await yourDecryptMethod(config.data);
  },
};

const client = await initVelt('YOUR_API_KEY');
client.setEncryptionProvider(encryptionProvider);
```

**Encryption Provider Interface:**

```ts
interface VeltEncryptionProvider<TInput, TOutput> {
  encrypt: (config: EncryptConfig<TInput>) => Promise<TOutput>;
  decrypt: (config: DecryptConfig<TOutput>) => Promise<TInput>;
}

interface EncryptConfig<T> {
  data: T;
  documentId: string;
  // ... other context
}
```

**Verification:**
- [ ] Encryption provider set before CRDT operations
- [ ] Data stored in Velt is encrypted
- [ ] Decrypt works correctly for all clients
- [ ] All clients use the same encryption keys/method

**Source Pointer:** `/docs/realtime-collaboration/crdt/setup/core.mdx` (## APIs > ### Custom Encryption)
