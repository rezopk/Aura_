# Aura Apparel — static site (HTML + CSS + vanilla JS)

Rebuilt from the React/Vite project. No Node, no build, no backend. Open `index.html`, or upload the folder to a GitHub repo and enable **Settings → Pages → Deploy from branch → /(root)**.

## Structure
- `index.html` — single-page shell; hash routes: `#/`, `#/shop`, `#/shop/men`, `#/new`, `#/limited`, `#/sale`, `#/wishlist`, `#/p/<id>`, `#/checkout`, `#/stores`, `#/about`, `#/contact`, `#/admin`
- `css/style.css`, `js/products.js` (config + catalogue), `js/cart.js`, `js/app.js`, `js/admin.js`
- `assets/images/` — the original 5 photos, resized for the web

## Configure
Edit `CONFIG` at the top of `js/products.js` (WhatsApp number, phone, email, hours, stores, shipping fee/threshold, social links).

## How it behaves without a server
- Cart, wishlist: `localStorage`.
- Checkout: builds a WhatsApp message (customer details, items, quantities, total, cash on delivery) and opens `wa.me`. Nothing is stored in a database.
- Admin (`#/admin`): **demo only**, no login. Edits live in the browser's localStorage and are visible only to that browser. To change the real catalogue, edit `DEFAULT_PRODUCTS` in `js/products.js`.
- Fonts load from Google Fonts (falls back to system fonts offline).

## Not carried over (needed a backend)
Customer accounts/orders history, order-tracking confirmation page, coupons, reviews, analytics, CMS/payment/delivery settings, customers & inventory admin screens.
