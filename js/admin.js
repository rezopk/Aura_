/* =========================================================
   AURA APPAREL — SUPABASE ADMIN
   Login + Live Product CRUD
   ========================================================= */

const SUPABASE_URL = "https://lwuyyzgglhktrwxkybby.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-Aq17_gsyXWxCJtks_QE9Q_PQzOCQSu";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   ADMIN
   ========================================================= */

const Admin = {

  edit: null,
  products: [],


  /* =======================================================
     LOGIN
     ======================================================= */

  async login(email, password) {

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password
      });

    if (error) {
      toast(error.message);
      return false;
    }

    if (!data.user) {
      toast("Login failed.");
      return false;
    }

    /* Check admin_profiles */

    const { data: admin, error: adminError } =
      await supabaseClient
        .from("admin_profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle();

    if (adminError || !admin) {

      await supabaseClient.auth.signOut();

      toast("This account is not an admin.");

      return false;
    }

    localStorage.setItem(
      "aura_admin_user",
      JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: admin.role
      })
    );

    await this.loadProducts();

    toast("Login successful.");

    return true;
  },


  /* =======================================================
     LOGOUT
     ======================================================= */

  async logout() {

    await supabaseClient.auth.signOut();

    localStorage.removeItem("aura_admin_user");

    location.reload();
  },


  /* =======================================================
     CHECK LOGIN
     ======================================================= */

  async isLoggedIn() {

    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return false;

    const { data: admin } =
      await supabaseClient
        .from("admin_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    return !!admin;
  },


  /* =======================================================
     LOAD PRODUCTS FROM SUPABASE
     ======================================================= */

  async loadProducts() {

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {

      console.error("Products error:", error);

      toast(error.message);

      return [];
    }

    /*
      Convert Supabase database format
      into your existing frontend format.
    */

    this.products = (data || []).map(p => ({

      id: p.id,

      name: p.name || "",

      cat: p.category || p.cat || "",

      g: p.gender || p.g || "Unisex",

      price: Number(p.price || 0),

      sale: p.sale_price
        ? Number(p.sale_price)
        : null,

      stock: Number(p.stock || 0),

      sizes: Array.isArray(p.sizes)
        ? p.sizes
        : [],

      desc: p.description || "",

      imgs:
        p.images ||
        (p.image_url ? [p.image_url] : []),

      colors: p.colors || [
        {
          name: "Default",
          hex: "#171717"
        }
      ],

      tags: p.tags || [],

      f: !!p.is_featured,

      n: !!p.is_new,

      b: !!p.is_bestseller,

      l: !!p.is_low_stock,

      s: !!p.sale_price,

      fit: p.fit || "",

      fabric: p.fabric || "",

      care: p.care || "",

      origin: p.origin || ""

    }));

    return this.products;
  },


  /* =======================================================
     GET PRODUCTS
     ======================================================= */

  getProducts() {

    return this.products;
  },


  /* =======================================================
     ADD PRODUCT
     ======================================================= */

  async addProduct(o) {

    const user =
      await this.isLoggedIn();

    if (!user) {

      toast("Please login first.");

      return;
    }

    const { data, error } =
      await supabaseClient
        .from("products")
        .insert({

          name: o.name,

          category: o.cat,

          gender: o.g,

          price: Number(o.price),

          sale_price:
            o.sale
              ? Number(o.sale)
              : null,

          stock:
            Number(o.stock),

          sizes:
            o.sizes || [],

          description:
            o.desc || "",

          image_url:
            o.img || "",

          images:
            o.img
              ? [o.img]
              : [],

          is_featured: false,

          is_new: true,

          is_bestseller: false,

          is_low_stock:
            Number(o.stock) <= 5

        })
        .select()
        .single();


    if (error) {

      console.error(error);

      toast(error.message);

      return false;
    }


    toast("Product added successfully.");

    await this.loadProducts();

    return data;
  },


  /* =======================================================
     UPDATE PRODUCT
     ======================================================= */

  async updateProduct(id, o) {

    const { data, error } =
      await supabaseClient
        .from("products")
        .update({

          name: o.name,

          category: o.cat,

          gender: o.g,

          price:
            Number(o.price),

          sale_price:
            o.sale
              ? Number(o.sale)
              : null,

          stock:
            Number(o.stock),

          sizes:
            o.sizes || [],

          description:
            o.desc || "",

          image_url:
            o.img || "",

          images:
            o.img
              ? [o.img]
              : [],

          is_low_stock:
            Number(o.stock) <= 5

        })
        .eq("id", id)
        .select()
        .single();


    if (error) {

      console.error(error);

      toast(error.message);

      return false;
    }


    toast("Product updated successfully.");

    await this.loadProducts();

    return data;
  },


  /* =======================================================
     DELETE PRODUCT
     ======================================================= */

  async deleteProduct(id) {

    if (!confirm("Delete this product permanently?")) {
      return;
    }

    const { error } =
      await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);


    if (error) {

      console.error(error);

      toast(error.message);

      return false;
    }


    toast("Product deleted.");

    await this.loadProducts();

    return true;
  },


  /* =======================================================
     IMAGE UPLOAD
     ======================================================= */

  async uploadImage(file) {

    if (!file) return null;


    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    const filename =
      `${crypto.randomUUID()}.${extension}`;


    const path =
      `products/${filename}`;


    const { error } =
      await supabaseClient
        .storage
        .from("product-images")
        .upload(
          path,
          file,
          {
            cacheControl: "3600",
            upsert: false
          }
        );


    if (error) {

      console.error(error);

      toast(error.message);

      return null;
    }


    const { data } =
      supabaseClient
        .storage
        .from("product-images")
        .getPublicUrl(path);


    return data.publicUrl;
  },


  /* =======================================================
     ADMIN VIEW
     ======================================================= */

  view() {

    const P = this.getProducts();

    const e =
      this.edit
        ? P.find(p => p.id === this.edit)
        : null;


    const v = (key, fallback = "") =>
      e
        ? esc(e[key] ?? fallback)
        : fallback;


    return `

      <div class="wrap"
           style="padding:40px 20px 70px">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        ">

          <h1 style="
            font-size:32px;
            margin:0;
          ">
            Admin Panel
          </h1>

          <button
            class="btn o"
            data-ac="logout">
            Logout
          </button>

        </div>


        <div class="warn">

          <b>Live Admin Panel</b>

          <br>

          Products are now stored in
          Supabase and changes are visible
          on the live website.

        </div>


        <form
          id="af"
          class="card-box"
          style="margin-bottom:28px">

          <h3 style="margin-bottom:14px">

            ${e
              ? "Edit product"
              : "Add product"}

          </h3>


          <div class="f2">


            <div class="fld">

              <label>Name</label>

              <input
                name="name"
                required
                value="${v("name")}">

            </div>


            <div class="fld">

              <label>Category</label>

              <input
                name="cat"
                required
                value="${v("cat")}">

            </div>


            <div class="fld">

              <label>Price (Rs.)</label>

              <input
                name="price"
                type="number"
                min="0"
                required
                value="${v("price")}">

            </div>


            <div class="fld">

              <label>Sale price</label>

              <input
                name="sale"
                type="number"
                min="0"
                value="${v("sale")}">

            </div>


            <div class="fld">

              <label>Stock</label>

              <input
                name="stock"
                type="number"
                min="0"
                required
                value="${v("stock","1")}">

            </div>


            <div class="fld">

              <label>Gender</label>

              <select name="g">

                ${["Men","Women","Unisex"]
                  .map(g => `

                    <option
                      ${e && e.g === g
                        ? "selected"
                        : ""}>

                      ${g}

                    </option>

                  `)
                  .join("")}

              </select>

            </div>


            <div class="fld">

              <label>Image URL</label>

              <input
                name="img"
                value="${
                  e && e.imgs
                    ? esc(e.imgs[0] || "")
                    : ""
                }">

            </div>


            <div class="fld">

              <label>Sizes</label>

              <input
                name="sizes"
                value="${
                  e
                    ? esc(e.sizes.join(", "))
                    : "S, M, L"
                }">

            </div>


          </div>


          <div class="fld">

            <label>Description</label>

            <textarea
              name="desc"
              rows="3">${v("desc")}</textarea>

          </div>


          <button
            class="btn"
            type="submit">

            ${e
              ? "Save changes"
              : "Add product"}

          </button>


          ${
            e
              ? `
                <button
                  type="button"
                  class="btn o"
                  data-ac="cancel">

                  Cancel

                </button>
              `
              : ""
          }

        </form>


        <div class="tblw">

          <table class="tbl">

            <tr>

              <th></th>

              <th>Name</th>

              <th>Price</th>

              <th>Stock</th>

              <th>Status</th>

              <th></th>

            </tr>


            ${P.map(p => `

              <tr>

                <td>

                  <img
                    src="${
                      esc(
                        p.imgs?.[0] || ""
                      )
                    }"
                    alt=""
                    style="
                      width:55px;
                      height:55px;
                      object-fit:cover;
                    ">

                </td>


                <td>

                  ${esc(p.name)}

                </td>


                <td>

                  ${fmt(price(p))}

                </td>


                <td>

                  ${p.stock}

                </td>


                <td>

                  ${
                    p.stock < 1
                      ? "Out of stock"
                      : p.stock <= 5
                        ? "Low stock"
                        : "In stock"
                  }

                </td>


                <td>

                  <button
                    data-ac="edit:${p.id}">

                    <u>Edit</u>

                  </button>


                  <button
                    data-ac="del:${p.id}"
                    style="color:#b91c1c">

                    <u>Delete</u>

                  </button>

                </td>

              </tr>

            `).join("")}

          </table>

        </div>

      </div>

    `;
  },


  /* =======================================================
     FORM + BUTTON EVENTS
     ======================================================= */

  bind() {

    const f = $("#af");

    if (!f) return;


    f.onsubmit = async ev => {

      ev.preventDefault();


      const d =
        Object.fromEntries(
          new FormData(f)
        );


      const o = {

        name:
          d.name.trim(),

        cat:
          d.cat,

        g:
          d.g,

        price:
          Number(d.price),

        sale:
          d.sale
            ? Number(d.sale)
            : null,

        stock:
          Number(d.stock),

        sizes:
          String(d.sizes || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),

        desc:
          d.desc || "",

        img:
          d.img || ""

      };


      if (this.edit) {

        await this.updateProduct(
          this.edit,
          o
        );

      } else {

        await this.addProduct(o);

      }


      this.edit = null;

      route();

    };
  },


  /* =======================================================
     ACTIONS
     ======================================================= */

  async act(a) {

    if (a === "cancel") {

      this.edit = null;

      route();

      return;
    }


    if (a === "logout") {

      await this.logout();

      return;
    }


    if (a.startsWith("edit:")) {

      this.edit =
        a.slice(5);

      route();

      return;
    }


    if (a.startsWith("del:")) {

      await this.deleteProduct(
        a.slice(4)
      );

      route();

      return;
    }
  }
};
