const { getConnection } = require("./supabase");
const conn = getConnection();

/**
 * Custom error class for meal-related operations
 */
class MealError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = 'MealError';
    this.code = code;
  }
}

/**
 * Formats a date to ISO date string (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date
    ? new Date(date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
}

/**
 * Retrieves all meals
 */
async function getAll() {
  const { data, error, count } = await conn
    .from("Meals")
    .select("*", { count: "estimated" });

  return {
    isSuccess: !error,
    message: error?.message,
    data: data ?? [],
    total: count ?? 0,
  };
}

/**
 * Retrieves meals for a specific user
 * @param {number} userId - User ID
 */
async function getByUserId(userId) {
  const { data, error } = await conn
    .from("Meals")
    .select("*")
    .eq("userId", userId)
    .order("date", { ascending: false });

  if (error) {
    throw new MealError(`Failed to fetch meals: ${error.message}`);
  }

  return {
    isSuccess: true,
    message: "Meals fetched successfully",
    data: data ?? [],
  };
}

/**
 * Retrieves a specific meal by ID
 * @param {number} id - Meal ID
 */
async function get(id) {
  const { data, error } = await conn
    .from("Meals")
    .select("*")
    .eq("id", id)
    .single();

  return {
    isSuccess: !error,
    message: error?.message,
    data: data ?? null,
  };
}

/**
 * Adds a new meal
 * @param {Object} meal - Meal data
 */
async function add(meal) {
  const { data: maxIdData, error: maxIdError } = await conn
    .from("Meals")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (maxIdError && maxIdError.code !== "PGRST116") {
    throw new MealError(`Failed to generate ID: ${maxIdError.message}`);
  }

  const maxId = maxIdData?.id ?? 0;
  const newId = maxId + 1;

  const formattedMeal = {
    id: newId,
    userId: meal.userId,
    ...meal,
    date: formatDate(meal.date),
  };

  const { data, error } = await conn
    .from("Meals")
    .insert([formattedMeal])
    .select("*")
    .single();

  if (error) {
    throw new MealError(`Failed to add meal: ${error.message}`);
  }

  return {
    isSuccess: true,
    message: "Meal added successfully",
    data,
  };
}

/**
 * Updates an existing meal
 * @param {number} id - Meal ID
 * @param {Object} meal - Updated meal data
 */
async function update(id, meal) {
  const formattedMeal = {
    ...meal,
    date: formatDate(meal.date),
  };

  const { data, error } = await conn
    .from("Meals")
    .update(formattedMeal)
    .eq("id", id)
    .select("*")
    .single();

  return {
    isSuccess: !error,
    message: error?.message,
    data: data ?? null,
  };
}

/**
 * Removes a meal
 * @param {number} id - Meal ID
 */
async function remove(id) {
  const { data, error } = await conn
    .from("Meals")
    .delete()
    .eq("id", id)
    .select("*")
    .single();

  return {
    isSuccess: !error,
    message: error?.message,
    data: data ?? null,
  };
}

/**
 * Retrieves meals for a user and their friends
 * @param {number} userId - User ID
 * @param {Object} requestingUser - User making the request
 */
async function getUserAndFriendsMeals(userId, requestingUser) {
  const { data, error } = await conn
    .from("Meals")
    .select("*")
    .eq("userId", userId)
    .order("date", { ascending: false });

  if (error) {
    throw new MealError(`Failed to fetch meals: ${error.message}`);
  }

  return {
    isSuccess: true,
    message: "Meals fetched successfully.",
    data: data ?? [],
  };
}

/**
 * Updates a meal for a specific user with authorization check
 * @param {number} id - Meal ID
 * @param {Object} meal - Updated meal data
 * @param {number} userId - User ID making the request
 */
async function updateMealForUser(id, meal, userId) {
  const existingMeal = await get(id);

  if (!existingMeal.isSuccess || existingMeal.data.userId !== userId) {
    return {
      isSuccess: false,
      errorCode: 403,
      message: "You can only update your own meals.",
    };
  }

  return await update(id, meal);
}

/**
 * Deletes a meal for a specific user with authorization check
 * @param {number} id - Meal ID
 * @param {number} userId - User ID making the request
 */
async function deleteMealForUser(id, userId) {
  const existingMeal = await get(id);

  if (!existingMeal.isSuccess || existingMeal.data.userId !== userId) {
    return {
      isSuccess: false,
      errorCode: 403,
      message: "You can only delete your own meals.",
    };
  }

  return await remove(id);
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
  MealError,
};
