# Assignment B: Inventory Database + APIs

This service provides robust relational inventory listing across multiple suppliers, utilizing Node.js, Express, and SQLite.

## How to Run
```bash
cd assignment-b
npm install
node server.js
```

## Available APIs
- **`POST /supplier`**: Creates a supplier. Requires `{ "name": "...", "city": "..." }`.
- **`POST /inventory`**: Creates inventory. Requires `{ "supplier_id": 1, "product_name": "...", "quantity": 10, "price": 100 }`.
- **`GET /inventory`**: Returns all inventory grouped by supplier, sorted dynamically by total inventory value (`quantity * price`).

## Database Schema Explanation
The database consists of two tables heavily linked using strict **foreign keys**:
1. **`suppliers`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `name`: TEXT NOT NULL
   - `city`: TEXT NOT NULL
2. **`inventory`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `supplier_id`: INTEGER (Foreign key mapping to `suppliers.id`)
   - `product_name`: TEXT NOT NULL
   - `quantity`: INTEGER NOT NULL (Enforced to be `>= 0` via `CHECK` constraint)
   - `price`: REAL NOT NULL (Enforced to be `> 0` via `CHECK` constraint)

## Why I Chose SQL over NoSQL
I chose a **SQL (Relational) database** (SQLite) rather than a NoSQL document store (like MongoDB) because the requirement naturally fits a relational schema (`One-to-Many` relationship between `suppliers` and `inventory items`).
Additionally, the query requirement explicitly demands grouping, arithmetic operations across fields (`quantity * price`), and sorting by the aggregated result. SQL excels at these types of structured analytical queries, allowing us to compute and group everything securely at the row/database layer with high performance before sending data back to the Node layer. Doing this safely in NoSQL would require complex aggregation pipelines or heavy memory overhead on the application worker node.

## Indexing & Optimization Suggestion
One massive performance optimization for read-heavy systems is **indexing the Foreign Key**.
```sql
CREATE INDEX idx_inventory_supplier_id ON inventory(supplier_id);
```
Without this index, whenever the JOIN or GROUP BY happens in the `GET /inventory` lookup, the SQL engine has to perform a full table scan on the `inventory` table to align all products to their nested `supplier_id` parent group. An index directly resolves it into an `O(log N)` operation.
