const backendURL = "https://myr-backend-7nx6.onrender.com";
const githubBase = "https://sheikhmaazraheel.github.io/MYR-Surgical";

// Redirect if not authenticated
// Redirect if not authenticated
async function checkAuth() {
  try {
    const res = await fetch(`${backendURL}/check-auth`, {
      method: "GET",
      /*credentials: "include",*/
    });
    const data = await res.json();
    console.log("Check-auth response:", data);
    if (!data.authenticated) {
      window.location.href = `${githubBase}/login`;
    }
  } catch (err) {
    console.error("Check-auth error:", err);
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
        headers: {
          "Content-Type": "application/json",
        },
        /*credentials: "include",*/
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);
      if (data.success) {
        window.location.href = `${githubBase}/protected/admin`;
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login: " + err.message);
    }
  });
}

// Admin Page Logic
document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("addProductForm");
  const editForm = document.getElementById("editProductForm");
  const adminPage = document.getElementById("adminpage");

  // if (productForm || editForm || adminPage) {
  //   checkAuth(); // Only if on admin page
  // }
  // Validation function for alphanumeric ID
  function isValidId(id) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(id);
  }
  // ✅ Add Product
  if (productForm) {
    console.log(productForm);
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(productForm);
      const statusDiv = document.getElementById("upload-status");
      const id = formData.get("id");

      // Validate ID
      if (!isValidId(id)) {
        statusDiv.textContent =
          "❌ Product ID must contain only letters and numbers (no special characters).";
        return;
      }
      statusDiv.textContent = "Uploading...";
      const formDataObj = {};
      formData.forEach((value, key) => (formDataObj[key] = value));
      console.log("FormData:", formDataObj);
      try {
        const res = await fetch(`${backendURL}/upload`, {
          method: "POST",
          body: formData,
          /*credentials: "include",*/
        });
        const result = await res.json();
        statusDiv.textContent =
          res.ok && result.message === "Product saved"
            ? "✅ Product uploaded!"
            : `❌ Upload failed: ${result.message || "Unknown error."}`;
        if (res.ok) productForm.reset();
      } catch (err) {
        console.error("Upload error:", {
          message: err.message,
          stack: err.stack,
        });
        statusDiv.textContent = `❌ Server error: ${err.message}`;
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
        const res = await fetch(`${backendURL}/products`, {
          /*credentials: "include",*/
        });

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
      const id = formData.get("edit-id");

      // Validate ID
      if (!isValidId(id)) {
        alert(
          "Product ID must contain only letters and numbers (no special characters)."
        );
        return;
      }
      try {
        const res = await fetch(`${backendURL}/products/${currentId}`, {
          method: "PUT",
          body: formData,
          /*credentials: "include",*/
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
            /*credentials: "include",*/
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
          /*credentials: "include",*/
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
  async function loadOrders() {
    const statusDiv = document.getElementById("orders-status");
    const ordersBody = document.getElementById("orders-body");
    if (statusDiv) statusDiv.textContent = "Loading orders...";

    try {
      const res = await fetch(`${backendURL}/orders`, {
        method: "GET",
        /*credentials: "include",*/
      });
      const orders = await res.json();
      console.log("Orders response:", orders);

      if (!res.ok || !orders) {
        if (statusDiv) statusDiv.textContent = "❌ Failed to load orders.";
        return;
      }

      if (orders.length === 0) {
        ordersBody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-gray-500">No orders found.</td></tr>`;
        if (statusDiv) statusDiv.textContent = "";
        return;
      }

      ordersBody.innerHTML = orders
        .map(
          (order) => `
                <tr class="border-b">
                  <td class="py-2 px-4 text-sm">${order._id}</td>
                  <td class="py-2 px-4 text-sm">${order.name}</td>
                  <td class="py-2 px-4 text-sm">${order.contact}</td>
                  <td class="py-2 px-4 text-sm">${order.houseNo}, ${order.Block}, ${order.Area}, ${order.city}</td>
                  <td class="py-2 px-4 text-sm">${order.paymentMethod}</td>
                  <td class="py-2 px-4 text-sm">Rs. ${order.totalAmount.toFixed(2)}</td>
                  <td class="py-2 px-4 text-sm">${new Date(order.createdAt).toLocaleDateString()}</td>
                  <td class="py-2 px-4 text-sm">
                    <button class="delete-btn bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700" data-id="${
                      order._id
                    }">Delete</button>
                  </td>
                  <td class="py-2 px-4 text-sm">
                    <a href="${backendURL}/orders/${order._id}/receipt" class="receipt-btn bg-gradient-to-r from-indigo-500 to-rose-500 text-white py-1 px-2 rounded hover:from-rose-500 hover:to-indigo-500" target="_blank">Download</a>
                  </td>
                </tr>
              `
        )
        .join("");
      if (statusDiv) statusDiv.textContent = "✅ Orders loaded successfully.";
    } catch (err) {
      console.error("Load orders error:", err);
      if (statusDiv)
        statusDiv.textContent = `❌ Error loading orders: ${err.message}`;
    }
  }

  // Handle delete button clicks
  if (document.getElementById("orders-body")) {
    document
      .getElementById("orders-body")
      .addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
          const orderId = e.target.dataset.id;
          if (!confirm(`Are you sure you want to delete order ${orderId}?`))
            return;

          const statusDiv = document.getElementById("orders-status");
          if (statusDiv) statusDiv.textContent = `Deleting order ${orderId}...`;

          try {
            const res = await fetch(`${backendURL}/orders/${orderId}`, {
              method: "DELETE",
              /*credentials: "include",*/
            });
            const result = await res.json();
            console.log("Delete order response:", result);

            if (res.ok && result.message === "Order deleted") {
              if (statusDiv)
                statusDiv.textContent = `✅ Order ${orderId} deleted successfully.`;
              loadOrders(); // Refresh table
            } else {
              if (statusDiv)
                statusDiv.textContent = `❌ Failed to delete order: ${
                  result.message || "Unknown error."
                }`;
            }
          } catch (err) {
            console.error("Delete order error:", err);
            if (statusDiv)
              statusDiv.textContent = `❌ Error deleting order: ${err.message}`;
          }
        }
      });

    // Load orders on page load
    loadOrders();
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
    // ============== Search Functionality ===============
  const searchResults = document.getElementById("searchResults");

  async function fetchProducts(query) {
    try {
      const res = await fetch(`${backendURL}/products`, {
        method: "GET",
      });
      const products = await res.json();
      console.log("Products fetched:", products);

      if (!res.ok || !products) {
        const errorMsg = `<p class="no-results">Failed to load products.</p>`;
        if (searchResults) searchResults.innerHTML = errorMsg;
        if (searchResults) searchResults.classList.add("show");
        return [];
      }

      // Filter products by name or category
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      console.error("Fetch products error:", err);
      const errorMsg = `<p class="no-results">Error: ${err.message}</p>`;
      if (searchResults) searchResults.innerHTML = errorMsg;
      if (searchResults) searchResults.classList.add("show");
      return [];
    }
  }

  function displayResults(products, resultsContainer) {
    if (resultsContainer) {
      if (products.length === 0) {
        resultsContainer.innerHTML = `<p class="no-results">No products found.</p>`;
        resultsContainer.classList.add("show");
        return;
      }

      resultsContainer.innerHTML = products
        .map(
          (product) => `
        <a href="" class="search-result block p-2 hover:bg-gray-200 flex items-center gap-2">
          <img src="${product.image || ""}" alt="${
            product.name
          }" class="w-10 h-10 object-cover rounded" onerror="this.style.display='none'">
          <div class="result-text">
            <p class="result-name">${product.name}</p>
            <p class="result-details">${
              product.category
            } - Rs. ${product.price.toFixed(2)}</p>
          </div>
        </a>
      `
        )
        .join("");
      resultsContainer.classList.add("show");
    }
  }

  async function handleSearch(query, resultsContainer) {
    if (query.length < 1) {
      if (resultsContainer) resultsContainer.classList.remove("show");
      return;
    }
    const products = await fetchProducts(query);
    displayResults(products, resultsContainer);
  }

  function setupSearch(input, results) {
    if (input && results) {
      input.addEventListener("input", (e) =>
        handleSearch(e.target.value.trim(), results)
      );
      input.addEventListener("focus", () => {
        if (input.value.trim().length >= 2) {
          handleSearch(input.value.trim(), results);
        }
      });
    }
  }

  setupSearch(searchInput, searchResults);

  document.addEventListener("click", (e) => {
    if (
      searchInput &&
      searchResults &&
      !searchInput.contains(e.target) &&
      !searchResults.contains(e.target)
    ) {
      searchResults.classList.remove("show");
    }
  });
  if(searchResults.classList.contains("show")) {
    const results = searchResults.querySelectorAll(".search-result");
    console.log("Search results:", results);
  }
});
