(function () {
  "use strict";

  var config = window.SWAPNA_CONFIG || {};
  var settings = window.SHOP_SETTINGS || {};
  var paintings = window.PAINTINGS || [];
  var currency = config.currency || "₹";
  var shopTitle = settings.shopTitle || config.shopTitle || "Art Shop";
  var tagline = settings.tagline != null ? settings.tagline : (config.tagline || "");

  document.title = shopTitle;
  document.getElementById("shop-title").textContent = shopTitle;
  document.getElementById("shop-tagline").textContent = tagline;

  var waBase = "https://wa.me/" + (config.phone || "") + "?text=";
  var helloMsg = encodeURIComponent(
    "Hello " + shopTitle + "! I would like to know more about your paintings."
  );
  document.getElementById("header-contact").href = waBase + helloMsg;
  var footerContact = document.getElementById("footer-contact");
  footerContact.textContent = "Contact / orders: " + (config.displayPhone || config.phone || "");

  var gallery = document.getElementById("gallery");
  var emptyMessage = document.getElementById("empty-message");
  emptyMessage.hidden = paintings.length > 0;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function formatPrice(amount) {
    var n = Number(amount) || 0;
    return currency + n.toLocaleString("en-IN");
  }

  paintings.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "painting-card" + (p.available === false ? " sold" : "");

    var badge = p.available === false
      ? '<span class="badge sold">Sold</span>'
      : '<span class="badge">Available</span>';

    var action = p.available === false
      ? '<p class="sold-note">This painting has been sold.</p>'
      : '<button type="button" class="btn btn-whatsapp" data-order="' + esc(p.id) + '">Order on WhatsApp</button>';

    card.innerHTML =
      '<div class="painting-image-wrap">' + badge +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">' +
      '</div>' +
      '<div class="painting-body">' +
        '<h2 class="painting-title">' + esc(p.title) + '</h2>' +
        '<div class="painting-price">' + esc(formatPrice(p.price)) + '</div>' +
        (p.description ? '<p class="painting-desc">' + esc(p.description) + '</p>' : '') +
        action +
      '</div>';

    gallery.appendChild(card);
  });

  // Order modal
  var modal = document.getElementById("order-modal");
  var orderForm = document.getElementById("order-form");
  var orderSummary = document.getElementById("order-summary");
  var orderTotal = document.getElementById("order-total");
  var qtyInput = document.getElementById("cust-qty");
  var currentPainting = null;

  function openOrder(id) {
    currentPainting = paintings.find(function (p) { return p.id === id; });
    if (!currentPainting) return;
    orderSummary.innerHTML =
      '<p class="sum-title"><strong>' + esc(currentPainting.title) + '</strong></p>' +
      '<p class="sum-price">Price: ' + esc(formatPrice(currentPainting.price)) + '</p>';
    qtyInput.value = 1;
    updateTotal();
    orderForm.reset();
    qtyInput.value = 1;
    updateTotal();
    modal.hidden = false;
    document.getElementById("cust-name").focus();
  }

  function updateTotal() {
    if (!currentPainting) return;
    var qty = Math.max(1, Number(qtyInput.value) || 1);
    orderTotal.textContent = "Total: " + formatPrice(Number(currentPainting.price) * qty) +
      " (" + qty + " × " + formatPrice(currentPainting.price) + ")";
  }

  gallery.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-order]");
    if (btn) openOrder(btn.getAttribute("data-order"));
  });

  qtyInput.addEventListener("input", updateTotal);

  document.getElementById("order-close").addEventListener("click", function () {
    modal.hidden = true;
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) modal.hidden = true;
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) modal.hidden = true;
  });

  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!currentPainting) return;
    var qty = Math.max(1, Number(qtyInput.value) || 1);
    var lines = [
      "New Order — " + shopTitle,
      "Painting: " + currentPainting.title,
      "Price: " + formatPrice(currentPainting.price),
      "Quantity: " + qty,
      "Total: " + formatPrice(Number(currentPainting.price) * qty),
      "",
      "Name: " + document.getElementById("cust-name").value.trim(),
      "Phone: " + document.getElementById("cust-phone").value.trim(),
      "Address: " + document.getElementById("cust-address").value.trim()
    ];
    window.open(waBase + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    modal.hidden = true;
  });
})();
