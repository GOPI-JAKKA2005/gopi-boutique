# Gopi Boutique App

React storefront and Firebase admin panel split into:

- `client/`: Vite React app, public assets, UI, Firebase client code
- `server/`: Firebase Admin utility scripts for trusted setup tasks

## Environment

Copy `.env.example` to `.env` and fill the values.

Client values:

- `VITE_FIREBASE_*`
- `VITE_IMGBB_API_KEY`
- `VITE_WHATSAPP_NUMBER`
- `VITE_HERO_VIDEO_URL`

Server/admin values:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Keep `.env` private. It is ignored by git.

## Hero Video

Replace:

```txt
client/public/media/hero-video.mp4
```

Keep `VITE_HERO_VIDEO_URL="/media/hero-video.mp4"` unless you set a hosted video URL from the admin Pages panel.

## Admin Setup

1. Create a Firebase service account key in Firebase Console.
2. Put the service account values in `.env`.
3. Run:

```bash
npm run seed:admin
```

This creates or promotes the admin account and writes the protected `users/{uid}` role.

## Local Development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Build And Deploy

```bash
npm run build
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

The production build outputs to `dist/`, which Firebase Hosting uses from `firebase.json`.

