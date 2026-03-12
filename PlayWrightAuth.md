The clean way in this repo is: use a Playwright login setup that signs in once, saves `storageState`, and then run the protected-route accessibility spec with that saved state.

Why that fits this repo:
- auth uses cookies `auth_token` and `expiresAt` in [authStore.ts](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/stores/authStore.ts:35) and [authStore.ts](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/stores/authStore.ts:190)
- auth is also persisted under `auth-storage` in [authStore.ts](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/stores/authStore.ts:38) and [authStore.ts](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/stores/authStore.ts:413)
- a saved Playwright `storageState` captures both cookies and localStorage, so it matches the app's real login behavior better than hand-seeding one cookie

Recommended shape:

1. Add a setup spec, e.g. `src/tests/auth.setup.ts`

```ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('Username or Email').fill(process.env.PW_LOGIN!);
  await page.getByLabel('Password').fill(process.env.PW_PASSWORD!);
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).toHaveURL(/^(?!.*\/auth\/login).*/);
  await page.context().storageState({ path: authFile });
});
```

2. In [playwright.config.ts](/C:/Users/Suresh/scicommons/SciCommons-frontend/playwright.config.ts), add a setup project plus an authenticated project (or authenticated accessibility project) that depends on it and uses that `storageState`

Conceptually:
- one project runs only `auth.setup.ts`
- one project runs the protected accessibility spec with `storageState: 'playwright/.auth/user.json'`

3. Split the accessibility coverage into:
- public pages spec: `/`, `/auth/login`, `/auth/register`, `/communities`, `/discussions`
- authenticated pages spec: `/mycontributions`, `/settings`

4. Feed credentials through env vars, not hardcoded values:
- `PW_LOGIN`
- `PW_PASSWORD`

That gives you a real logged-in browser session before the protected-page audits run.

There is a more fragile shortcut: manually seed `auth_token` and `expiresAt` cookies in Playwright. I would not recommend that here, because this app also persists auth state in localStorage and derives expiry behavior in the auth store. UI login + saved `storageState` is the more reliable setup.

## UI Review Findings

**Findings**
1. Medium: Default theme text hierarchy is flattened.
- [globals.css](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/globals.css:219) and [globals.css](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/globals.css:225) now give `--Text-Secondary` and `--Text-Tertiary` the same RGB value.
- That improves raw contrast, but it removes the visual distinction between secondary and tertiary copy everywhere the default skin is used.
- Because [layout.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/layout.tsx:28) falls back to `default` when `NEXT_PUBLIC_UI_SKIN` is unset, this is a real regression outside sage-configured environments.

2. Medium: The sage blue token pair has lost most of its base/contrast separation.
- [globals.css](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/globals.css:391) sets `--Functional-Blue-Blue` to `45, 95, 165`, while [globals.css](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/globals.css:393) leaves `--Functional-Blue-Bluecontrast` at `41, 93, 160`.
- Many interactive elements depend on that distinction for hover/emphasis, e.g. [Comment.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/common/Comment.tsx:402) and [ImageUpload.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/common/ImageUpload.tsx:125).
- Net: raw contrast is better, but blue hover states in the active sage skin become much harder to perceive.

3. Low: The register footer link is now a one-off auth treatment.
- [register/page.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/(authentication)/auth/register/page.tsx:291) is permanently underlined with custom decoration, while reciprocal auth links remain plain or hover-underlined in [login/page.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/(authentication)/auth/login/page.tsx:195), [login/page.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/(authentication)/auth/login/page.tsx:203), [forgotpassword/page.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/(authentication)/auth/forgotpassword/page.tsx:87), and [resendverificationemail/page.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/(authentication)/auth/resendverificationemail/page.tsx:66).
- It is not wrong, but it breaks the auth suite's visual consistency.

4. Low: The loader accent no longer feels internally consistent.
- The spinner is still hardcoded emerald in [Loader.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/common/Loader.tsx:10), but the message moved to tokenized `text-functional-greenContrast` and `font-semibold` in [Loader.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/common/Loader.tsx:13).
- That improves readability, but the component now mixes a hardcoded accent with a darker token accent and reads more forceful than the rest of the site's loading copy.

5. Low: The private community badge change is directionally good, but it creates a mixed blue-chip treatment inside the same card.
- [CommunityCard.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/communities/CommunityCard.tsx:242) now uses `text-functional-blueContrast`, while the reviewer badge in [CommunityCard.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/components/communities/CommunityCard.tsx:45) still uses `text-functional-blue` on the same `bg-functional-blue/10` pattern.
- The private badge itself is more legible; the inconsistency is in the surrounding component language.

**Observations**
- No logic/correctness bugs jumped out in these UI edits; the risk is mostly visual-system consistency and token semantics.
- The accessibility intent is sound. By rough contrast math, tertiary text went from about `4.7:1` to `7.6:1` against white, and the sage base blue from about `4.8:1` to `6.4:1`.
- Your local env is using the sage skin in [.env](/C:/Users/Suresh/scicommons/SciCommons-frontend/.env:3), so the sage token edits are likely the ones you actually see day-to-day. The default-theme finding still matters for any environment that falls back to [layout.tsx](/C:/Users/Suresh/scicommons/SciCommons-frontend/src/app/layout.tsx:28).
- Of the itemized changes, the private badge is the least concerning; the loader and global token changes deserve more scrutiny because their blast radius is wider.
