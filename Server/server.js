const express = require('express');
const multer = require('multer');
const db = require('./database'); // Loads your SQLite configuration
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Middleware to parse JSON and form fields
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer to keep files in memory as Buffers (ideal for BLOB storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Enforce 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs only
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed!'), false);
        }
    }
});

// --- POST ROUTE: Save Expense ---
app.post('/api/expenses', upload.single('expenseAttachment'), (req, res) => {
    try {
        const { expenseName, expenseCategory, expenseAmount, expenseDate, expenseDescription } = req.body;
        
        // Check if file exists in the request
        const fileBuffer = req.file ? req.file.buffer : null;
        const fileName = req.file ? req.file.originalname : null;
        const fileType = req.file ? req.file.mimetype : null;

        const query = `INSERT INTO expenses (name, category, amount, date, description, attachment_data, attachment_name, attachment_type) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(query, [
            expenseName,
            expenseCategory,
            parseFloat(expenseAmount),
            expenseDate,
            expenseDescription || null,
            fileBuffer,
            fileName,
            fileType
        ], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Expense saved successfully!', expenseId: this.lastID });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- GET ROUTE: Fetch All Expenses Including Heavy Binary BLOB Data ---
app.get('/api/expenses', (req, res) => {
    // Select all columns from the database without skipping anything
    const query = `SELECT id, name, category, amount, date, description, attachment_data, attachment_name, attachment_type FROM expenses ORDER BY date DESC`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Map through each expense record to safely process the binary data
        const processedExpenses = rows.map(row => {
            let base64File = null;

            // If an attachment exists, convert the Node.js Buffer into a Base64 string
            if (row.attachment_data) {
                base64File = row.attachment_data.toString('base64');
            }

            return {
                id: row.id,
                name: row.name,
                category: row.category,
                amount: row.amount,
                date: row.date,
                description: row.description,
                attachmentName: row.attachment_name,
                attachmentType: row.attachment_type,
                // Create a Data URL so the frontend can read/preview it instantly
                attachmentDataUrl: base64File ? `data:${row.attachment_type};base64,${base64File}` : null
            };
        });

        // Send the complete array of items containing all data to the frontend
        res.json(processedExpenses);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
