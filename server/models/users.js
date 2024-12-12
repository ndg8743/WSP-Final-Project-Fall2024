const { getConnection } = require("./supabase");
const conn = getConnection();
const jwt = require("jsonwebtoken");

async function getAll() {
  try {
    const { data, error, count } = await conn
      .from("Users")
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
      .from("Users")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      // Normalize the user object
      data.image = data.image || "/assets/User.jpg";
      data.friends = data.friends || [];
    }

    return {
      isSuccess: !error,
      message: error?.message,
      data: data || null,
    };
  } catch (err) {
    console.error(`Unexpected error fetching user with ID ${id}:`, err);
    throw err;
  }
}

async function login(identifier, password) {
  try {
    console.log(`Attempting login for identifier: ${identifier}`);
    const { data, error } = await conn
      .from("Users")
      .select("*")
      .or(
        `name.ilike.${identifier.toLowerCase()},email.ilike.${identifier.toLowerCase()}`
      )
      .single();

    console.log("Query result:", data, "Error:", error ?? "None");

    if (error || !data) {
      return {
        isSuccess: false,
        message: "Invalid username or password.",
        data: null,
        token: null,
      };
    }

    if (data.password !== password) {
      return {
        isSuccess: false,
        message: "Invalid username or password.",
        data: null,
        token: null,
      };
    }

    const token = await createToken(data, 3600000);
    return {
      isSuccess: true,
      message: "Login successful.",
      data: { users: data, token: token },
    };
  } catch (err) {
    console.error("Unexpected error during login:", err);
    throw err;
  }
}

async function createToken(users, expiresIn) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId: users.userId, email: users.email },
      process.env.JWT_SECRET || "",
      { expiresIn },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || "", (err, users) => {
      if (err) reject(err);
      else resolve(users);
    });
  });
}

async function add(users) {
  try {
    const existingUser = await conn
      .from("Users")
      .select("*")
      .eq("id", users.id)
      .single();
    if (existingUser.data) {
      return {
        isSuccess: false,
        message: "ID already exists.",
      };
    }

    const { data, error } = await conn
      .from("Users")
      .insert([users])
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

async function update(id, user) {
  try {
    const { data, error } = await conn
      .from("Users")
      .update({
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "/assets/User.jpg",
        friends: user.friends, // Update the friends array
      })
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
      .from("Users")
      .delete()
      .eq("id", id)
      .select("*")
      .single(); // Ensure the deleted user is returned

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

async function addFriend(userId, friendId) {
  try {
    const user = await get(userId);
    if (!user.isSuccess || !user.data) {
      return { errorCode: 404, success: false, message: "User not found." };
    }

    const friend = await get(friendId);
    if (!friend.isSuccess || !friend.data) {
      return { errorCode: 404, success: false, message: "Friend not found." };
    }

    const updatedFriends = [...new Set([...user.data.friends, friendId])]; // Avoid duplicates
    const updatedUser = await update(userId, {
      ...user.data,
      friends: updatedFriends,
    });

    if (!updatedUser.isSuccess) {
      return {
        errorCode: 400,
        success: false,
        message: "Failed to add friend to friend list.",
      };
    }

    return {
      errorCode: 200,
      success: true,
      message: "Friend added successfully.",
    };
  } catch (err) {
    console.error("Unexpected error in addFriend:", err);
    return { errorCode: 500, success: false, message: "Server error." };
  }
}

async function removeFriend(userId, friendId) {
  try {
    const user = await get(userId);
    if (!user.isSuccess || !user.data) {
      return { isSuccess: false, message: "User not found." };
    }

    const updatedFriends = user.data.friends.filter((id) => id !== friendId);
    const updatedUser = await update(userId, {
      ...user.data,
      friends: updatedFriends,
    });

    return updatedUser;
  } catch (err) {
    console.error("Unexpected error in removeFriend:", err);
    throw err;
  }
}

module.exports = {
  getAll,
  get,
  login,
  add,
  update,
  remove,
  createToken,
  verifyToken,
  addFriend,
  removeFriend,
};
