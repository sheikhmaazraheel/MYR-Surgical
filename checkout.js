document.addEventListener("DOMContentLoaded", () => {
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

  // Load order data from localStorage
  const orderId = localStorage.getItem("myrorderId") || "N/A";
  const myrcart = JSON.parse(localStorage.getItem("myrcart")) || {};

  const cartSummary = Object.keys(myrcart)
    .map((id) => {
      const item = myrcart[id];
      return `${item.name} (x${item.quantity}) - Rs.${item.price * item.quantity}`;
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
    const message = `*New Order via Online Payment*\n\n` +
      `👤 Name: ${data.name}\n📞 Contact: ${data.contact}\n📦 City: ${data.city}\n🏠 House: ${data.houseNo}, Block: ${data.Block}\n📍 Landmark: ${data.landmark}\n🗺️ Area: ${data.Area}\n\n🧾 *Order ID:* ${data.orderId}\n🛒 *Cart:*\n${cartSummary}\n\n💰 *Total (incl. delivery): Rs.${total}*`;

    const whatsappUrl = `https://wa.me/923238083588?text=${encodeURIComponent(message)}`;
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
  const total = Object.keys(myrcart).reduce((sum, id) => {
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
      const { name, price, quantity, selectedColor, selectedSize } = myrcart[id];
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
  
});
