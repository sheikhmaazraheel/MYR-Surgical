document.addEventListener("DOMContentLoaded", () => {
  // Handle payment selection
  let selectedPayment = "";
  document.querySelectorAll(".payment-box").forEach((box) => {
    box.addEventListener("click", () => {
      document
        .querySelectorAll(".payment-box")
        .forEach((b) => b.classList.remove("selected"));
      box.classList.add("selected");
      selectedPayment = box.dataset.method;
      document.getElementById("paymentMethod").value = selectedPayment;
    });
  });

  // Load order data from localStorage
  
  const myrcart = JSON.parse(localStorage.getItem("myrcart")) || {};

  const cartSummary = Object.keys(myrcart)
    .map((id) => {
      const item = myrcart[id];
      return `${item.name} (x${item.quantity}) - Rs.${
        item.price * item.quantity
      }`;
    })
    .join("\n");

  let total = Object.keys(myrcart).reduce((sum, id) => {
    return sum + myrcart[id].price * myrcart[id].quantity;
  }, 0);
  if (total > 0) total += 150;

  // Fill form hidden fields
  document.getElementById("orderId").value = orderId;
  document.getElementById("cart-items").value = cartSummary;
  document.getElementById("total").value = total;

  // Optional: WhatsApp Auto Redirect if Online Payment
  function handleWhatsAppCheckout(data) {
    const message =
      `*New Order via Online Payment*\n\n` +
      `👤 Name: ${data.name}\n📞 Contact: ${data.contact}\n📦 City: ${data.city}\n🏠 House: ${data.houseNo}, Block: ${data.Block}\n📍 Landmark: ${data.landmark}\n🗺️ Area: ${data.Area}\n\n🧾 *Order ID:* ${data.orderId}\n🛒 *Cart:*\n${cartSummary}\n\n💰 *Total (incl. delivery): Rs.${total}*`;

    const whatsappUrl = `https://wa.me/923238083588?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  }

  // Form submission
  const form = document.getElementById("checkout-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Fix: Declare all variables properly
    const orderId = localStorage.getItem("myrorderId") || "N/A";
    const myrcart = JSON.parse(localStorage.getItem("myrcart")) || {};
    const paymentMethod = document.getElementById("paymentMethod").value;
    const total =
      Object.keys(myrcart).reduce((sum, id) => {
        return sum + myrcart[id].price * myrcart[id].quantity;
      }, 0) + 150;

    const orderData = {
      orderId,
      name: form.name.value.trim(),
      contact: form.contact.value.trim(),
      city: form.city.value.trim(),
      houseNo: form.house.value.trim(),
      Block: form.block.value.trim(),
      landmark: form.landmark.value.trim(),
      Area: form.area.value.trim(),
      paymentMethod,
      cartItems: Object.keys(myrcart).map((id) => {
        const { name, price, quantity, selectedColor, selectedSize } =
          myrcart[id];
        return { name, price, quantity, selectedColor, selectedSize };
      }),
      totalAmount: total,
    };

    try {
      const res = await fetch("https://myr-backend-7nx6.onrender.com/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (result.success) {
        if (orderData.paymentMethod === "Online Payment") {
          handleWhatsAppCheckout(orderData);
        }

        alert("✅ Order placed successfully!");
        localStorage.removeItem("myrcart");
        localStorage.removeItem("myrorderId");
        window.location.href = "thankyou.html";
      } else {
        alert("❌ Failed to place order.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      alert("❌ Server error. Please try again.");
    }
  });
  // Prevent form submission if no payment method is selected
  if (!selectedPayment) {
    alert("Please select a payment method.");
    return;
  }
  const backendURL = "https://myr-backend-7nx6.onrender.com";

  // Get orderId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("orderId");

  async function loadOrderDetails() {
    const orderDetailsDiv = document.getElementById("order-details");

    if (!orderId) {
      orderDetailsDiv.innerHTML =
        '<p class="error-message">Error: No order ID provided.</p>';
      return;
    }

    try {
      const res = await fetch(`${backendURL}/orders/${orderId}`, {
        credentials: "include",
      });
      const order = await res.json();

      if (!res.ok || !order) {
        orderDetailsDiv.innerHTML =
          '<p class="error-message">Failed to load order details.</p>';
        return;
      }

      // Format order details
      orderDetailsDiv.innerHTML = `
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(
            order.createdAt
          ).toLocaleDateString()}</p>
          <p><strong>Total:</strong> Rs. ${order.total.toFixed(2)}</p>
          <h4 class="mt-4 font-medium">Items:</h4>
          <ul class="list-disc list-inside">
            ${order.items
              .map(
                (item) => `
                  <li>
                    ${item.name} (Qty: ${
                  item.quantity
                }) - Rs. ${item.price.toFixed(2)}
                    <img src="${item.image || ""}" alt="${
                  item.name
                }" class="inline-block w-12 h-12 object-cover ml-2" onerror="this.style.display='none'" />
                  </li>
                `
              )
              .join("")}
          </ul>
        `;
    } catch (err) {
      console.error("Load order error:", err);
      orderDetailsDiv.innerHTML =
        '<p class="error-message">Error loading order details: ' +
        err.message +
        "</p>";
    }
  }

  // Load order details on page load
  loadOrderDetails();
});
