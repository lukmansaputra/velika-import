// supabaseClient.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

class Database {
  /** ========== CATEGORY CRUD ========== */

  async createCategory({ name, slug, image = null }) {
    const { error } = await supabase
      .from("categories")
      .insert([{ name, slug, image }]);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Category created successfully." };
  }

  async getAllCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }

  async updateCategory(id, { name, slug, image = null }) {
    const { error } = await supabase
      .from("categories")
      .update({ name, slug, image })
      .eq("id", id);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Category updated successfully." };
  }

  async deleteCategory(id) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Category deleted successfully." };
  }

  /** ========== PRODUCT CRUD ========== */

  async createProduct({
    category_id,
    name,
    slug,
    description = "",
    price,
    width = null,
    height = null,
    weight = null,
    is_discount = false,
    discount_percent = 0,
    discount_start = null,
    discount_end = null,
    stock = 0,
    images = [],
  }) {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          category_id,
          name,
          slug,
          description,
          price,
          width,
          height,
          weight,
          is_discount,
          discount_percent,
          discount_start,
          discount_end,
          stock,
        },
      ])
      .select("id")
      .single();

    if (error) return { success: false, message: error.message };

    const productId = data.id;

    const imageInserts = images.map((img) => ({
      product_id: productId,
      image_path: img,
    }));
    const { error: imageError } = await supabase
      .from("product_images")
      .insert(imageInserts);

    if (imageError) return { success: false, message: imageError.message };

    return {
      success: true,
      productId,
      message: "Product and images created successfully.",
    };
  }

  async getProductById(id) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `*, category:categories (name, slug), images:product_images (image_path)`
      )
      .eq("id", id)
      .single();

    if (error) return { success: false, message: error.message };

    const images = data.images?.map((i) => i.image_path) || [];
    return { success: true, data: { ...data, images } };
  }

  async getProductBySlug(slug) {
    if (!slug) return { success: false, message: "Slug is required." };

    const { data, error } = await supabase
      .from("products")
      .select(
        `*, category:categories (name, slug), images:product_images (image_path)`
      )
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return {
        success: false,
        message: error?.message || "Product not found.",
      };
    }

    const images = Array.isArray(data.images)
      ? data.images.map((img) => img.image_path)
      : [];

    return {
      success: true,
      data: {
        ...data,
        images,
      },
    };
  }

  async getAllProducts(sort = "newest", categorySlug = null) {
    let sortColumn = "created_at";
    let ascending = false;

    if (sort === "price_asc") {
      sortColumn = "price";
      ascending = true;
    } else if (sort === "price_desc") {
      sortColumn = "price";
      ascending = false;
    } else if (sort === "oldest") {
      sortColumn = "created_at";
      ascending = true;
    }

    let query = supabase
      .from("products")
      .select(
        `*, 
         categories!inner (name, slug), 
         product_images (image_path)`
      )
      .order(sortColumn, { ascending });

    if (categorySlug) {
      query = query.eq("categories.slug", categorySlug);
    }

    const { data, error } = await query;

    if (error) return { success: false, message: error.message };

    const formatted = data.map((item) => ({
      ...item,
      category: item.categories,
      images: item.product_images?.map((i) => i.image_path) || [],
    }));

    return { success: true, data: formatted };
  }

  async getAllFilterProducts({
    sort = "newest",
    categorySlug = null,
    page = 1,
    limit = 10,
  } = {}) {
    // kasih default empty object supaya aman jika dipanggil tanpa argumen
    let sortColumn = "created_at";
    let ascending = false;

    if (sort === "price_asc") {
      sortColumn = "price";
      ascending = true;
    } else if (sort === "price_desc") {
      sortColumn = "price";
      ascending = false;
    } else if (sort === "oldest") {
      sortColumn = "created_at";
      ascending = true;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("products")
      .select(`*, categories!inner (name, slug), product_images (image_path)`, {
        count: "exact",
      })
      .order(sortColumn, { ascending })
      .range(from, to);

    if (categorySlug) {
      query = query.eq("categories.slug", categorySlug);
    }

    const { data, error, count } = await query;

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    // pastikan data selalu array, jika undefined, beri array kosong
    const safeData = Array.isArray(data) ? data : [];

    const formatted = safeData.map((item) => ({
      ...item,
      category: item.categories,
      images: item.product_images?.map((i) => i.image_path) || [],
    }));

    const totalPages = count ? Math.ceil(count / limit) : 1;

    return {
      success: true,
      data: formatted,
      pagination: {
        total: count || 0,
        page,
        totalPages,
      },
    };
  }

  async updateProduct(
    id,
    {
      category_id,
      name,
      slug,
      description = "",
      price,
      width = null,
      height = null,
      weight = null,
      is_discount = false,
      discount_percent = 0,
      discount_start = null,
      discount_end = null,
      stock = 0,
      images = [],
    }
  ) {
    const { error } = await supabase
      .from("products")
      .update({
        category_id,
        name,
        slug,
        description,
        price,
        width,
        height,
        weight,
        is_discount,
        discount_percent,
        discount_start,
        discount_end,
        stock,
      })
      .eq("id", id);

    if (error) return { success: false, message: error.message };

    const { data: existing, error: imgError } = await supabase
      .from("product_images")
      .select("image_path")
      .eq("product_id", id);

    if (imgError) return { success: false, message: imgError.message };

    const oldImages = existing.map((i) => i.image_path);
    const toInsert = images.filter((img) => !oldImages.includes(img));
    const toDelete = oldImages.filter((img) => !images.includes(img));

    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map((img) =>
          supabase
            .from("product_images")
            .delete()
            .eq("product_id", id)
            .eq("image_path", img)
        )
      );
    }

    if (toInsert.length > 0) {
      const newInserts = toInsert.map((img) => ({
        product_id: id,
        image_path: img,
      }));
      await supabase.from("product_images").insert(newInserts);
    }

    return { success: true, message: "Product updated successfully." };
  }

  async deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Product deleted successfully." };
  }

  async searchProduct(query, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*, categories (name, slug), product_images (image_path)", {
        count: "exact",
      })
      .ilike("name", `%${query}%`)
      .range(from, to);

    if (error) {
      return { success: false, message: "Gagal mengambil data dari Supabase" };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "Data produk tidak ditemukan",
        data: [],
      };
    }

    const formatted = data.map((item) => ({
      ...item,
      category: item.categories,
      images: item.product_images?.map((i) => i.image_path) || [],
    }));

    const totalPages = count ? Math.ceil(count / limit) : 1;

    return {
      success: true,
      data: formatted,
      pagination: {
        total: count || 0,
        page,
        totalPages,
      },
    };
  }

  /** ========== WEBSITE SETTINGS ========== */
  async getAllSettings() {
    const { data, error } = await supabase.from("website_settings").select("*");
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }

  async updateSetting(key, value) {
    // Buat object update dinamis berdasarkan key dan value
    const updateData = {};
    updateData[key] = value;

    // Update row yang ID-nya 1 (asumsikan hanya 1 row settings)
    const { data, error } = await supabase
      .from("website_settings")
      .update(updateData)
      .eq("id", "2db1ee24-b903-4961-b5b1-6cd6861e6c5e");

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: "Setting updated." };
  }
}

module.exports = new Database();
