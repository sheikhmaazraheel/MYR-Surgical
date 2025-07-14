require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const Product = require("./models/Product");

const app = express();
app.use(express.json());

const PORT = 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..")));

const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true if using HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Dummy user
const ADMIN = {
  username: process.env.ADMIN_USER,
  password: process.env.ADMIN_HASH,
};

// Login route

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER) {
      const match = await bcrypt.compare(password, process.env.ADMIN_HASH);
      if (match) {
        req.session.loggedIn = true;
        return res.json({ success: true });
      }
    }
    res.json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Failed to logout" });
    }
    res.clearCookie("connect.sid"); // default session cookie name
    res.json({ success: true });
  });
});


// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  res.redirect("/login.html");
}

// Multer Setup
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

// Upload Product Route
app.post(
  "/upload",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const {
      id,
      name,
      price,
      discount,
      description,
      category,
      mostSell,
      available,
    } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
      const product = new Product({
        id,
        name,
        price,
        discount,
        description,
        category,
        mostSell: mostSell === "true" || mostSell === true,
        available: available === "true" || available === true,
        image,
      });

      await product.save();

      res.status(200).json({
        message: "Product saved to MongoDB",
        product,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save product", error });
    }
  }
);

// ✅ NEW Route: Get All Products from DB
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to load products", error });
  }
});

app.put("/products/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const updateFields = { ...req.body };

  if (typeof updateFields.available !== "undefined") {
    updateFields.available =
      updateFields.available === "true" || updateFields.available === "on";
  }
  if (typeof updateFields.mostSell !== "undefined") {
    updateFields.mostSell =
      updateFields.mostSell === "true" || updateFields.mostSell === "on";
  }

  if (req.file) {
    updateFields.image = req.file.filename;
  }

  try {
    await Product.updateOne({ id }, { $set: updateFields });
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err });
  }
});
app.delete("/products/:id", async (req, res) => {
  try {
    await Product.deleteOne({ id: req.params.id });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
});
// Protected admin panel route
app.get("/admin.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../protected/admin.html"));
});

app.get("/check-auth", (req, res) => {
  if (req.session.loggedIn) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Start Server
app.listen(PORT, () => {
  const bcrypt = require("bcrypt");
  bcrypt.hash("MYRsecure25", 10).then(console.log);

  console.log(`Server is running on http://localhost:${PORT}`);
});
