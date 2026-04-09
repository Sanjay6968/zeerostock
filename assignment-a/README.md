# Assignment A: Inventory Search API + UI

### Live Project Deployment
- **Live URL:** [https://zeerostock-dt2k.onrender.com/](https://zeerostock-dt2k.onrender.com/)

### Architecture & Logic
- **Search Engine Execution:** The search logic (`GET /search`) filters an in-memory inventory array securely via the API without requiring a NoSQL setup.
- **Strict Case-Insensitivity:** Note that the search is **entirely case-insensitive**. Queries like `hammer` or `HAMMER` will universally match. This is accomplished leveraging pure lowercase string checks (`.toLowerCase().includes(...)`), ensuring absolute foolproof case-insensitivity without breaking unexpectedly on regex collision characters.

### Performance Improvement for Large Datasets
If datasets grow to millions of records, iterating an array structure (`O(N)`) becomes a significant bottleneck severely impacting latency.
**The main performance improvement I would make** is migrating the array data source to an **Elasticsearch or Typesense** ingestion cluster.
- Using an inverted index would change the case-insensitive text-search (`q`) complexity from an `O(N)` linear scan down to extreme `O(1)` or `O(log N)` instant lookups.
- Fast hardware filtering utilizing numeric B-Tree and keyword indexes for `price` and `category` would prevent the engine from processing the entire dataset, improving latency dynamically to a few milliseconds.
