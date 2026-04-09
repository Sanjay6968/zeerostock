const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));


const inventory = [
  { id: 1, name: 'Screwdriver Set', category: 'Tools', price: 15.99, stock: 45 },
  { id: 2, name: 'Hammer', category: 'Tools', price: 9.50, stock: 120 },
  { id: 3, name: 'Office Chair', category: 'Furniture', price: 120.00, stock: 12 },
  { id: 4, name: 'Standing Desk', category: 'Furniture', price: 250.00, stock: 5 },
  { id: 5, name: 'Desk Lamp', category: 'Electronics', price: 25.00, stock: 80 },
  { id: 6, name: 'Mechanical Keyboard', category: 'Electronics', price: 85.00, stock: 35 },
  { id: 7, name: 'Wireless Mouse', category: 'Electronics', price: 45.00, stock: 50 },
  { id: 8, name: 'AAA Batteries (12-pack)', category: 'Electronics', price: 12.99, stock: 200 },
  { id: 9, name: 'Notepad 5-pack', category: 'Office Supplies', price: 5.50, stock: 300 },
  { id: 10, name: 'Pens 10-pack', category: 'Office Supplies', price: 8.00, stock: 150 },
  { id: 11, name: 'Printer Paper (Ream)', category: 'Office Supplies', price: 6.99, stock: 400 },
  { id: 12, name: 'Laser Printer', category: 'Electronics', price: 199.99, stock: 8 },
  { id: 13, name: 'Bookshelf', category: 'Furniture', price: 89.99, stock: 15 },
  { id: 14, name: 'Drill', category: 'Tools', price: 110.00, stock: 25 },
  { id: 15, name: 'Safety Goggles', category: 'Tools', price: 14.50, stock: 65 }
];

app.get('/search', (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query;

  let results = [...inventory];

  if (q) {
    const lowerQ = q.toLowerCase();
    results = results.filter(item => item.name.toLowerCase().includes(lowerQ));
  }

  if (category && category !== 'All') {
    results = results.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      results = results.filter(item => item.price >= min);
    }
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      results = results.filter(item => item.price <= max);
    }
  }

  res.json({
    count: results.length,
    results: results
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Assignment A Service started on port ${PORT}`);
});

