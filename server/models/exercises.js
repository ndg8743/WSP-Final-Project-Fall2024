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

async function getByUserId(userId) {
  try {
    console.log("Fetching exercises for userId:", userId); // Debug log
    const { data, error } = await conn
      .from("Exercises")
      .select("*")
      .eq("userId", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching exercises:", error);
      return {
        isSuccess: false,
        message: error.message,
        data: [],
      };
    }

    console.log("Found exercises:", data); // Debug log
    return {
      isSuccess: true,
      message: "Exercises fetched successfully",
      data: data || [],
    };
  } catch (err) {
    console.error(
      `Unexpected error fetching exercises for userId ${userId}:`,
      err
    );
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
    const { data: maxIdData, error: maxIdError } = await conn
      .from("Exercises")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (maxIdError && maxIdError.code !== "PGRST116") {
      // PGRST116 means no rows found
      throw maxIdError;
    }

    console.log(maxIdData);

    const maxId = maxIdData?.id || 0; // Default to 0 if no records
    const newId = maxId + 1;

    // Ensure date is in correct format
    const formattedExercise = {
      id: newId,
      userId: exercise.userId,
      ...exercise,
      date: exercise.date
        ? new Date(exercise.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    };

    const { data, error } = await conn
      .from("Exercises")
      .insert([formattedExercise])
      .select("*")
      .single();

    if (error) {
      console.error("Error adding exercise:", error);
      return {
        isSuccess: false,
        message: error.message,
        data: null,
      };
    }

    return {
      isSuccess: true,
      message: "Exercise added successfully",
      data: data,
    };
  } catch (err) {
    console.error("Unexpected error in add:", err);
    throw err;
  }
}

async function update(id, exercise) {
  try {
    // Ensure date is in correct format
    const formattedExercise = {
      ...exercise,
      date: exercise.date
        ? new Date(exercise.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
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
    const { data, error } = await conn
      .from("Exercises")
      .select("*")
      .eq("userId", userId)
      .order("date", { ascending: false });

    if (error) {
      return { isSuccess: false, message: error.message, data: [] };
    }

    return {
      isSuccess: true,
      message: "Exercises fetched successfully.",
      data: data || [],
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
  getByUserId,
  getUserAndFriendsExercises,
  getExerciseForUser,
  updateExerciseForUser,
  deleteExerciseForUser,
};
