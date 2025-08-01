const backendURL = "https://myr-backend-7nx6.onrender.com";
const githubBase = "https://sheikhmaazraheel.github.io/MYR-Surgical";

// For Hamburger
const myrcart = JSON.parse(localStorage.getItem("myrcart")) || {};
const hamburger = document.getElementById("hamburger");
const dropdown = document.getElementById("mobile-dropdown");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  dropdown.classList.toggle("show");

  const select = document.getElementById("productSelect");

  select.addEventListener("change", function () {
    const selectedPage = this.value;
    if (selectedPage) {
      window.location.href = selectedPage;
    }
  });
});

// ============== Rendering Products ===============
document.addEventListener("DOMContentLoaded", () => {
  const myrcart = JSON.parse(localStorage.getItem("myrcart")) || {};
  const container = document.getElementById("Product-grid");
  const mostSellContainer = document.getElementById("most-sell-products");
  const cartCountElement = document.getElementById("cart-count");
  const select = document.getElementById("selector");

  if (select) {
    select.addEventListener("change", () => {
      const selectedPage = select.value;
      if (selectedPage) {
        select.selectedIndex = 0;
        window.location.href = selectedPage;
      }
    });
  }

  // ✅ Utility Functions
  function getCartProductCount() {
    return Object.keys(myrcart).length;
  }

  function updateCartStorage() {
    localStorage.setItem("myrcart", JSON.stringify(myrcart));
    if (cartCountElement) {
      cartCountElement.textContent = getCartProductCount();
    }
  }

  function toggleSelection(e, selectorClass, selectedClass) {
    const parent = e.target.closest(`.${selectorClass}`);
    if (!parent) return;
    parent
      .querySelectorAll(`.${selectedClass}`)
      .forEach((btn) => btn.classList.remove(selectedClass));
    e.target.classList.add(selectedClass);
  }

  // ✅ Set up individual product's cart logic
  function setupCartForProduct(productEl) {
    const sizeBtns = productEl.querySelectorAll(".size-btn");
    const colorBtns = productEl.querySelectorAll(".color-swatch");
    const addToCartBtn = productEl.querySelector(".add-to-cart-button");
    const qtyControls = productEl.querySelector(".quantity-controls");
    const qtyDisplay = productEl.querySelector(".quantity");
    const increaseBtn = productEl.querySelector(".increase");
    const decreaseBtn = productEl.querySelector(".decrease");

    const id = productEl.dataset.id;
    const name = productEl.dataset.name;
    const price = parseFloat(productEl.dataset.price);

    if (!addToCartBtn || !qtyControls || !qtyDisplay) return;

    let quantity = myrcart[id]?.quantity;

    if (quantity > 0) {
      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
    }

    // Add to Cart Logic
    addToCartBtn.addEventListener("click", () => {
      const selectedSizeBtn = productEl.querySelector(
        ".size-btn.selected-size"
      );
      const selectedColorBtn = productEl.querySelector(
        ".color-swatch.selected-color"
      );

      if (sizeBtns.length > 0 && !selectedSizeBtn) {
        alert("Please select a size.");
        return;
      }

      if (colorBtns.length > 0 && !selectedColorBtn) {
        alert("Please select a color.");
        return;
      }

      quantity = 1;
      myrcart[id] = {
        name,
        price,
        quantity,
        selectedSize: selectedSizeBtn?.dataset.size || null,
        selectedColor: selectedColorBtn?.dataset.color || null,
      };

      updateCartStorage();
      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
    });

    // Quantity Controls
    increaseBtn?.addEventListener("click", () => {
      quantity++;
      myrcart[id].quantity = quantity;
      updateCartStorage();
      qtyDisplay.textContent = quantity;
      qtyDisplay.style.transform = "scale(1.2)";
      setTimeout(() => (qtyDisplay.style.transform = "scale(1)"), 150);
    });

    decreaseBtn?.addEventListener("click", () => {
      quantity--;
      if (quantity <= 0) {
        delete myrcart[id];
        updateCartStorage();
        addToCartBtn.style.display = "inline-block";
        qtyControls.classList.remove("active");
      } else {
        myrcart[id].quantity = quantity;
        updateCartStorage();
        qtyDisplay.textContent = quantity;
        qtyDisplay.style.transform = "scale(1.2)";
        setTimeout(() => (qtyDisplay.style.transform = "scale(1)"), 150);
      }
    });
  }

  // ✅ Event Delegation for Selection (CSS toggle)
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("size-btn")) {
      toggleSelection(e, "size-options", "selected-size");
    }

    if (e.target.classList.contains("color-swatch")) {
      toggleSelection(e, "color-options", "selected-color");
    }
  });

  // ✅ Initial Cart Count Setup
  if (cartCountElement) {
    cartCountElement.textContent = getCartProductCount();
  }
    function showShimmerLoader(container) {
    if (!container) return;
    // Check if loader already exists to avoid duplicates
    
    
      const loader = document.createElement("div");
      loader.className = "shimmer-loader";
      loader.innerHTML = `
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
        <div class="shimmer-box"></div>
      `;
      const paragraph = document.createElement("p");
      paragraph.style.textAlign = "center";
      paragraph.textContent = "Loading products, please wait...";
      paragraph.style.fontSize = "1.2rem";
      paragraph.style.width = "100%";
      paragraph.style.color = "#f43f5e";
      container.parentNode.insertBefore(loader, container);
      container.parentNode.insertBefore(paragraph, container);
    loader.style.display = "grid";
  }

  function hideShimmerLoader(container) {
    if (!container) return;
    const loader = container.querySelector(".shimmer-loader");
    if (loader) {
      loader.remove();
    }
  }
  if (container || mostSellContainer) {
    // Show shimmer loaders
    showShimmerLoader(container);
    showShimmerLoader(mostSellContainer);

    // Create a promise that resolves after 2 seconds
    const minLoaderTime = new Promise((resolve) => setTimeout(resolve, 2000));

    // Fetch products
    const fetchProducts = fetch(`${backendURL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((products) => {
        const category = document.body.dataset.category;
        const filtered = category
          ? products.filter((p) => p.category === category && !!p.available)
          : products.filter((p) => !!p.available); // No filtering on index.html
        const mostSelling = products.filter((p) => p.mostSell && !!p.available);

        function renderProducts(list, container) {
          list.forEach((product, index) => {
            const div = document.createElement("div");
            const basePrice = parseFloat(product.price);
            const discount = parseFloat(product.discount) || 0;
            const finalPrice = Math.round(
              basePrice - (basePrice * discount) / 100
            );

            div.className = "Product opacity-0 transition-all duration-500";
            div.id = `${product.id}`;
            div.dataset.id = product.id;
            div.dataset.name = product.name;
            div.dataset.price = finalPrice;

            const hasOptions =
              (product.sizes?.length || 0) > 0 ||
              (product.colors?.length || 0) > 0;
            const sizeHTML =
              product.sizes
                ?.map(
                  (size) =>
                    `<button class="size-btn px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100 transition" data-size="${size}">${size}</button>`
                )
                .join("") || "";
            const colorHTML =
              product.colors
                ?.map(
                  (color) =>
                    `<button class="color-swatch w-5 h-5 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform" style="background-color: ${color}" data-color="${color}" title="${color}"></button>`
                )
                .join("") || "";

            div.innerHTML = `
              <div class="discount">${product.discount || 0}%</div>
              <img src="${product.image}" alt="${product.name}" />
              <div class="Product-name">${product.name}</div>
              <div><span class="price">Rs.${basePrice}</span> <span class="dicounted-price">Rs.${finalPrice}</span></div>
              ${
                hasOptions
                  ? `
              <div class="size-color-row flex flex-col gap-2 mt-2">
                ${
                  sizeHTML
                    ? `<div class="option-group"><div class="option-label text-sm font-semibold">Size:</div><div class="size-options flex gap-2 mt-1">${sizeHTML}</div></div>`
                    : ""
                }
                ${
                  colorHTML
                    ? `<div class="option-group"><div class="option-label text-sm font-semibold">Color:</div><div class="color-options flex gap-2 mt-1">${colorHTML}</div></div>`
                    : ""
                }
              </div>`
                  : ""
              }
              <button class="add-to-cart-button">Add to Cart</button>
              <div class="quantity-controls">
                <button class="decrease">−</button>
                <span class="quantity">1</span>
                <button class="increase">+</button>
              </div>
            `;

            container.appendChild(div);
            setupCartForProduct(div);

            // Animate product entry
            setTimeout(() => {
              div.style.opacity = "1";
              div.style.transform = "scale(1)";
            }, index * 100);
          });
        }

        return { filtered, mostSelling };
      });

    // Wait for both fetch and minimum loader time
    Promise.all([fetchProducts, minLoaderTime])
      .then(([{ filtered, mostSelling }]) => {
        // Hide loaders after both promises resolve
        hideShimmerLoader(container);
        hideShimmerLoader(mostSellContainer);

        // Render products
        if (container) renderProducts(filtered, container);
        if (mostSellContainer) renderProducts(mostSelling, mostSellContainer);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        hideShimmerLoader(container);
        hideShimmerLoader(mostSellContainer);
      });
  }
  const cartItemsTbody = document.getElementById("cart-items");
  const orderIdSpan = document.getElementById("order-id");
  const quantityHeading = document.getElementById("Quantity-heading");
  const cartSummary = document.getElementById("cart-summary");
  const cartTable = document.getElementById("cart-table");
  const cartHeadings = document.getElementById("summary-headings");
  const totalRow = document.getElementById("total");
  const totalColumn = document.getElementById("totalColumn");
  const checkoutForm = document.getElementById("checkout-form");

  let subtotal = 0;
  let deliveryCharges = 0;
  let total = 0;

  if (cartTable) {
    cartItemsTbody.innerHTML = "";

    Object.entries(myrcart).forEach(([id, item]) => {
      const price = item.price || 0;
      const qty = item.quantity || 0;
      const amount = price * qty;
      subtotal += amount;

      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${item.name || "Unnamed"}</td>
      <td>${price}</td>
      <td class="qty-cell">
        <button class="qty-btn decrease" data-id="${id}">−</button>
        <span class="quantity" id="qty-${id}">${qty}</span>
        <button class="qty-btn increase" data-id="${id}">+</button>
      </td>
      <td>${amount}</td>
      <td>
        <button class="delete-btn" data-id="${id}" title="Remove from cart">
          <svg class="delete-svgIcon" viewBox="0 0 448 512">
            <path
              d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z">
            </path>
          </svg>  
        </button>
      </td>
    `;

      row.querySelector(".delete-btn").addEventListener("click", () => {
        delete myrcart[id];
        localStorage.setItem("myrcart", JSON.stringify(myrcart));
        location.reload();
      });

      cartItemsTbody.appendChild(row);
    });

    // Width Sync
    const syncColumnWidths = () => {
      const row = cartTable.rows[0];
      const widthSum =
        row.cells[0].offsetWidth +
        row.cells[1].offsetWidth +
        row.cells[2].offsetWidth;
      cartHeadings.style.width = totalColumn.style.width = `${widthSum}px`;
    };
    window.addEventListener("load", syncColumnWidths);
    window.addEventListener("resize", syncColumnWidths);

    // Delivery + Totals
    if (subtotal > 0) deliveryCharges = 150;
    total = subtotal + deliveryCharges;

    const deliveryCell = document.getElementById("delivery-charges");
    deliveryCell.textContent = `Rs.${deliveryCharges}`;

    cartSummary.insertAdjacentHTML(
      "afterbegin",
      `<tr><td id="summary-headings">Sub-total :</td><td id="summary-data">Rs.${subtotal}</td></tr>`
    );
    totalRow.innerHTML = `
    <tr>
      <td id="summary-headings">Total :</td>
      <td id="summary-data">Rs.${total}</td>
    </tr>
  `;

    // Mobile Text Fix
    if (window.matchMedia("(max-width:768px)").matches && quantityHeading) {
      quantityHeading.textContent = "Qty.";
    }

    // Quantity Control
    document.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const isIncrease = button.classList.contains("increase");

        if (!myrcart[id]) return;

        myrcart[id].quantity += isIncrease ? 1 : -1;

        if (myrcart[id].quantity <= 0) {
          delete myrcart[id];
        }

        localStorage.setItem("myrcart", JSON.stringify(myrcart));
        location.reload();
      });
    });
    let myrorderId = localStorage.getItem("myrorderId");
  if (Object.keys(myrcart).length) {
    if (!myrorderId) {
      myrorderId = generateOrderId();
    }
    localStorage.setItem("myrorderId", myrorderId);
  }
  orderIdSpan.textContent = myrorderId;

  }
  // Generate Order ID
  function generateOrderId() {
    const now = new Date();
    const pad = (val) => String(val).padStart(2, "0");
    return `MYR-${pad(now.getDate())}${pad(
      now.getMonth() + 1
    )}${now.getFullYear()}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds()
    )}${String(now.getMilliseconds()).padStart(3, "0")}`;
  }

  
  // Checkout button navigation
  const placeOrderBtn = document.getElementById("place-order");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      if (Object.keys(myrcart).length > 0) {
        window.location.href = "checkout.html";
      } else {
        alert("Your cart is empty. Please add items first.");
      }
    });
  }

  // ============== Search Functionality ===============
  const searchInput = document.getElementById("searchInput");
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
        <a href="${githubBase}/${product.category}#${
            product.id
          }" class="block p-2 hover:bg-gray-200 flex items-center gap-2">
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
});
