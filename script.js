const backendURL = "https://myr-backend-7nx6.onrender.com";
const githubBase = "https://sheikhmaazraheel.github.io/MYR-Surgical";

// For Hamburger
const myrcart = JSON.parse(localStorage.getItem("myrcart")) || {};
const hamburger = document.getElementById("hamburger");
const dropdown = document.getElementById("mobile-dropdown");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  dropdown.classList.toggle("show");

  const select = document.getElementById("selector");
  if (select) {
    select.addEventListener("change", function () {
      const selectedPage = this.value;
      if (selectedPage) {
        window.location.href = selectedPage;
      }
    });
  }
});

// ============== Rendering Products ===============
document.addEventListener("DOMContentLoaded", () => {
  // ================= POPUP LOGIC =================
  function showProductPopup(product) {
    const popup = document.getElementById("product-popup");
    const popupBody = popup.querySelector(".popup-body");
    if (!popup || !popupBody) return;

    // Calculate price and discount
    const basePrice = parseFloat(product.price);
    const discount = parseFloat(product.discount) || 0;
    const finalPrice = Math.round(basePrice - discount);
    const discountPercent = basePrice
      ? Math.round((discount / basePrice) * 100)
      : 0;

    // Images array for carousel
    const imagesArr =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

    // Carousel HTML
    let carouselHTML = `<div class="image-carousel" style="position:relative;text-align:center;">
      <button class="carousel-btn prev-btn" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);z-index:2;background:#fff;color:black;border:none;border-radius:50%;width:32px;height:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:1.5rem;cursor:pointer;"><</button>
      <div class="carousel-images" style="display:inline-block;max-width:100%;max-height:260px;">
        ${imagesArr
          .map(
            (img, idx) =>
              `<img src="${img}" alt="${product.name} - ${
                idx + 1
              }" style="max-width:100%;max-height:260px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:16px;display:${
                idx === 0 ? "block" : "none"
              };" class="carousel-img${idx === 0 ? " active" : ""}" />`
          )
          .join("")}
      </div>
      <button class="carousel-btn next-btn" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:2;background:#fff;color:black;border:none;border-radius:50%;width:32px;height:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:1.5rem;cursor:pointer;">></button>
    </div>`;

    popupBody.innerHTML = `
      ${carouselHTML}
      <div class="popup-details-section" style="padding:0 12px;">
        <div class="popup-product-name" style="font-size:1.3rem;font-weight:600;color:#222;margin-bottom:8px;">${
          product.name
        }</div>
        <div class="popup-product-price" style="font-size:1.1rem;margin-bottom:8px;">
          <span style="color:#6366f1;font-weight:700;">Rs.${finalPrice}</span>
          ${
            discount
              ? `<span style="text-decoration:line-through;color:#888;margin-left:8px;">Rs.${basePrice}</span> <span style="color:#f43f5e;font-weight:600;margin-left:8px;">${discountPercent}% OFF</span>`
              : ""
          }
        </div>
        <div class="popup-product-description product-description" style="margin-bottom:12px;">${
          product.description ? product.description : "No description provided."
        }</div>
        <div class="popup-cart-controls" style="margin-bottom:12px;">
          <button class="add-to-cart-button">Add to Cart</button>
          <div class="quantity-controls">
            <button class="decrease">−</button>
            <span class="quantity">1</span>
            <button class="increase">+</button>
          </div>
        </div>
      </div>
    `;

    // Carousel logic
    let currentImageIndex = 0;
    const carouselImgs = popupBody.querySelectorAll(".carousel-img");
    const prevBtn = popupBody.querySelector(".prev-btn");
    const nextBtn = popupBody.querySelector(".next-btn");
    function updateCarousel() {
      carouselImgs.forEach((img, idx) => {
        img.style.display = idx === currentImageIndex ? "block" : "none";
        img.classList.toggle("active", idx === currentImageIndex);
      });
    }
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentImageIndex > 0) {
        currentImageIndex--;
      } else {
        currentImageIndex = imagesArr.length - 1;
      }
      updateCarousel();
    });
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentImageIndex < imagesArr.length - 1) {
        currentImageIndex++;
      } else {
        currentImageIndex = 0;
      }
      updateCarousel();
    });

    // Cart logic for popup
    let quantity = 1;
    const addToCartBtn = popupBody.querySelector(".add-to-cart-button");
    const qtyControls = popupBody.querySelector(".quantity-controls");
    const qtyDisplay = popupBody.querySelector(".quantity");
    const increaseBtn = popupBody.querySelector(".increase");
    const decreaseBtn = popupBody.querySelector(".decrease");

    qtyDisplay.textContent = quantity;
    increaseBtn.addEventListener("click", () => {
      quantity++;
      qtyDisplay.textContent = quantity;
      qtyDisplay.style.transform = "scale(1.2)";
      setTimeout(() => (qtyDisplay.style.transform = "scale(1)"), 150);
    });
    decreaseBtn.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        qtyDisplay.textContent = quantity;
        qtyDisplay.style.transform = "scale(1.2)";
        setTimeout(() => (qtyDisplay.style.transform = "scale(1)"), 150);
      }
    });

    addToCartBtn.addEventListener("click", () => {
      // Use discounted price
      myrcart[product.id] = {
        name: product.name,
        price: finalPrice,
        quantity: quantity,
      };
      updateCartStorage();
      // Show cart popup
      const cartPopup = document.getElementById("cart-popup");
      if (!cartPopup.classList.contains("show")) {
        cartPopup.classList.add("show-before");
        updateCartPopup();
        setTimeout(() => {
          cartPopup.classList.remove("show-before");
          cartPopup.classList.add("show");
        }, 200);
      } else {
        updateCartPopup();
      }
      popup.style.display = "none";
    });

    popup.style.display = "flex";
    // Close logic
    const closeBtn = popup.querySelector(".close-btn");
    if (closeBtn) {
      // Remove previous listeners to avoid stacking
      closeBtn.onclick = null;
      closeBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        popup.style.display = "none";
      });
    }
    popup.onclick = function(e) {
      if (e.target === popup) popup.style.display = "none";
    };
  }

  // Attach click event to product cards to show popup
  function attachProductPopup(list, container) {
    container.querySelectorAll(".Product").forEach((card, idx) => {
      card.addEventListener("click", (e) => {
        // Prevent click on cart controls from opening popup
        if (
          e.target.closest(
            ".add-to-cart-button, .quantity-controls, .size-btn, .color-swatch"
          )
        )
          return;
        showProductPopup(list[idx]);
      });
    });
  }
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
    // Sum all quantities in cart
    return Object.values(myrcart).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
  }

  function getCartTotal() {
    // Sum total price for all items
    return Object.values(myrcart).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  }

  function updateCartStorage() {
    localStorage.setItem("myrcart", JSON.stringify(myrcart));
    if (cartCountElement) {
      cartCountElement.textContent = getCartProductCount();
    }
    updateCartPopup();
  }

  function updateCartPopup() {
    const popupCount = document.querySelector(".popupCartCount");
    const popupTotal = document.querySelector(".popupCartTotal");
    if (popupCount) popupCount.textContent = getCartProductCount();
    if (popupTotal) popupTotal.textContent = `Rs.${getCartTotal().toFixed(2)}`;
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
    productEl.addEventListener("click", (e) => {
      if (
        !e.target.closest(
          ".add-to-cart-button, .quantity-controls, .size-btn, .color-swatch"
        )
      ) {
        // Popup Variables
        const popup = document.getElementById("product-popup");
        const closeBtn = document.querySelector(".close-btn");
        const prevBtn = document.querySelector(".prev-btn");
        const nextBtn = document.querySelector(".next-btn");
        let currentImageIndex = 0;
        let images = [];
        let currentProduct = null;

        // Open Popup on Product Click
        document.querySelectorAll(".product").forEach((productEl) => {
          // Adjust selector if needed (e.g., .product-card)
          productEl.addEventListener("click", (e) => {
            if (
              e.target.closest(
                ".add-to-cart-button, .quantity-controls, .size-btn, .color-swatch"
              )
            )
              return;

            currentProduct = {
              id: productEl.dataset.id,
              name: productEl.dataset.name,
              description: productEl.dataset.description || "",
              price: parseFloat(productEl.dataset.price || 0),
              discount: parseFloat(productEl.dataset.discount || 0),
              images: JSON.parse(productEl.dataset.images || "[]"),
            };

            // Populate Details
            document.getElementById("product-name").textContent =
              currentProduct.name;
            const originalPriceEl = document.getElementById(
              "product-original-price"
            );
            const discountedPriceEl = document.getElementById(
              "product-discounted-price"
            );
            if (currentProduct.discount > 0) {
              originalPriceEl.textContent = `Rs. ${currentProduct.price.toFixed(
                2
              )}`;
              const discountedPrice =
                currentProduct.price * (1 - currentProduct.discount / 100);
              discountedPriceEl.textContent = `Rs. ${discountedPrice.toFixed(
                2
              )}`;
            } else {
              originalPriceEl.textContent = "";
              discountedPriceEl.textContent = `Rs. ${currentProduct.price.toFixed(
                2
              )}`;
            }
            document.getElementById("product-description").textContent =
              currentProduct.description;

            // Load Images
            images = currentProduct.images;
            const carouselImages = document.querySelector(".carousel-images");
            carouselImages.innerHTML = "";
            images.forEach((src, index) => {
              const img = document.createElement("img");
              img.src = src || "./images/placeholder.jpg";
              img.alt = `${currentProduct.name} - Image ${index + 1}`;
              img.classList.toggle("active", index === 0);
              carouselImages.appendChild(img);
            });

            popup.style.display = "flex";
            currentImageIndex = 0;
          });
        });

        // Close Popup
        closeBtn.addEventListener(
          "click",
          () => (popup.style.display = "none")
        );
        popup.addEventListener("click", (e) => {
          if (e.target === popup) popup.style.display = "none";
        });

        // Carousel Navigation
        prevBtn.addEventListener("click", () => {
          if (currentImageIndex > 0) {
            currentImageIndex--;
            updateCarousel();
          }
        });
        nextBtn.addEventListener("click", () => {
          if (currentImageIndex < images.length - 1) {
            currentImageIndex++;
            updateCarousel();
          }
        });

        function updateCarousel() {
          document
            .querySelectorAll(".carousel-images img")
            .forEach((img, index) => {
              img.classList.toggle("active", index === currentImageIndex);
            });
        }

        // Add to Cart from Popup
        document
          .getElementById("popup-add-to-cart")
          .addEventListener("click", () => {
            if (currentProduct) {
              const productEl = document.querySelector(
                `[data-id="${currentProduct.id}"]`
              );
              if (productEl) {
                // Use existing cart logic from script.js
                setupCartForProduct(productEl); // Assumes this updates quantity and adds to cart
                alert(`${currentProduct.name} added to cart!`);
              }
              popup.style.display = "none";
            }
          });
      }
    });

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
      const cartPopup = document.getElementById("cart-popup");
      if (!cartPopup.classList.contains("show")) {
        cartPopup.classList.add("show-before");
        updateCartPopup();

        setTimeout(() => {
          cartPopup.classList.remove("show-before");
          cartPopup.classList.add("show");
        }, 200);
      } else {
        updateCartPopup();
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
      updateCartPopup();
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
        if (Object.keys(myrcart).length === 0) {
          const cartPopup = document.getElementById("cart-popup");
          if (cartPopup.classList.contains("show")) {
            cartPopup.classList.remove("show");
          }
        } else {
          updateCartPopup();
        }
      } else {
        myrcart[id].quantity = quantity;
        updateCartStorage();
        qtyDisplay.textContent = quantity;
        qtyDisplay.style.transform = "scale(1.2)";
        setTimeout(() => (qtyDisplay.style.transform = "scale(1)"), 150);
        updateCartPopup();
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
      `;
    const paragraph = document.createElement("p");
    paragraph.id = "loading-text";
    paragraph.style.textAlign = "center";
    paragraph.textContent = "Loading products, please wait...";
    paragraph.style.fontSize = "1.4rem";
    paragraph.style.width = "100%";
    paragraph.style.color = "#f43f5e";
    container.parentNode.insertBefore(loader, container);
    container.parentNode.insertBefore(paragraph, container);
    loader.style.display = "grid";
  }

  function hideShimmerLoader(container) {
    const loader = document.querySelector(".shimmer-loader");
    loader.style.display = "none";
    const paragraph = document.getElementById("loading-text");
    paragraph.remove();
    loader.remove();
  }

  // ✅ Render Products
  function renderProducts(list, container) {
    list.forEach((product, index) => {
      const div = document.createElement("div");
      // Select first valid image from images array, fallback to product.image
      let imgSrc = "";
      if (Array.isArray(product.images) && product.images.length > 0) {
        imgSrc =
          product.images.find(
            (img) => !!img && typeof img === "string" && img.trim() !== ""
          ) || "";
      } else if (
        product.image &&
        typeof product.image === "string" &&
        product.image.trim() !== ""
      ) {
        imgSrc = product.image;
      }

      const basePrice = parseFloat(product.price);
      const discount = parseFloat(product.discount) || 0;
      const finalPrice = Math.round(basePrice - discount);
      const discountpercent = Math.round((discount / basePrice) * 100);

      div.className = "Product opacity-0 transition-all duration-500";
      div.id = `${product.id}`;
      div.dataset.id = product.id;
      div.dataset.name = product.name;
      div.dataset.price = finalPrice;
      div.dataset.images = JSON.stringify(product.images || []);

      const hasOptions =
        (product.sizes?.length || 0) > 0 || (product.colors?.length || 0) > 0;
      const sizeHTML =
        product.sizes
          ?.map(
            (size) =>
              `<button class="size-btn" data-size="${size}">${size}</button>`
          )
          .join("") || "";
      const colorHTML =
        product.colors
          ?.map(
            (color) =>
              `<button class="color-swatch" style="background-color: ${color}" data-color="${color}" title="${color}"></button>`
          )
          .join("") || "";
      if (product.discount != 0) {
        div.innerHTML = `
          <div class="discount">${discountpercent || 0}%</div>
            <img src="${imgSrc}" alt="${
          product.name
        }" class="product-image" onerror="this.src='./images/placeholder.jpg'">
          <div class="Product-name">${product.name}</div>
          <div><span class="price">Rs.${basePrice}</span> <span class="dicounted-price">Rs.${finalPrice}</span></div>
          <div class="product-description" style="margin-top:8px;font-size:0.8rem;color:#444;background:#f8fafc;padding:8px;border-radius:6px;min-height:40px;">${
            product.description
              ? product.description
              : "No description provided."
          }</div>
          ${
            hasOptions
              ? `
          <div class="size-color-row">
            ${
              sizeHTML
                ? `<div class="option-group"><div class="option-label">Size:</div><div class="size-options">${sizeHTML}</div></div>`
                : ""
            }
            ${
              colorHTML
                ? `<div class="option-group"><div class="option-label">Color:</div><div class="color-options">${colorHTML}</div></div>`
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
      } else {
        div.innerHTML = `
            <img src="${imgSrc}" alt="${
          product.name
        }" class="product-image" onerror="this.src='./images/placeholder.jpg'">
          <div class="Product-name">${product.name}</div>
          <div><span class="dicounted-price">Rs.${finalPrice}</span></div>
      <div class="product-description" style="margin-top:8px;font-size:0.8rem;color:#444;background:#f8fafc;padding:8px;border-radius:6px;min-height:40px;">${
        product.description ? product.description : "No description provided."
      }</div>
          ${
            hasOptions
              ? `
          <div class="size-color-row">
            ${
              sizeHTML
                ? `<div class="option-group"><div class="option-label">Size:</div><div class="size-options">${sizeHTML}</div></div>`
                : ""
            }
            ${
              colorHTML
                ? `<div class="option-group"><div class="option-label">Color:</div><div class="color-options">${colorHTML}</div></div>`
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
      }
      const descEl = div.querySelector(".product-description");
      if (descEl && product.description && product.description.length > 100) {
        descEl.addEventListener("click", (e) => {
          e.stopPropagation(); // prevent opening product popup directly
          // Reuse existing popup
          showProductPopup(product);
        });
      }
      container.appendChild(div);
      setupCartForProduct(div);

      // Animate product entry
      setTimeout(() => {
        div.style.opacity = "1";
        div.style.transform = "scale(1)";
      }, index * 100);
    });
    attachProductPopup(list, container);
  }

  // ✅ Fetch & Render Products with Minimum 2-Second Loader
  if (container || mostSellContainer) {
    // Show shimmer loaders
    if (container) showShimmerLoader(container);
    if (mostSellContainer) showShimmerLoader(mostSellContainer);

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
          : products.filter((p) => !!p.available);
        const mostSelling = products.filter((p) => p.mostSell && !!p.available);

        return { filtered, mostSelling };
      });

    // Wait for both fetch and minimum loader time
    Promise.all([fetchProducts, minLoaderTime])
      .then(([{ filtered, mostSelling }]) => {
        // Hide loaders after both promises resolve
        if (container) hideShimmerLoader(container);
        if (mostSellContainer) hideShimmerLoader(mostSellContainer);

        // Render products
        if (container) {
          renderProducts(filtered, container);
          // Show cart popup if cart contains items
          if (Object.keys(myrcart).length > 0) {
            const cartPopup = document.getElementById("cart-popup");
            if (!cartPopup.classList.contains("show")) {
              cartPopup.classList.add("show-before");
              updateCartPopup();
              setTimeout(() => {
                cartPopup.classList.remove("show-before");
                cartPopup.classList.add("show");
              }, 200);
            }
          }
        }
        if (mostSellContainer) {
          renderProducts(mostSelling, mostSellContainer);
          // Show cart popup if cart contains items
          if (Object.keys(myrcart).length > 0) {
            const cartPopup = document.getElementById("cart-popup");
            if (!cartPopup.classList.contains("show")) {
              cartPopup.classList.add("show-before");
              updateCartPopup();
              setTimeout(() => {
                cartPopup.classList.remove("show-before");
                cartPopup.classList.add("show");
              }, 200);
            }
          }
        }
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
  // Popup controls
  const popup = document.getElementById("product-popup");
  const closeBtn = document.querySelector(".close-btn");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  let currentImageIndex = 0;
  let images = [];

  closeBtn?.addEventListener("click", () => {
    popup.style.display = "none";
  });

  popup?.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });

  // Carousel navigation
  prevBtn?.addEventListener("click", () => {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      updateCarousel();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentImageIndex < images.length - 1) {
      currentImageIndex++;
      updateCarousel();
    }
  });

  function updateCarousel() {
    const carouselImgs = document.querySelectorAll(".carousel-images img");
    carouselImgs.forEach((img, index) => {
      img.classList.toggle("active", index === currentImageIndex);
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
      if (document.body.dataset.category) {
        return products.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) &&
            product.category.toLowerCase() ===
              document.body.dataset.category.toLowerCase()
        );
      } else {
        // Filter products by name or category
        return products.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
      }
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
