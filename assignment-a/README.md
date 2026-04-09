# Assignment A: Inventory Search API + UI

This project implements a search feature for surplus inventory, split into a `backend` and `frontend`.

## Running the Application
1. **Backend**:
   - `cd backend`
   - `npm install`
   - `node server.js`
   - Runs on `http://localhost:3001`

2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Check the console for the local URL (usually `http://localhost:5173`)

for live project visit:https://zeerostock-dt2k.onrender.com/

## Search Logic Explanation
The search logic is handled on the backend (`GET /search`). It begins with the full mock array of 15 inventory items. It applies multiple filters in cascade:
1. **Name Filter (`q`)**: Uses a case-insensitive regular expression to verify if the search query is a substring of the product name. This enables robust partial matching.
2. **Category Filter**: Checks for an exact, case-insensitive match against the requested category, unless "All" categories are selected.
3. **Price Filters (`minPrice`, `maxPrice`)**: Parse the input filters as floats and compare them against the item's price.
If no filters are provided in the query params, the base API just returns all results automatically because no filter predicates will trigger.

## Performance Improvement for Large Datasets
For scaling to millions of records, iterating through an array (`O(N)`) on every request becomes a heavy bottleneck.
**The main performance improvement I would make** is migrating from a static array to "Elasticsearch or Typesense". 
- Using an inverted index would change text-search (`q`) complexity from `O(N)` scanning to `O(1)` or `O(log N)` lookup.
- Fast filtering using numeric and keyword indexes for `price` and `category` would prevent processing the entire dataset, improving response latency dramatically to a few milliseconds.
