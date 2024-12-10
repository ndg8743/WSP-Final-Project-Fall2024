const { getConnection } = require("./supabase");
const conn = getConnection();

async function getAll() {
  try {
    const { data, error, count } = await conn
      .from("Meals")
      .select("*", { count: "estimated" });

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.error("Unexpected error in getAll:", err);
    throw err;
  }
}

async function getByUserId(userId) {
  try {
    console.log(`Fetching meals for userId: ${userId}`); // Add debug logging
    const { data, error } = await conn
      .from("Meals")
      .select("*")
      .eq("userId", userId);

    console.log(`Meals fetched for userId ${userId}:`, data); // Log fetched meals

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || [],
    };
  } catch (err) {
    console.error(`Unexpected error fetching meals for user ${userId}:`, err);
    throw err;
  }
}

//fix get
async function get(id) {
  try {
    const { data, error } = await conn
      .from("Meals")
      .select("*")
      .eq("id", id)
      .single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error(`Unexpected error fetching meal with ID ${id}:`, err);
    throw err;
  }
}

async function add(meal) {
  try {
    const { data, error } = await conn.from("Meals").insert([meal]).single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error("Unexpected error in add:", err);
    throw err;
  }
}

async function update(id, meal) {
  try {
    const { data, error } = await conn
      .from("Meals")
      .update(meal)
      .eq("id", id)
      .select("*")
      .single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error("Unexpected error in update:", err);
    throw err;
  }
}

async function remove(id) {
  try {
    const { data, error } = await conn
      .from("Meals")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error("Unexpected error in remove:", err);
    throw err;
  }
}

module.exports = {
  getAll,
  get,
  add,
  update,
  remove,
  getByUserId,
};