# CX

Multi-app platform (React + Vite frontends, Express + MongoDB backend).

## Apps & Domains

| Folder       | App                | Production domain                | Dev port |
| ------------ | ------------------ | -------------------------------- | -------- |
| `client/`    | Main site          | https://cx.oraclesoft.cc         | 5173     |
| `server/`    | Backend API        | https://cxapi.oraclesoft.cc      | 5000     |
| `affiliate/` | Affiliate / Partner| https://partnercx.oraclesoft.cc  | 5174     |
| `Brand/`     | Brand site         | https://brandcx.oraclesoft.cc    | 5175     |
| `Guide/`     | Guide / Help center| https://guidecx.oraclesoft.cc    | 5176     |
| `admin/`     | Admin panel        | https://admincx.oraclesoft.cc    | 5177     |

## Setup

Each app is standalone — install and run it from its own folder.

```bash
cd <app>
npm install
cp .env.example .env.local   # server/ uses .env instead of .env.local
npm run dev
```

Backend:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Environment

- Frontends read `*.env.local`; all variables must be prefixed with `VITE_`.
- The backend reads `server/.env`.
- Every env file keeps a commented **Local** block and an active **Online** block —
  swap the comments to switch between localhost and the production domains.
- Real secrets live only in `.env.local` / `.env` (gitignored). `.env.example`
  files are committed and hold the shape, not the values.

## Build

```bash
cd <app> && npm run build   # output goes to <app>/dist
```
