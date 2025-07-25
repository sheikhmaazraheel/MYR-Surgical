const backendURL = "https://myr-backend-7nx6.onrender.com";
const githubBase = "https://sheikhmaazraheel.github.io/MYR-Surgical";

// Redirect if not authenticated
async function checkAuth() {
  try {
    const res = await fetch(`${backendURL}/check-auth`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = `${githubBase}/login`;
    }
  } catch {
    window.location.href = `${githubBase}/login`;
  }
}

// Login Logic
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = `${githubBase}/protected/admin`;
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login");
    }
  });
}

// Admin Page Logic
document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("addProductForm");
  const editForm = document.getElementById("editProductForm");
  const adminPage = document.getElementById("adminpage");

  if (productForm || editForm || adminPage) {
    checkAuth(); // Only if on admin page
  }

  // ✅ Add Product
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(productForm);
      const statusDiv = document.getElementById("upload-status");
      statusDiv.textContent = "Uploading...";

      try {
        const res = await fetch(`${backendURL}/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const result = await res.json();

        statusDiv.textContent =
          res.ok && result.product
            ? "✅ Product uploaded!"
            : "❌ Upload failed: " + (result.message || "Unknown error.");
        if (res.ok) productForm.reset();
      } catch (err) {
        console.error("Upload error:", err);
        statusDiv.textContent = "❌ Server error.";
      }
    });
  }

  // ✏️ Load & Edit Product
  const loadBtn = document.getElementById("loadProductBtn");
  const searchInput = document.getElementById("searchIdOrName");
  let currentId = null;

  if (loadBtn && searchInput && editForm) {
    loadBtn.addEventListener("click", async () => {
      const query = searchInput.value.trim();
      if (!query) return alert("Please enter product ID or name");

      try {
        const res = await fetch(`${backendURL}/products`);
        const products = await res.json();
        const product = products.find(
          (p) => p.id === query || p.name === query
        );
        if (!product) return alert("Product not found");

        currentId = product.id;
        editForm.style.display = "block";

        editForm["edit-id"].value = product.id;
        editForm["edit-name"].value = product.name;
        editForm["edit-price"].value = product.price;
        editForm["edit-discount"].value = product.discount;
        editForm["edit-category"].value = product.category;
        editForm["edit-mostSell"].value = product.mostSell ? "true" : "";
        editForm["edit-available"].value = product.available ? "true" : "false";
        editForm["edit-colors"].value = (product.colors || []).join(",");
        editForm["edit-sizes"].value = (product.sizes || []).join(",");
      } catch (err) {
        console.error(err);
        alert("Failed to load product");
      }
    });

    // Save/Update Product
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(editForm);

      try {
        const res = await fetch(`${backendURL}/products/${currentId}`, {
          method: "PUT",
          body: formData,
          credentials: "include",
        });

        const result = await res.json();
        alert(result.message || "Product updated");
        editForm.style.display = "none";
      } catch (err) {
        console.error(err);
        alert("Failed to update product");
      }
    });

    // ❌ Delete Product
    document
      .getElementById("deleteProductBtn")
      .addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
          const res = await fetch(`${backendURL}/products/${currentId}`, {
            method: "DELETE",
            credentials: "include",
          });

          const result = await res.json();
          alert(result.message);
          editForm.reset();
          editForm.style.display = "none";
        } catch (err) {
          console.error(err);
          alert("Failed to delete product");
        }
      });
  }

  // 🚪 Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`${backendURL}/logout`, {
          method: "POST",
          credentials: "include",
        });
        const result = await res.json();
        if (result.success) {
          window.location.href = `${githubBase}/login`;
        } else {
          alert("Logout failed.");
        }
      } catch (err) {
        console.error("Logout error:", err);
        alert("Something went wrong.");
      }
    });
  }

  // 🍔 Responsive Navbar Toggle
  const hamburger = document.querySelector(".hamburger");
  const sidebar = document.querySelector(".sidebar");
  if (hamburger && sidebar) {
    // Hamburger menu toggle
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }
});
