/* Cart + wishlist (localStorage). */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>"Rs. "+Number(n).toLocaleString("en-PK");
const price=p=>p.sale&&p.sale<p.price?p.sale:p.price;
const find=id=>getProducts().find(p=>p.id===id);
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2200)}
const Cart={items:[],wish:[],
 load(){try{this.items=JSON.parse(localStorage.getItem("aura_cart"))||[];this.wish=JSON.parse(localStorage.getItem("aura_wish"))||[]}catch(e){this.items=[];this.wish=[]}
  this.items=this.items.filter(i=>find(i.id))},
 save(){try{localStorage.setItem("aura_cart",JSON.stringify(this.items));localStorage.setItem("aura_wish",JSON.stringify(this.wish))}catch(e){}this.badge()},
 add(id,size,color,qty=1){const p=find(id);if(!p)return;const key=[id,size,color].join("|");const it=this.items.find(i=>i.key===key);
  if(it)it.qty=Math.min(it.qty+qty,Math.max(p.stock,1));else this.items.push({key,id,size,color,qty});this.save();this.render();this.open()},
 setQty(key,d){const it=this.items.find(i=>i.key===key);if(!it)return;const p=find(it.id);it.qty=Math.min(it.qty+d,Math.max(p.stock,1));if(it.qty<1)return this.remove(key);this.save();this.render()},
 remove(key){this.items=this.items.filter(i=>i.key!==key);this.save();this.render()},
 clear(){this.items=[];this.save();this.render()},
 count(){return this.items.reduce((s,i)=>s+i.qty,0)},
 sub(){return this.items.reduce((s,i)=>s+price(find(i.id))*i.qty,0)},
 ship(){const s=this.sub();return !s||s>=CONFIG.freeOver?0:CONFIG.shipFee},
 total(){return this.sub()+this.ship()},
 toggleWish(id){const i=this.wish.indexOf(id);i>=0?this.wish.splice(i,1):this.wish.push(id);this.save()},
 badge(){$("#cc").textContent=this.count();$("#wc").textContent=this.wish.length||""},
 open(){$("#drawer").classList.add("on");$("#ov").classList.add("on")},
 close(){$("#drawer").classList.remove("on");$("#ov").classList.remove("on")},
 summary(){const s=this.sub(),sh=this.ship();return `<div class="sum"><div><span>Subtotal</span><span>${fmt(s)}</span></div><div><span>Shipping</span><span>${sh?fmt(sh):"Free"}</span></div><div class="t"><span>Total</span><span>${fmt(s+sh)}</span></div></div>`},
 render(){this.badge();const d=$("#drawer");
  const rows=this.items.map(i=>{const p=find(i.id);return `<div class="ci"><img src="${esc(p.imgs[0])}" alt="${esc(p.name)}" loading="lazy"><div><b>${esc(p.name)}</b><small>Size ${esc(i.size)} · ${esc(i.color)}</small><small>${fmt(price(p))}</small><div style="margin-top:8px"><span class="qty"><button data-q="${i.key}:-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-q="${i.key}:1" aria-label="Increase">+</button></span><button class="rm" data-rm="${i.key}">Remove</button></div></div></div>`}).join("");
  d.innerHTML=`<div class="dh"><span>Your Bag (${this.count()})</span><button data-close aria-label="Close">✕</button></div><div class="db">${rows||'<p class="empty">Your bag is empty.<br><a class="btn o" style="margin-top:16px" href="#/shop" data-close>Start Shopping</a></p>'}</div>${this.items.length?`<div class="df">${this.summary()}<p style="font-size:11px;color:#737373;margin:8px 0">Free shipping over ${fmt(CONFIG.freeOver)}. Cash on delivery available.</p><a class="btn blk" href="#/checkout" data-close>Checkout</a></div>`:""}`}
};
