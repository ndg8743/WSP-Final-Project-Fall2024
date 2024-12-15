const { getConnection } = require("./supabase");
const conn = getConnection();

/**
 * Custom error class for exercise-related operations
 */
class ExerciseError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = 'ExerciseError';
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
 * Retrieves all exercises
 */
async function getAll() {
  const { data, error, count } = await conn
    .from("Exercises")
    .select("*", { count: "estimated" });

  return {
    isSuccess: !error,
    message: error?.message,
    data: data ?? [],
    total: count ?? 0,
  };
}

/**
 * Retrieves exercises for a specific user
 * @param {number} userId - User ID
 */
async function getByUserId(userId) {
  const { data, error } = await conn
    .from("Exercises")
    .select("*")
    .eq("userId", userId)
    .order("date", { ascending: false });

  if (error) {
    throw new ExerciseError(`Failed to fetch exercises: ${error.message}`);
  }

  return {
    isSuccess: true,
    message: "Exercises fetched successfully",
    data: data ?? [],
  };
}

/**
 * Retrieves a specific exercise by ID
 * @param {number} id - Exercise ID
 */
async function get(id) {
  const { data, error } = await conn
    .from("Exercises")
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
 * Adds a new exercise
 * @param {Object} exercise - Exercise data
 */
async function add(exercise) {
  const { data: maxIdData, error: maxIdError } = await conn
    .from("Exercises")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (maxIdError && maxIdError.code !== "PGRST116") {
    throw new ExerciseError(`Failed to generate ID: ${maxIdError.message}`);
  }

  const maxId = maxIdData?.id ?? 0;
  const newId = maxId + 1;

  const formattedExercise = {
    id: newId,
    userId: exercise.userId,
    ...exercise,
    date: formatDate(exercise.date),
  };

  const { data, error } = await conn
    .from("Exercises")
    .insert([formattedExercise])
    .select("*")
    .single();

  if (error) {
    throw new ExerciseError(`Failed to add exercise: ${error.message}`);
  }

  return {
    isSuccess: true,
    message: "Exercise added successfully",
    data,
  };
}

/**
 * Updates an existing exercise
 * @param {number} id - Exercise ID
 * @param {Object} exercise - Updated exercise data
 */
async function update(id, exercise) {
  const formattedExercise = {
    ...exercise,
    date: formatDate(exercise.date),
  };

  const { data, error } = await conn
    .from("Exercises")
    .update(formattedExercise)
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
 * Removes an exercise
 * @param {number} id - Exercise ID
 */
async function remove(id) {
  const { data, error } = await conn
    .from("Exercises")
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
 * Retrieves exercises for a user and their friends
 * @param {number} userId - User ID
 * @param {Object} requestingUser - User making the request
 */
async function getUserAndFriendsExercises(userId, requestingUser) {
  const { data, error } = await conn
    .from("Exercises")
    .select("*")
    .eq("userId", userId)
    .order("date", { ascending: false });

  if (error) {
    throw new ExerciseError(`Failed to fetch exercises: ${error.message}`);
  }

  return {
    isSuccess: true,
    message: "Exercises fetched successfully.",
    data: data ?? [],
  };
}

/**
 * Retrieves an exercise for a specific user with authorization check
 * @param {number} id - Exercise ID
 * @param {Object} user - User making the request
 */
async function getExerciseForUser(id, user) {
  const exercise = await get(id);

  if (
    !exercise.isSuccess ||
    (exercise.data.userId !== user.id &&
      !(user.friends ?? []).includes(exercise.data.userId))
  ) {
    return {
      isSuccess: false,
      errorCode: 403,
      message: "You are not authorized to view this exercise.",
    };
  }

  return exercise;
}

/**
 * Updates an exercise for a specific user with authorization check
 * @param {number} id - Exercise ID
 * @param {Object} exercise - Updated exercise data
 * @param {number} userId - User ID making the request
 */
async function updateExerciseForUser(id, exercise, userId) {
  const existingExercise = await get(id);

  if (
    !existingExercise.isSuccess ||
    existingExercise.data.userId !== userId
  ) {
    return {
      isSuccess: false,
      errorCode: 403,
      message: "You can only update your own exercises.",
    };
  }

  return await update(id, exercise);
}

/**
 * Deletes an exercise for a specific user with authorization check
 * @param {number} id - Exercise ID
 * @param {number} userId - User ID making the request
 */
async function deleteExerciseForUser(id, userId) {
  const existingExercise = await get(id);

  if (
    !existingExercise.isSuccess ||
    existingExercise.data.userId !== userId
  ) {
    return {
      isSuccess: false,
      errorCode: 403,
      message: "You can only delete your own exercises.",
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
  getUserAndFriendsExercises,
  getExerciseForUser,
  updateExerciseForUser,
  deleteExerciseForUser,
  ExerciseError,
};
