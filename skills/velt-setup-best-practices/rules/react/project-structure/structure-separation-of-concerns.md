---
title: Separate App Auth from Velt Integration
impact: MEDIUM
impactDescription: Clean separation enables independent testing and maintenance
tags: separation, concerns, auth, architecture, maintainability
---

## Separate App Auth from Velt Integration

Keep your application's authentication system separate from Velt integration. Your app owns user authentication; Velt receives user data from your auth system.

**Incorrect (tightly coupled):**

```jsx
// Everything mixed together - hard to maintain
"use client";
import { VeltProvider, useIdentify } from "@veltdev/react";
import { useAuth0 } from "@auth0/auth0-react";

export default function App() {
  const { user, isAuthenticated } = useAuth0();

  // Velt identity directly coupled to Auth0
  useIdentify(isAuthenticated ? {
    userId: user.sub,
    organizationId: user.org_id,
    name: user.name,
    email: user.email,
  } : null);

  return (
    <VeltProvider apiKey="KEY">
      {/* Everything else */}
    </VeltProvider>
  );
}
```

**Correct (separated layers):**

**Layer 1: App Authentication (app/userAuth/)**

```jsx
// app/userAuth/AppUserContext.tsx - Your app's user management
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";  // Or Firebase, NextAuth, etc.

// Your app's user type
interface AppUser {
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AppUserContextType {
  user: AppUser | undefined;
  isUserLoggedIn: boolean | undefined;
  login: () => void;
  logout: () => void;
}

const AppUserContext = createContext<AppUserContextType | undefined>(undefined);

export function AppUserProvider({ children }) {
  const { user: auth0User, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [user, setUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      // Transform auth provider user to your app's user format
      setUser({
        userId: auth0User.sub!,
        organizationId: auth0User["https://myapp.com/org_id"] || "default-org",
        name: auth0User.name!,
        email: auth0User.email!,
        photoUrl: auth0User.picture,
      });
    } else {
      setUser(undefined);
    }
  }, [isAuthenticated, auth0User]);

  return (
    <AppUserContext.Provider
      value={{
        user,
        isUserLoggedIn: isAuthenticated,
        login: loginWithRedirect,
        logout: () => logout({ returnTo: window.location.origin }),
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}

export function useAppUser() {
  const context = useContext(AppUserContext);
  if (!context) throw new Error("useAppUser must be within AppUserProvider");
  return context;
}
```

**Layer 2: Velt Auth Integration (components/velt/)**

```jsx
// components/velt/VeltInitializeUser.tsx - Bridge to Velt
"use client";
import { useMemo } from "react";
import type { VeltAuthProvider } from "@veltdev/types";
import { useAppUser } from "@/app/userAuth/useAppUser";

export function useVeltAuthProvider() {
  const { user } = useAppUser();  // Get user from your app's auth

  const authProvider: VeltAuthProvider | undefined = useMemo(() => {
    if (!user) return undefined;

    return {
      user: {
        userId: user.userId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
      },
      retryConfig: { retryCount: 3, retryDelay: 1000 },
      generateToken: async () => {
        const resp = await fetch("/api/velt/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            organizationId: user.organizationId,
            email: user.email,
          }),
        });
        const { token } = await resp.json();
        return token;
      },
    };
  }, [user]);

  return { authProvider };
}
```

**Layer 3: App Pages (app/)**

```jsx
// app/page.tsx - Compose the layers
"use client";
import { VeltProvider } from "@veltdev/react";
import { useVeltAuthProvider } from "@/components/velt/VeltInitializeUser";
import { useAppUser } from "@/app/userAuth/useAppUser";

export default function Home() {
  const { isUserLoggedIn, login } = useAppUser();
  const { authProvider } = useVeltAuthProvider();

  // Show login if not authenticated
  if (!isUserLoggedIn) {
    return <button onClick={login}>Sign In</button>;
  }

  // Wait for Velt auth to be ready
  if (!authProvider) {
    return <div>Loading collaboration...</div>;
  }

  return (
    <VeltProvider apiKey={process.env.NEXT_PUBLIC_VELT_API_KEY!} authProvider={authProvider}>
      {/* App content with Velt features */}
    </VeltProvider>
  );
}
```

**Benefits of Separation:**

| Benefit | Description |
|---------|-------------|
| Independent testing | Test app auth without Velt, test Velt with mock users |
| Swap auth providers | Change from Auth0 to Firebase without touching Velt code |
| Clear data flow | User data flows: Auth Provider → AppUser → Velt |
| Easier debugging | Isolate issues to app auth vs Velt integration |

**Data Flow Diagram:**

```
[Auth Provider]     →     [AppUserContext]     →     [VeltAuthProvider]
(Auth0/Firebase)          (Your app's format)        (Velt's format)
     ↓                           ↓                          ↓
   Login                    useAppUser()            VeltProvider
   Logout                   User state              authProvider prop
```

**Verification:**
- [ ] App auth works without Velt being set up
- [ ] Velt auth receives user from useAppUser(), not directly from auth provider
- [ ] Login/logout is handled by app auth, not Velt
- [ ] User format transformation happens in AppUserContext
- [ ] VeltInitializeUser only bridges to Velt API

**Source Pointers:**
- `https://docs.velt.dev/get-started/quickstart` - Step 5: Authenticate Users
- `https://docs.velt.dev/get-started/advanced` - JWT Authentication Tokens
