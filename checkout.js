const backendURL = "https://myr-backend-7nx6.onrender.com";
const githubBase = "https://sheikhmaazraheel.github.io/MYR-Surgical";

document.addEventListener("DOMContentLoaded", () => {
  // Shared utilities
  const getCart = () => JSON.parse(localStorage.getItem("myrcart")) || {};
  const calculateTotal = (cart) => {
    const subtotal = Object.keys(cart).reduce(
      (sum, id) => sum + cart[id].price * cart[id].quantity,
      0
    );
    return subtotal > 0 ? subtotal + 150 : 0; // Add delivery fee
  };

  // Generate WhatsApp message for online payment
  const generateWhatsAppMessage = (data, cartSummary, total) => {
    return (
      `*New Order via Online Payment*\n\n` +
      `👤 Name: ${data.name}\n` +
      `📞 Contact: ${data.contact}\n` +
      `📦 City: ${data.city}\n` +
      `🏠 House: ${data.houseNo}, Block: ${data.Block}\n` +
      `📍 Landmark: ${data.landmark}\n` +
      `🗺️ Area: ${data.Area}\n\n` +
      `🧾 *Order ID:* ${data.orderId}\n` +
      `🛒 *Cart:*\n${cartSummary}\n\n` +
      `💰 *Total (incl. delivery): Rs.${total.toFixed(2)}*`
    );
  };

  // Validate form inputs
  const validateForm = (form) => {
    const fields = ["name", "contact", "city", "house", "block", "landmark", "area"];
    for (const field of fields) {
      if (!form[field].value.trim()) {
        return `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`;
      }
    }
    if (form.city.value === "Select City") {
      return "Please select a valid city.";
    }
    if (!/^\d{11}$/.test(form.contact.value.trim())) {
      return "Contact number must be 11 digits.";
    }
    return null;
  };

  // Checkout page logic
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    // Handle payment selection
    let selectedPayment = "";
    document.querySelectorAll(".payment-box").forEach((box) => {
      box.addEventListener("click", () => {
        document.querySelectorAll(".payment-box").forEach((b) => b.classList.remove("selected"));
        box.classList.add("selected");
        selectedPayment = box.dataset.method;
        document.getElementById("paymentMethod").value = selectedPayment;
      });
    });

    // Load and display cart summary
    const cart = getCart();
    const cartSummary = Object.keys(cart)
      .map((id) => `${cart[id].name} (x${cart[id].quantity}${cart[id].selectedColor ? ", Color: " + cart[id].selectedColor : ""}${cart[id].selectedSize ? ", Size: " + cart[id].selectedSize : ""}) - Rs.${(cart[id].price * cart[id].quantity).toFixed(2)}`)
      .join("\n");
    const total = calculateTotal(cart);

    const cartSummaryDiv = document.getElementById("cart-items");
    const totalDiv = document.getElementById("total");
    const cartDisplay = document.getElementById("cart-display");
    if (cartSummaryDiv) cartSummaryDiv.value = cartSummary;
    if (totalDiv) totalDiv.value = total.toFixed(2);
    if (cartDisplay) {
      cartDisplay.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Order Summary</h3>
        <ul class="list-disc list-inside mb-2">
          ${Object.keys(cart)
            .map(
              (id) => `
                <li>
                  ${cart[id].name} (x${cart[id].quantity}${cart[id].selectedColor ? ", Color: " + cart[id].selectedColor : ""}${cart[id].selectedSize ? ", Size: " + cart[id].selectedSize : ""}) - Rs.${(cart[id].price * cart[id].quantity).toFixed(2)}
                </li>
              `
            )
            .join("")}
        </ul>
        <p><strong>Subtotal:</strong> Rs.${(total - 150).toFixed(2)}</p>
        <p><strong>Delivery Fee:</strong> Rs.150.00</p>
        <p><strong>Total:</strong> Rs.${total.toFixed(2)}</p>
      `;
    }

    // Form submission
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validate payment method
      if (!selectedPayment) {
        alert("Please select a payment method.");
        return;
      }

      // Validate form fields
      const validationError = validateForm(checkoutForm);
      if (validationError) {
        alert(validationError);
        return;
      }

      const statusDiv = document.getElementById("form-status");
      if (statusDiv) statusDiv.textContent = "Processing order...";

      const orderData = {
        orderId: localStorage.getItem("myrorderId") || `MYR-${Date.now()}`,
        name: checkoutForm.name.value.trim(),
        contact: checkoutForm.contact.value.trim(),
        city: checkoutForm.city.value.trim(),
        houseNo: checkoutForm.house.value.trim(),
        Block: checkoutForm.block.value.trim(), // Match schema
        Area: checkoutForm.area.value.trim(),   // Match schema
        landmark: checkoutForm.landmark.value.trim(),
        paymentMethod: selectedPayment,
        cartItems: Object.keys(cart).map((id) => ({
          name: cart[id].name,
          price: cart[id].price,
          quantity: cart[id].quantity,
          selectedColor: cart[id].selectedColor,
          selectedSize: cart[id].selectedSize,
          image: cart[id].image,
        })),
        totalAmount: total,
      };

      try {
        const res = await fetch(`${backendURL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(orderData),
        });

        const result = await res.json();
        console.log("Order submission response:", result);

        if (result.success) {
          if (orderData.paymentMethod === "Online Payment") {
            const whatsappUrl = `https://wa.me/923238083588?text=${encodeURIComponent(
              generateWhatsAppMessage(orderData, cartSummary, total)
            )}`;
            window.open(whatsappUrl, "_blank");
          }

          if (statusDiv) statusDiv.textContent = "✅ Order placed successfully!";
          localStorage.removeItem("myrcart");
          localStorage.removeItem("myrorderId");
          setTimeout(() => {
            window.location.href = `${githubBase}/thankyou.html?orderId=${result.orderId}`;
          }, 1000);
        } else {
          if (statusDiv) statusDiv.textContent = `❌ Failed to place order: ${result.message || "Unknown error."}`;
          alert("❌ Failed to place order.");
        }
      } catch (err) {
        console.error("Order submission error:", err);
        if (statusDiv) statusDiv.textContent = `❌ Server error: ${err.message}`;
        alert("❌ Server error. Please try again.");
      }
    });
  }

  // Thank you page logic
  const orderDetailsDiv = document.getElementById("order-details");
  if (orderDetailsDiv) {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    async function loadOrderDetails() {
      if (!orderId) {
        orderDetailsDiv.innerHTML = '<p class="error-message text-red-600">Error: No order ID provided.</p>';
        return;
      }

      try {
        const res = await fetch(`${backendURL}/orders/${orderId}`, {
          method: "GET",
          credentials: "include",
        });

        const order = await res.json();
        console.log("Order details response:", order);

        if (!res.ok || !order) {
          orderDetailsDiv.innerHTML = '<p class="error-message text-red-600">Failed to load order details.</p>';
          return;
        }

        orderDetailsDiv.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-4">Order Confirmation</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${order.name}</p>
            <p><strong>Contact:</strong> ${order.contact}</p>
            <p><strong>Shipping Address:</strong> ${order.houseNo}, ${order.Block}, ${order.Area}, ${order.city}</p>
            <p><strong>Landmark:</strong> ${order.landmark}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Total:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
            <h4 class="mt-4 font-medium">Items:</h4>
            <ul class="list-disc list-inside">
              ${order.cartItems
                .map(
                  (item) => `
                    <li class="flex items-center gap-2">
                      ${item.name} (Qty: ${item.quantity}${item.selectedColor ? ", Color: " + item.selectedColor : ""}${item.selectedSize ? ", Size: " + item.selectedSize : ""}) - Rs. ${(item.price * item.quantity).toFixed(2)}
                      <img src="${item.image || ""}" alt="${item.name}" class="w-12 h-12 object-cover rounded" onerror="this.style.display='none'" />
                    </li>
                  `
                )
                .join("")}
            </ul>
          </div>
        `;
      } catch (err) {
        console.error("Load order error:", err);
        orderDetailsDiv.innerHTML = `<p class="error-message text-red-600">Error loading order details: ${err.message}</p>`;
      }
    }

    loadOrderDetails();
  }
});