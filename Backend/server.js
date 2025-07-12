const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Serve uploaded images statically
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage: storage });

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Upload Route
const fs = require("fs");


app.post("/upload", upload.single("image"), (req, res) => {
  const { id, name, price, discount, description, category, mostSell, available } = req.body;
  const image = req.file ? req.file.filename : null;

  const newProduct = {
  id,
  name,
  price,
  discount,
  description,
  category,
  mostSell: mostSell === "true", // convert to boolean
  available: available === "true", // convert to boolean
  image,
};


  const filePath = path.join(__dirname, "product.json");

  // Read existing products
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read products.json" });
    }

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (parseErr) {
      return res
        .status(500)
        .json({ message: "Invalid JSON format in products.json" });
    }

    // Add new product
    products.push(newProduct);

    // Write updated products back
    fs.writeFile(filePath, JSON.stringify(products, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ message: "Failed to save product" });
      }
      res
        .status(200)
        .json({
          message: "Product uploaded successfully",
          product: newProduct,
        });
    });
  });
});

// Get all products route
app.get("/product", (req, res) => {
  const filePath = path.join(__dirname, "product.json"); // match filename

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to load products" });
    }
    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch {
      res.status(500).json({ message: "Invalid JSON format" });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
