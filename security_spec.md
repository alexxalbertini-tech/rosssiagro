# Security Specification - ROSSIAGRO

## Data Invariants
1. A service must belong to a valid client.
2. Only owners can see the financial summary of all operations.
3. Operators can only mark as completed services they are assigned to.
4. Commissions are automatically calculated and cannot be manipulated by operators.
5. User roles are immutable once set (except by owners).

## The Dirty Dozen Payloads (Targeting Firestore)

1. **Identity Spoofing**: Attempt to create a service as another operator.
2. **Role Escalation**: Operator attempting to update their own role to 'DONO'.
3. **Price Manipulation**: Overwriting the `valorTotal` field with a lower value after service completion.
4. **Orphaned Service**: Creating a service without a valid `clienteId`.
5. **Ghost Field**: Adding `isSuperAdmin: true` to a user profile.
6. **Negative area**: Creating a service with `-10` hectares.
7. **Cross-Tenant Read**: Operator A trying to list services they are not assigned to.
8. **Malicious ID**: Using a 1MB string as a Document ID for a new service.
9. **Timestamp Injection**: Setting `createdAt` to a date in 2030 from the client.
10. **Commission Theft**: Trying to update a `Comissao` document to set `pago: true`.
11. **Client Data Leak**: Anonymous user trying to list the `clientes` collection.
12. **Mass Delete**: Boss attempting to delete all services in a collection.

## Test Runner (Logic Outline)
The rules will be tested using the `@firebase/rules-unit-testing` framework (conceptually) to verify:
- `deny` on all anonymous access.
- `deny` on role modification by non-owners.
- `allow` only specific field updates for operators (status only).
- `allow` full read for owners.
