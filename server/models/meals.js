const { getConnection } = require("./supabase");
const conn = getConnection();

/**
 * Get all meals
 * @returns {Promise<DataListEnvelope<Meal>>}
 */
async function getAll() {
  try {
    const { data, error, count } = await conn
      .from("Meals") // Ensure correct table name (case-sensitive)
      .select("*", { count: "estimated" });

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.error("Error in getAll:", err);
    throw err;
  }
}

/**
 * Get a meal by ID
 * @param {number} id
 * @returns {Promise<DataEnvelope<Meal>>}
 */
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
    console.error(`Error in get for meal ID ${id}:`, err);
    throw err;
  }
}

/**
 * Add a new meal
 * @param {Meal} meal
 * @returns {Promise<DataEnvelope<Meal>>}
 */
async function add(meal) {
  try {
    const { data, error } = await conn
      .from("Meals")
      .insert([meal])
      .select("*")
      .single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error("Error in add:", err);
    throw err;
  }
}

/**
 * Update a meal
 * @param {number} id
 * @param {Meal} meal
 * @returns {Promise<DataEnvelope<Meal>>}
 */
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
    console.error(`Error in update for meal ID ${id}:`, err);
    throw err;
  }
}

/**
 * Remove a meal
 * @param {number} id
 * @returns {Promise<DataEnvelope<number>>}
 */
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
    console.error(`Error in remove for meal ID ${id}:`, err);
    throw err;
  }
}

module.exports = {
  getAll,
  get,
  add,
  update,
  remove,
};
