/* DEMO admin: edits are saved in this browser's localStorage only. No real auth, no server. */
const Admin={edit:null,
 view(){const P=getProducts(),e=this.edit?find(this.edit):null,v=(k,d="")=>esc(e?e[k]??d:d);
  return `<div class="wrap" style="padding:40px 20px 70px"><h1 style="font-size:32px;margin-bottom:14px">Admin (Demo)</h1>
  <div class="warn"><b>Demo only.</b> This panel has no login and no server. Changes are stored in this browser's localStorage and are not visible to other visitors. Real product management on GitHub Pages means editing <code>js/products.js</code> and committing.</div>
  <form id="af" class="card-box" style="margin-bottom:28px"><h3 style="margin-bottom:14px">${e?"Edit product":"Add product"}</h3><div class="f2">
  <div class="fld"><label>Name</label><input name="name" required value="${v("name")}"></div>
  <div class="fld"><label>Category</label><select name="cat" style="width:100%">${CATS.map(c=>`<option value="${c[0]}" ${e&&e.cat===c[0]?"selected":""}>${esc(c[1])}</option>`).join("")}</select></div>
  <div class="fld"><label>Price (Rs.)</label><input name="price" type="number" min="0" required value="${v("price")}"></div>
  <div class="fld"><label>Sale price (optional)</label><input name="sale" type="number" min="0" value="${v("sale")}"></div>
  <div class="fld"><label>Stock</label><input name="stock" type="number" min="0" required value="${v("stock","1")}"></div>
  <div class="fld"><label>Gender</label><select name="g" style="width:100%">${["Men","Women","Unisex"].map(g=>`<option ${e&&e.g===g?"selected":""}>${g}</option>`).join("")}</select></div>
  <div class="fld"><label>Image path or URL</label><input name="img" list="imgs" value="${e?esc(e.imgs[0]):"assets/images/mens.jpg"}"><datalist id="imgs">${["hero","mens","womens","store","flatlay"].map(i=>`<option value="assets/images/${i}.jpg">`).join("")}</datalist></div>
  <div class="fld"><label>Sizes (comma separated)</label><input name="sizes" value="${e?esc(e.sizes.join(", ")):"S, M, L"}"></div></div>
  <div class="fld"><label>Description</label><textarea name="desc" rows="3">${v("desc")}</textarea></div>
  <button class="btn">${e?"Save changes":"Add product"}</button> ${e?'<button type="button" class="btn o" data-ac="cancel">Cancel</button>':""}</form>
  <div class="tblw"><table class="tbl"><tr><th></th><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>${P.map(p=>`<tr><td><img src="${esc(p.imgs[0])}" alt=""></td><td>${esc(p.name)}</td><td>${fmt(price(p))}</td><td>${p.stock}</td><td>${p.stock<1?"Out of stock":p.stock<=5?"Low stock":"In stock"}</td><td><button data-ac="edit:${p.id}"><u>Edit</u></button> <button data-ac="del:${p.id}" style="color:#b91c1c"><u>Delete</u></button></td></tr>`).join("")}</table></div>
  <p style="margin-top:16px"><button class="btn o" data-ac="reset">Reset to original catalogue</button></p></div>`},
 bind(){const f=$("#af");if(!f)return;f.onsubmit=ev=>{ev.preventDefault();const d=Object.fromEntries(new FormData(f));const P=getProducts();
  const o={name:d.name.trim(),cat:d.cat,g:d.g,price:+d.price,sale:d.sale?+d.sale:null,stock:+d.stock,sizes:d.sizes.split(",").map(s=>s.trim()).filter(Boolean),desc:d.desc,imgs:[d.img]};
  if(this.edit){const p=P.find(x=>x.id===this.edit);Object.assign(p,o,{imgs:[d.img,...p.imgs.slice(1)]})}
  else P.unshift({id:"prod-"+Date.now(),colors:[{name:"Default",hex:"#171717"}],tags:[],f:0,n:1,b:0,l:o.stock<=5?1:0,s:o.sale?1:0,fit:"",fabric:"",care:"",origin:"",...o});
  o.sale&&(o.s=1);saveProducts(P);this.edit=null;toast("Saved (demo, this browser only)");route()}},
 act(a){if(a==="cancel")this.edit=null;else if(a==="reset"){try{localStorage.removeItem("aura_products")}catch(e){}}
  else if(a.startsWith("edit:")){this.edit=a.slice(5)}
  else if(a.startsWith("del:")&&confirm("Delete this product?")){saveProducts(getProducts().filter(p=>p.id!==a.slice(4)));Cart.load()}
  route()}};
