# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Authentication & Verification**: All read and write operations require a signed-in user with `request.auth.token.email_verified == true`.
2. **Ownership Isolation**:
   - A `Transaction` document in `/transactions/{transactionId}` can only be created, read, listed, updated, or deleted if `userId == request.auth.uid`.
   - A `WalletSetting` document in `/wallet_settings/{userId}` must have a document ID matching `request.auth.uid` and `data.userId == request.auth.uid`.
3. **Immutable Fields**: `userId` and `createdAt` cannot be modified during any `update` operation.
4. **Temporal Integrity**: `createdAt` and `updatedAt` must strictly equal `request.time` on creation, and `updatedAt` must strictly equal `request.time` on update.
5. **Strict Key & Volumetric Boundaries**:
   - No shadow/extra fields are permitted (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
   - Every string field is bounded by `.size()` and regex patterns (`date`, `type`, `account`, `center`, `cat`, `note`).
   - Numeric amounts (`amt`, `initialBank`, `initialCash`) must be valid numbers within safe bounds.

## 2. The "Dirty Dozen" Payloads

1. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempting to create a transaction.
2. **Cross-User Ownership Spoof (Create)**: User `user_A` attempting to create a transaction with `userId: "user_B"`.
3. **Shadow Field Injection (Create)**: Creating a transaction with an extra field `"isAdmin": true`.
4. **Shadow Field Injection (Update)**: Updating a transaction to add `"verified": true`.
5. **Immutable Owner Mutation (Update)**: Updating `userId` on an existing transaction from `"user_A"` to `"user_B"`.
6. **Immutable Timestamp Mutation (Update)**: Modifying `createdAt` during a transaction update.
7. **Client Timestamp Forgery**: Setting `updatedAt` to a past/future timestamp instead of `request.time`.
8. **Enum Bypass**: Creating a transaction with `center: "duck"` or `type: "loan"`.
9. **Resource Poisoning (Oversized Note)**: Creating a transaction with a `note` exceeding 500 characters.
10. **Negative or Zero Transaction Amount**: Creating a transaction with `amt: -500` or `amt: 0`.
11. **ID Poisoning**: Creating a document with an invalid or >128 character document ID containing special characters.
12. **Unauthorized Cross-User List/Get**: User `user_A` attempting to `get` or `list` transactions belonging to `user_B`, or attempting to `list` `/wallet_settings`.
