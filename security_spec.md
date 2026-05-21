# Security Specification for Atarax

## 1. Data Invariants
1. A user profile must only be created or modified by the authenticated user matching the document ID (`request.auth.uid == userId`).
2. A user's `hp` and `gold` fields cannot be arbitrarily modified unless validated.
3. A house document is owned by a single user (`ownerId == request.auth.uid`). No other client can edit another user's furniture placement or house settings.
4. House reading accessibility: if `isPublic` is false, it requires owner authentication or appropriate search authorization (such as checking `resource.data.accessCode`).

## 2. The "Dirty Dozen" Attacker Payloads
1. **Unauthenticated profile creation**: Creating a profile without logging in.
2. **Identity Spoofing**: User A attempts to edit User B's profile.
3. **Gold injection**: User setting `gold` directly to 9999999 on registration.
4. **Incorrect type on stats**: Setting stats to strings instead of numbers.
5. **Shadow Field Injection**: Inserting a hidden admin role field like `isAdmin: true` into a profile update.
6. **Orphaned house**: Creating a house using a random `ownerId` that does not match the creator's UID.
7. **Illicit coordinate shift**: Modifying furniture state of another player's house.
8. **Bypassing privacy limits**: Reading a hidden house that has `isPublic: false` as an uninvited user.
9. **Tampering with created timestamp**: Overwriting `createdAt` with a fake retrofitted timestamp.
10. **Setting massive height values**: Bypassing size limits (e.g., character height of 100 meters, which violates the 1.5m to 5.0m RPG boundaries).
11. **Negative HP / Cheat states**: Setting `hp` to negative values or illegal levels.
12. **Bypassing format limitations**: Injecting dangerous script titles inside usernames (Denial of Service/XSS).

## 3. Test Cases (TDD Blueprint)
We ensure Firestore Security Rules enforce these checks before allowing any document updates.
All attacks must return a standard `PERMISSION_DENIED`.
