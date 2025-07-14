// For Hamburger
let cart = JSON.parse(localStorage.getItem("cart")) || {};
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
  // Shared Cart Logic Setup
  function setupCartForProduct(product) {
    const addToCartBtn = product.querySelector(".add-to-cart-button");
    const qtyControls = product.querySelector(".quantity-controls");
    const qtyDisplay = product.querySelector(".quantity");
    const increaseBtn = product.querySelector(".increase");
    const decreaseBtn = product.querySelector(".decrease");

    if (!addToCartBtn || !qtyControls || !qtyDisplay || !increaseBtn || !decreaseBtn) return;

    const productId = product.dataset.id;
    const productName = product.dataset.name;
    const productPrice = parseFloat(product.dataset.price);

    // ✅ Load cart from localStorage

    let quantity = cart[productId]?.quantity || 0;

    // ✅ If product is already in cart, show quantity controls
    if (quantity > 0) {
      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
    }

    // ➕ Add to Cart
    addToCartBtn.addEventListener("click", () => {
      quantity = 1;
      cart[productId] = { name: productName, price: productPrice, quantity };
      localStorage.setItem("cart", JSON.stringify(cart));
      const cartCount = getCartProductCount();
      const cartCountElement = document.getElementById("cart-count");
      if (cartCountElement) {
        cartCountElement.textContent = cartCount;
      } else {
        console.error("Cart count element not found");
      }
      addToCartBtn.style.display = "none";
      qtyControls.classList.add("active");
      qtyDisplay.textContent = quantity;
    });

    // ➕ Increase Quantity
    increaseBtn.addEventListener("click", () => {
      quantity++;
      cart[productId].quantity = quantity;
      localStorage.setItem("cart", JSON.stringify(cart));

      qtyDisplay.textContent = quantity;
      qtyDisplay.style.transform = "scale(1.2)";
      setTimeout(() => {
        qtyDisplay.style.transform = "scale(1)";
      }, 150);
    });

    // ➖ Decrease Quantity
    decreaseBtn.addEventListener("click", () => {
      quantity--;
      const cartCount = getCartProductCount();
      const cartCountElement = document.getElementById("cart-count");
      if (cartCountElement) {
        cartCountElement.textContent = cartCount;
      } else {
        console.error("Cart count element not found");
      }
      if (quantity <= 0) {
        delete cart[productId];
        localStorage.setItem("cart", JSON.stringify(cart));
        addToCartBtn.style.display = "inline-block";
        qtyControls.classList.remove("active");
        // Update cart count after removing item
        const updatedCartCount = getCartProductCount();
        if (cartCountElement) {
          cartCountElement.textContent = updatedCartCount;
        }
      } else {
        cart[productId].quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        qtyDisplay.textContent = quantity;

        qtyDisplay.style.transform = "scale(1.2)";
        setTimeout(() => {
          qtyDisplay.style.transform = "scale(1)";
        }, 150);
      }
    });
  }
  const select = document.getElementById("selector");

  select.addEventListener("change", function () {
    console.log("Fuction Run");
    const selectedPage = this.value;
    if (selectedPage) {
      console.log("selected page is running");
      select.selectedIndex = 0;
      window.location.href = selectedPage;
    }
  });
  function getCartProductCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    return Object.keys(cart).length;
  }
  const cartCount = getCartProductCount();
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  } else {
    console.error("Cart count element not found");
  }
  // Products are rendered dynamically, so we need to wait for the DOM to be ready
  // Check for null before using elements
  const container = document.getElementById("Product-grid");
  const mostSellContainer = document.getElementById("most-sell-products");
  if (!container && !mostSellContainer) return;
  // Fetch products from the server

  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((products) => {
      const category = document.body.dataset.category;

      const filtered = products.filter(
        (p) => p.category === category && !!p.available
      );
      const mostSelling = products.filter((p) => p.mostSell && p.available);

      mostSelling.forEach((product) => {
        const basePrice = parseFloat(product.price);

        const discountValue =
          typeof product.discount === "string"
            ? parseFloat(product.discount)
            : product.discount || 0;
        const discountedPrice = Math.round(
          basePrice - (basePrice * discountValue) / 100
        );

        const div = document.createElement("div");
        div.className = "Product";
        div.dataset.id = product.id;
        div.dataset.name = product.name;
        div.dataset.price = basePrice;

        div.innerHTML = `
        <div class="discount">${product.discount || 0}%</div>
        <img src="/uploads/${product.image}" alt="${product.name}" />
        <div class="Product-name">${product.name}</div>
        <span class="price">Rs.${basePrice}</span>
        <span class="dicounted-price">Rs.${discountedPrice}</span>
        <button class="add-to-cart-button">Add to Cart</button>
        <div class="quantity-controls">
          <button class="decrease">−</button>
          <span class="quantity">1</span>
          <button class="increase">+</button>
        </div>
      `;

        mostSellContainer.appendChild(div);
      });

      filtered.forEach((product) => {
        const basePrice = parseFloat(product.price);
        const discountValue =
          typeof product.discount === "string"
            ? parseFloat(product.discount)
            : product.discount || 0;
        const discountedPrice = Math.round(
          basePrice - (basePrice * discountValue) / 100
        );

        const div = document.createElement("div");
        div.className = "Product";
        div.dataset.id = product.id;
        div.dataset.name = product.name;
        div.dataset.price = basePrice;

        div.innerHTML = `
          <div class="discount">${discountValue}%</div>
          <img src="/uploads/${product.image}" alt="${product.name}" />
          <div class="Product-name">${product.name}</div>
          <span class="price">Rs.${basePrice}</span>
          <span class="dicounted-price">Rs.${discountedPrice}</span>
          <button class="add-to-cart-button">Add to Cart</button>
          <div class="quantity-controls">
            <button class="decrease">−</button>
            <span class="quantity">1</span>
            <button class="increase">+</button>
          </div>
        `;

        container.appendChild(div);
      });

      // Only call setupCartForProduct after rendering
      document.querySelectorAll(".Product").forEach(setupCartForProduct);
    })
    .catch((err) => {
      console.error("Error loading products:", err);
    });

  const cartItemsTbody = document.getElementById("cart-items");
  const orderIdSpan = document.getElementById("order-id");
  const Quantity = document.getElementById("Quantity-heading");
  const cartSummary = document.getElementById("cart-summary");
  const cartTable = document.getElementById("cart-table");
  const cartHeadings = document.getElementById("summary-headings");
  const totalRow = document.getElementById("total");
  const totalColumn = document.getElementById("totalColumn");

  let subtotal = 0;
  let total = 0;
  cartItemsTbody.innerHTML = "";

  Object.keys(cart).forEach((id) => {
    const item = cart[id];
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

    // Add delete button event
    const deleteBtn = row.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      delete cart[id];
      localStorage.setItem("cart", JSON.stringify(cart));
      location.reload();
    });

    cartItemsTbody.appendChild(row);
  });

  // ======= SYNC COLUMNS WIDTH
  function syncColumnWidths() {
    // Get first row of cartTable
    const cartTableRow = cartTable.rows[0];
    // Sum width of first three columns
    const width1 = cartTableRow.cells[0].getBoundingClientRect().width;
    const width2 = cartTableRow.cells[1].getBoundingClientRect().width;
    const width3 = cartTableRow.cells[2].getBoundingClientRect().width;
    const totalWidth = width1 + width2 + width3;

    // Apply the calculated width
    cartHeadings.style.width = totalWidth + "px";
    totalColumn.style.width = totalWidth + "px";
  }

  // Run on load and on resize
  window.addEventListener("load", syncColumnWidths);
  window.addEventListener("resize", syncColumnWidths);

  //  ======== ADDING CART SUMMARY
  let deliveryCharges = 0;
  if (subtotal != 0) {
    deliveryCharges = 150;
  }
  total = subtotal + deliveryCharges;
  const deliveryCell = document.getElementById("delivery-charges");

  const Summaryrow = document.createElement("tr");
  Summaryrow.innerHTML = ` 
        <td id="summary-headings">Sub-total :</td>
        <td id="summary-data">Rs.${subtotal}</td>
  `;
  deliveryCell.innerHTML = `Rs.${deliveryCharges}`;
  cartSummary.prepend(Summaryrow);
  const Row = document.createElement("tr");
  Row.innerHTML = ` 
        <td id="summary-headings">Total :</td>
        <td id="summary-data">Rs.${total}</td>
      
  `;
  totalRow.appendChild(Row);
  const smallScreenQuery = window.matchMedia("(max-width:768px)");
  function changeQuantityText() {
    if (smallScreenQuery.matches && Quantity) {
      Quantity.textContent = "Qty.";
    }
  }
  changeQuantityText();
  document.querySelectorAll(".qty-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const isIncrease = button.classList.contains("increase");
      const cart = JSON.parse(localStorage.getItem("cart")) || {};
      const item = cart[id];

      if (!item) return;

      // Update quantity
      item.quantity += isIncrease ? 1 : -1;

      // If quantity is 0, remove item
      if (item.quantity <= 0) {
        delete cart[id];
      } else {
        cart[id] = item;
      }

      // Save and reload
      localStorage.setItem("cart", JSON.stringify(cart));
      location.reload();
    });
  });
  // ORDER ID
  function generateOrderId() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 0-based
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Optional: Add milliseconds for extra uniqueness
    const ms = String(now.getMilliseconds()).padStart(3, "0");

    return `MYR-${day}${month}${year}-${hours}${minutes}${seconds}${ms}`;
  }

  let orderId = localStorage.getItem("orderId");
  const cartArray = JSON.parse(localStorage.getItem("cart")) || {};
  const hasItem = Object.keys(cartArray).length > 0;
  if (hasItem) {
    if (!orderId) {
      orderId = generateOrderId();
    }
  } else {
    orderId = generateOrderId();
  }
  localStorage.setItem("orderId", orderId);
  orderIdSpan.textContent = orderId;

  const placeOrderBtn = document.getElementById("place-order");
  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const hasItem = Object.keys(cart).length > 0;

    if (hasItem) {
      window.location.href = "checkout.html";
    } else {
      alert("Your Cart is Empty. Please add items before placing an Order");
    }
  });

  // Utility: Get total number of products in cart (not quantity, just count of unique products)
});
