const { getConnection } = require("./supabase");
const conn = getConnection();

/**
 * Get all exercises
 * @returns {Promise<DataListEnvelope<Exercise>>}
 */
async function getAll() {
  try {
    const { data, error } = await conn
      .from("Exercises") // Ensure correct table name (case-sensitive)
      .select("*");

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || [],
    };
  } catch (err) {
    console.error("Error in getAll:", err);
    throw err;
  }
}

/**
 * Get an exercise by ID
 * @param {number} id
 * @returns {Promise<DataEnvelope<Exercise>>}
 */
async function get(id) {
  try {
    const { data, error } = await conn
      .from("Exercises")
      .select("*")
      .eq("id", id)
      .single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error(`Error in get for exercise ID ${id}:`, err);
    throw err;
  }
}

/**
 * Add a new exercise
 * @param {Exercise} exercise
 * @returns {Promise<DataEnvelope<Exercise>>}
 */
async function add(exercise) {
  try {
    const { data, error } = await conn
      .from("Exercises")
      .insert([exercise])
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
 * Update an exercise
 * @param {number} id
 * @param {Exercise} exercise
 * @returns {Promise<DataEnvelope<Exercise>>}
 */
async function update(id, exercise) {
  try {
    const { data, error } = await conn
      .from("Exercises")
      .update(exercise)
      .eq("id", id)
      .select("*")
      .single();

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error(`Error in update for exercise ID ${id}:`, err);
    throw err;
  }
}

/**
 * Remove an exercise
 * @param {number} id
 * @returns {Promise<DataEnvelope<number>>}
 */
async function remove(id) {
  try {
    const { data, error } = await conn
      .from("Exercises")
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
    console.error(`Error in remove for exercise ID ${id}:`, err);
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
