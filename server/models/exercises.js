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
      .select("*")
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

async function getUserAndFriendsExercises(userId, requestingUser) {
  try {
    const { data, error } = await conn.from("Exercises").select("*");

    if (error) {
      return { isSuccess: false, message: error.message, data: [] };
    }

    const exercises = data.filter(
      (exercise) =>
        exercise.userId === requestingUser.id ||
        (requestingUser.friends || []).includes(exercise.userId)
    );

    return {
      isSuccess: true,
      message: "Exercises fetched successfully.",
      data: exercises,
    };
  } catch (err) {
    console.error("Unexpected error in getUserAndFriendsExercises:", err);
    throw err;
  }
}

async function getExerciseForUser(id, user) {
  try {
    const exercise = await get(id);

    if (
      !exercise.isSuccess ||
      (exercise.data.userId !== user.id &&
        !(user.friends || []).includes(exercise.data.userId))
    ) {
      return {
        isSuccess: false,
        errorCode: 403,
        message: "You are not authorized to view this exercise.",
      };
    }

    return exercise;
  } catch (err) {
    console.error("Unexpected error in getExerciseForUser:", err);
    throw err;
  }
}

async function updateExerciseForUser(id, exercise, userId) {
  try {
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
  } catch (err) {
    console.error("Unexpected error in updateExerciseForUser:", err);
    throw err;
  }
}

async function deleteExerciseForUser(id, userId) {
  try {
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
  } catch (err) {
    console.error("Unexpected error in deleteExerciseForUser:", err);
    throw err;
  }
}

module.exports = {
  getAll,
  get,
  add,
  update,
  remove,
  getUserAndFriendsExercises,
  getExerciseForUser,
  updateExerciseForUser,
  deleteExerciseForUser,
};
