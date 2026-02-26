const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

/* PostgreSQL connection */
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bi_dashboard",
  password: "1234",   // your password
  port: 5432,
});

/* Test API */
app.get("/", (req, res) => {
  res.send("Backend running...");
});

/* Get all sales */
app.get("/sales", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sales");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Filtered sales for charts */
app.get("/sales-filtered", async (req, res) => {
  const { start, end, product } = req.query;

  try {
    let query = `
      SELECT product_name, SUM(amount) as total
      FROM sales
      WHERE sale_date BETWEEN $1 AND $2
    `;

    let values = [start, end];

    if (product && product !== "All") {
      query += " AND product_name = $3";
      values.push(product);
    }

    query += " GROUP BY product_name";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* KPI API */
app.get("/kpi", async (req, res) => {
  try {
    const totalSales = await pool.query(
      "SELECT SUM(amount) FROM sales"
    );

    const totalOrders = await pool.query(
      "SELECT COUNT(*) FROM sales"
    );

    const topProduct = await pool.query(`
      SELECT product_name, SUM(amount) as total
      FROM sales
      GROUP BY product_name
      ORDER BY total DESC
      LIMIT 1
    `);

    res.json({
      totalSales: totalSales.rows[0].sum,
      totalOrders: totalOrders.rows[0].count,
      topProduct: topProduct.rows[0]?.product_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Start server */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Upload CSV API
app.post("/upload", upload.single("file"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (let row of results) {
          await pool.query(
            "INSERT INTO sales (product_name, quantity, price, date) VALUES ($1,$2,$3,$4)",
            [row.product_name, row.quantity, row.price, row.date]
          );
        }
        res.json({ message: "File uploaded successfully" });
      } catch (err) {
        console.log(err);
        res.status(500).send("Error");
      }
    });
});



