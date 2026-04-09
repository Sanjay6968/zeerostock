const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simple root route (VERY IMPORTANT)
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// your inventory + /search code here...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
