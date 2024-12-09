const { getConnection } = require("./supabase");
const conn = getConnection();

async function getAll() {
  try {
    const { data, error, count } = await conn
      .from("Exercises")
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
    console.error(`Unexpected error fetching exercise with ID ${id}:`, err);
    throw err;
  }
}

async function add(exercise) {
  try {
    const { data, error } = await conn
      .from("Exercises")
      .insert([exercise])
      .single();

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
    console.error("Unexpected error in update:", err);
    throw err;
  }
}

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
};
