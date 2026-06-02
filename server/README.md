# Server Utilities

This folder holds Firebase Admin scripts that run locally or in CI. They read secrets from the root `.env`.

1. Create a Firebase service account key in Firebase Console.
2. Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` to `.env`.
3. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Run `npm run seed:admin` to create or promote the admin account.
5. Run `npm run seed:products` if you want sample boutique products.

Do not commit `.env`.

