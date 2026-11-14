# AutoShort UI

Next.js (App Router) front end for the OpenMontage Reels pipeline: review research ideas and produced reels, leave notes,
manage users. It holds no data itself.

**Demo video:** [Watch the walkthrough](https://drive.google.com/file/d/1WqrpJI8EXRyl1fmtdZoD1UKOBQtiHMAx/view?usp=drive_link)

- **Sign-in:** invited email + 6-digit code (sent by the backend). The backend creates a server-side session; this app keeps
  its token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`as_session`) and never exposes it, the backend URL or the
  proxy secret to the browser.
- **`proxy.ts`** sends visitors without a cookie to `/login` (the backend re-checks the session on every call).
- **`app/api/p/[...path]`** forwards browser calls to an allow-listed set of backend paths; state-changing calls must come
  from this site's own origin.
- **Roles:** `admin` (everything) and `reviewer` (approve/reject ideas, edit ideas, review reels, leave notes).

## Environment

| Variable | Meaning |
|---|---|
| `API_BASE_URL` | Base URL of the backend API, e.g. `https://your-backend-api.example.com` |
| `API_PROXY_SECRET` | Must equal `API_PROXY_SECRET` in the backend `.env` |

Copy `.env.example` to `.env.local` for local work; set both in Vercel (Project > Settings > Environment Variables) for deploys.

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

Backend: the `api/` package in the OpenMontage repo (`uvicorn --factory api.main:create_app`).
