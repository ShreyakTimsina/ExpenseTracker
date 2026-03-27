# Database Schema Documentation

ExpenseIQ uses **MongoDB** as its NoSQL database. Object Document Mapping (ODM) and validation rules are strictly managed by **Mongoose**.

The architecture employs a fully normalized User structure where transactions strictly reference a parent `User` ObjectId to guarantee data tenancy and privacy isolation.

---

## 1. User Schema

**Collection**: `users`  
**Purpose**: Manages secure access, authentication profiles, and password persistence.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Auto-generated | Unique identifier. |
| `name` | String | Yes | None | The user's full display name. |
| `email` | String | Yes | Unique | Verified email address for login. |
| `password` | String | Yes | None | BCRYPT hashed securely before storage. |
| `createdAt` | Date | No | Default: `Date.now` | The account registration timestamp. |
| `updatedAt` | Date | No | Auto-updated by Mongoose | The last modified timestamp. |

---

## 2. Transaction Schema

**Collection**: `transactions`  
**Purpose**: Stores individual financial records, ML flagging outcomes, and amount mathematics.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Auto-generated | Unique identifier. |
| `user` | ObjectId | Yes | `ref: 'User'` | Foreign Key equivalent linking to the owner account. |
| `amount` | Number | Yes | None | Absolute positive denotes Income. Negative denotes Expenses. |
| `category` | String | Yes | None | Open structured semantic category (e.g., Food, Transport, Salary). |
| `description` | String | Yes | None | Human-readable note (e.g., "McDonalds Lunch"). Processed by NLP. |
| `date` | Date | No | Default: `Date.now` | User-submitted or automatic timestamp. |
| `isAnomaly` | Boolean | No | Default: `false` | True if flagged by the Isolation Forest ML backend processor. |
| `createdAt` | Date | No | Auto-updated by Mongoose | Database insertion timestamp. |
| `updatedAt` | Date | No | Auto-updated by Mongoose | Configuration modification timestamp. |

### Indexing Considerations
- `user`: Highly recommended for compound indexing on large-scale data sets, seeing as the application frequently runs isolated `Transaction.find({ user: req.user._id })` fetches across billions of mathematical operations.
