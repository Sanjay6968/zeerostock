const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Connect to SQLite Database
const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        // Initialize tables and schema
        db.serialize(() => {
            // Foreign keys must be enabled manually in SQLite
            db.run(`PRAGMA foreign_keys = ON;`);

            db.run(`CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                supplier_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity >= 0),
                price REAL NOT NULL CHECK(price > 0),
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            )`);
            
            console.log('Database tables initialized.');
        });
    }
});

/**
 * ----------------------------------------
 * POST /supplier
 * ----------------------------------------
 * Creates a new supplier.
 * Body: { name: string, city: string }
 */
app.post('/supplier', (req, res) => {
    const { name, city } = req.body;
    
    if (!name || !city) {
        return res.status(400).json({ error: 'Name and city are required' });
    }

    const sql = `INSERT INTO suppliers (name, city) VALUES (?, ?)`;
    db.run(sql, [name, city], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            message: 'Supplier created successfully',
            id: this.lastID 
        });
    });
});

/**
 * ----------------------------------------
 * POST /inventory
 * ----------------------------------------
 * Creates a new inventory item.
 * Body: { supplier_id, product_name, quantity, price }
 * Rules: quantity >= 0, price > 0, valid supplier_id
 */
app.post('/inventory', (req, res) => {
    const { supplier_id, product_name, quantity, price } = req.body;

    if (!supplier_id || !product_name || quantity === undefined || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity < 0) return res.status(400).json({ error: 'Quantity must be >= 0' });
    if (price <= 0) return res.status(400).json({ error: 'Price must be > 0' });

    // The SQLite CHECK constraints and FOREIGN KEY constraints will automatically
    // validate the quantity, price, and supplier existence but doing application
    // level validation provides better user feedback.
    const sql = `INSERT INTO inventory (supplier_id, product_name, quantity, price) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [supplier_id, product_name, quantity, price], function(err) {
        if (err) {
            // Handle foreign key constraint failure
            if (err.message.includes('FOREIGN KEY constraint failed')) {
                return res.status(400).json({ error: 'Invalid supplier_id. Supplier does not exist.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Inventory item added successfully',
            id: this.lastID
        });
    });
});

/**
 * ----------------------------------------
 * GET /inventory
 * ----------------------------------------
 * Returns all inventory grouped by supplier, 
 * sorted by total inventory value (quantity * price)
 */
app.get('/inventory', (req, res) => {
    const sql = `
        SELECT 
            s.id AS supplier_id,
            s.name AS supplier_name,
            s.city AS supplier_city,
            SUM(i.quantity * i.price) AS total_value,
            json_group_array(
                json_object(
                    'id', i.id,
                    'product_name', i.product_name,
                    'quantity', i.quantity,
                    'price', i.price,
                    'value', (i.quantity * i.price)
                )
            ) as products
        FROM suppliers s
        JOIN inventory i ON s.id = i.supplier_id
        GROUP BY s.id
        ORDER BY total_value DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // SQLite json_group_array returns a stringified JSON array, so parse it
        const formattedRows = rows.map(row => ({
            ...row,
            products: JSON.parse(row.products)
        }));

        res.json(formattedRows);
    });
});

app.listen(PORT, () => {
    console.log(`Assignment B API running on http://localhost:${PORT}`);
});
