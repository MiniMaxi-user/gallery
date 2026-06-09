# Velaro — Photographer Gallery Platform

## Admin setup

The platform admin role is bootstrapped from environment variables. No database record is created for the admin — credentials are validated directly against env vars at login time.

### Required environment variables

```
ADMIN_EMAIL=admin@jouwdomein.nl      # Platform admin e-mail address
ADMIN_PASSWORD=kies_een_sterk_wachtwoord  # Platform admin password
ADMIN_SESSION_SECRET=willekeurige_lange_string_hier  # Shared session secret
```

> **Note:** `ADMIN_PASSWORD` is shared between the platform admin (email + password) and the photographer (password only). If you want separate passwords, set `ADMIN_PASSWORD` for the admin and use a different value in `ADMIN_SESSION_SECRET` to ensure session tokens don't overlap.

### First login

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment (`.env.local` locally, Vercel dashboard in production).
2. Navigate to `/admin`.
3. Log in with the configured email and password.
4. You will be redirected to `/admin/dashboard`.

### Roles

| Role | Login path | Credentials |
|------|-----------|-------------|
| **Platform Admin** | `/admin` | `ADMIN_EMAIL` + `ADMIN_PASSWORD` |
| **Photographer** | `/photographer` | `ADMIN_PASSWORD` only |
| **Client** | `/gallery/[id]` | Per-shoot email + password |

### Managing photographers

From `/admin/dashboard` you can:

- **Add** a photographer (name + email)
- **Activate / Deactivate** an account — deactivated accounts are blocked from the platform
- **Delete** a photographer — permanently removes the account **and all associated galleries and photos**

## Local development

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local (or run: vercel env pull .env.local)
npm run dev
```
