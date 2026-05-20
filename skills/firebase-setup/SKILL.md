# Skill: Firebase Setup
> @skillsforllms/firebase-setup · v1.0.0 · Category: Backend / Firebase

## Purpose
Guide an AI agent to initialize Firebase-backed applications with Auth, Firestore, Storage, Cloud Functions, App Check, and security rules that match the app data model.

## When to Use This Skill
- Adding Firebase to a web or mobile app.
- Designing Firestore collections and security rules.
- Creating Cloud Functions for trusted server-side behavior.
- Configuring local emulators for development and tests.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Auth | Firebase Auth | Managed identity and provider support. |
| Database | Firestore | Offline-friendly document data. |
| Server logic | Cloud Functions | Trusted operations and triggers. |
| Local dev | Emulator Suite | Repeatable tests without production data. |

## Project Structure
```text
firebase.json
firestore.rules
storage.rules
functions/
src/
  lib/firebase/
  features/
```

## Key Conventions
- Treat security rules as part of the application contract, not as an afterthought.
- Keep client SDK initialization isolated in a single `firebase` module.
- Use Cloud Functions for privileged writes, webhooks, and cross-document invariants.
- Prefer explicit collection schemas and indexes over ad hoc document shapes.
- Use the emulator suite before touching production resources.

## Step-by-Step Agent Instructions
1. Identify products needed: Auth, Firestore, Storage, Functions, App Check.
2. Create environment-specific config and never hard-code private credentials.
3. Model collections, ownership, and access patterns before writing rules.
4. Add emulator config and scripts for local development.
5. Test allow and deny cases for every new security rule.

## File Templates
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
  }
}
```

## Anti-Patterns
- Do not ship permissive `allow read, write: if true` rules.
- Do not use client SDKs for privileged admin actions.
- Do not store service account secrets in frontend code.
- Do not design Firestore data without considering query indexes and rule checks.

## Examples
See `examples/basic/` for emulator and rules guidance.

## Changelog
- v1.0.0 - Initial release.
