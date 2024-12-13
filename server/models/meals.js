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
    const { data, error } = await conn
      .from("Meals")
      .select("*")
      .eq("userId", userId);
    return { isSuccess: !error, message: error?.message, data: data || [] };
  } catch (err) {
    console.error(`Unexpected error fetching meals for userId ${userId}:`, err);
    throw err;
  }
}

async function get(id) {
  try {
    const { data, error } = await conn
      .from("Meals")
      .select("*")
      .eq("id", id)
      .single();
    return { isSuccess: !error, message: error?.message, data: data || null };
  } catch (err) {
    console.error(`Unexpected error fetching meal with ID ${id}:`, err);
    throw err;
  }
}

async function add(meal) {
  try {
    const { data, error } = await conn
      .from("Meals")
      .insert([meal])
      .select("*")
      .single();
    return { isSuccess: !error, message: error?.message, data: data || null };
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
    return { isSuccess: !error, message: error?.message, data: data || null };
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
    return { isSuccess: !error, message: error?.message, data: data || null };
  } catch (err) {
    console.error("Unexpected error in remove:", err);
    throw err;
  }
}

async function getUserAndFriendsMeals(userId, requestingUser) {
  try {
    const { data, error } = await conn.from("Meals").select("*");

    if (error) {
      return { isSuccess: false, message: error.message, data: [] };
    }

    const userMeals = data.filter(
      (meal) =>
        meal.userId === requestingUser.id ||
        (requestingUser.friends || []).includes(meal.userId)
    );

    return {
      isSuccess: true,
      message: "Meals fetched successfully.",
      data: userMeals,
    };
  } catch (err) {
    console.error("Unexpected error in getUserAndFriendsMeals:", err);
    throw err;
  }
}

async function updateMealForUser(id, meal, userId) {
  try {
    const existingMeal = await get(id);
    if (!existingMeal.isSuccess || existingMeal.data.userId !== userId) {
      return {
        isSuccess: false,
        errorCode: 403,
        message: "You can only update your own meals.",
      };
    }
    return await update(id, meal);
  } catch (err) {
    console.error("Unexpected error in updateMealForUser:", err);
    throw err;
  }
}

async function deleteMealForUser(id, userId) {
  try {
    const existingMeal = await get(id);
    if (!existingMeal.isSuccess || existingMeal.data.userId !== userId) {
      return {
        isSuccess: false,
        errorCode: 403,
        message: "You can only delete your own meals.",
      };
    }
    return await remove(id);
  } catch (err) {
    console.error("Unexpected error in deleteMealForUser:", err);
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
  getUserAndFriendsMeals,
  updateMealForUser,
  deleteMealForUser,
};
