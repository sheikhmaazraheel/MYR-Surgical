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
      `🏠 House: ${data.houseNo}, Block: ${data.block}\n` +
      `📍 Landmark: ${data.landmark}\n` +
      `🗺️ Area: ${data.area}\n\n` +
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
      .map((id) => `${cart[id].name} (x${cart[id].quantity}) - Rs.${(cart[id].price * cart[id].quantity).toFixed(2)}`)
      .join("\n");
    const total = calculateTotal(cart);

    const cartSummaryDiv = document.getElementById("cart-items");
    const totalDiv = document.getElementById("total");
    if (cartSummaryDiv) cartSummaryDiv.value = cartSummary;
    if (totalDiv) totalDiv.value = total.toFixed(2);

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
        block: checkoutForm.block.value.trim(),
        landmark: checkoutForm.landmark.value.trim(),
        area: checkoutForm.area.value.trim(),
        paymentMethod: selectedPayment,
        cartItems: Object.keys(cart).map((id) => ({
          name: cart[id].name,
          price: cart[id].price,
          quantity: cart[id].quantity,
          selectedColor: cart[id].selectedColor,
          selectedSize: cart[id].selectedSize,
          image: cart[id].image, // Include image for thank you page
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
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Shipping Address:</strong> ${order.houseNo}, ${order.block}, ${order.area}, ${order.city}</p>
          <h4 class="mt-4 font-medium">Items:</h4>
          <ul class="list-disc list-inside">
            ${order.cartItems
              .map(
                (item) => `
                  <li>
                    ${item.name} (Qty: ${item.quantity}${item.selectedColor ? ", Color: " + item.selectedColor : ""}${
                  item.selectedSize ? ", Size: " + item.selectedSize : ""
                }) - Rs. ${(item.price * item.quantity).toFixed(2)}
                    <img src="${item.image || ""}" alt="${item.name}" class="inline-block w-12 h-12 object-cover ml-2" onerror="this.style.display='none'" />
                  </li>
                `
              )
              .join("")}
          </ul>
        `;
      } catch (err) {
        console.error("Load order error:", err);
        orderDetailsDiv.innerHTML = `<p class="error-message text-red-600">Error loading order details: ${err.message}</p>`;
      }
    }

    loadOrderDetails();
  }
});