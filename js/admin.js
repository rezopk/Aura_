/* =========================================================
   SUPABASE ADMIN PANEL
   ========================================================= */

// 1. Supabase client
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   AUTH
   ========================================================= */

const Admin = {
  edit: null,

  async login(email, password) {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      toast(error.message);
      return false;
    }

    // Check admin permission
    const { data: admin, error: adminError } =
      await supabaseClient
        .from("admin_profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .single();

    if (adminError || !admin) {
      await supabaseClient.auth.signOut();
      toast("You are not authorized as an admin.");
      return false;
    }

    return true;
  },


  async logout() {
    await supabaseClient.auth.signOut();
    location.reload();
  },


  async currentUser() {
    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
  },


  /* =======================================================
     PRODUCTS
     ======================================================= */

  async getProducts() {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast(error.message);
      return [];
    }

    return data || [];
  },


  /* =======================================================
     ADD PRODUCT
     ======================================================= */

  async addProduct(product) {

    const user = await this.currentUser();

    if (!user) {
      toast("Please login first.");
      return;
    }

    const { data, error } = await supabaseClient
      .from("products")
      .insert({
        name: product.name,
        category: product.cat,
        gender: product.g,
        price: Number(product.price),
        sale_price: product.sale
          ? Number(product.sale)
          : null,
        stock: Number(product.stock),
        sizes: product.sizes || [],
        description: product.desc || "",
        image_url: product.img || "",
        is_featured: false,
        is_new: true,
        is_bestseller: false,
        is_low_stock: Number(product.stock) <= 5
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast(error.message);
      return null;
    }

    toast("Product added successfully.");
    return data;
  },


  /* =======================================================
     UPDATE PRODUCT
     ======================================================= */

  async updateProduct(id, product) {

    const { data, error } = await supabaseClient
      .from("products")
      .update({
        name: product.name,
        category: product.cat,
        gender: product.g,
        price: Number(product.price),
        sale_price: product.sale
          ? Number(product.sale)
          : null,
        stock: Number(product.stock),
        sizes: product.sizes || [],
        description: product.desc || "",
        image_url: product.img || "",
        is_low_stock: Number(product.stock) <= 5
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      toast(error.message);
      return null;
    }

    toast("Product updated successfully.");
    return data;
  },


  /* =======================================================
     DELETE PRODUCT
     ======================================================= */

  async deleteProduct(id) {

    const { error } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      toast(error.message);
      return false;
    }

    toast("Product deleted.");
    return true;
  },


  /* =======================================================
     IMAGE UPLOAD
     ======================================================= */

  async uploadImage(file) {

    if (!file) return null;

    const ext =
      file.name.split(".").pop().toLowerCase();

    const filename =
      `${crypto.randomUUID()}.${ext}`;

    const path =
      `products/${filename}`;

    const { error } =
      await supabaseClient.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false
        });

    if (error) {
      console.error(error);
      toast(error.message);
      return null;
    }

    const {
      data: publicUrl
    } = supabaseClient.storage
      .from("product-images")
      .getPublicUrl(path);

    return publicUrl.publicUrl;
  }
};


/* =========================================================
   LOGIN FORM
   ========================================================= */

async function adminLogin(event) {

  event.preventDefault();

  const form = event.target;

  const email =
    form.querySelector('[name="email"]').value.trim();

  const password =
    form.querySelector('[name="password"]').value;

  const success =
    await Admin.login(email, password);

  if (success) {
    location.reload();
  }
}


/* =========================================================
   CHECK ADMIN SESSION
   ========================================================= */

async function requireAdmin() {

  const user =
    await Admin.currentUser();

  if (!user) {
    location.href = "admin-login.html";
    return false;
  }

  const { data } =
    await supabaseClient
      .from("admin_profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

  if (!data) {
    await Admin.logout();
    return false;
  }

  return true;
}
