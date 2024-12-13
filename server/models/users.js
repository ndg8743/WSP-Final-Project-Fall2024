const { getConnection } = require("./supabase");
const conn = getConnection();
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in environment variables");
}

async function getAll() {
  try {
    const { data, error, count } = await conn
      .from("Users")
      .select("*", { count: "estimated" });
    return {
      isSuccess: !error,
      message: error?.message || "Unable to fetch users",
      data: data ?? [],
      total: count ?? 0,
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

    if (!data) {
      return {
        isSuccess: false,
        message: "User not found",
        data: null,
      };
    }

    return {
      isSuccess: true,
      message: null,
      data: {
        ...data,
        image: data.image ?? "/assets/User.jpg",
        friends: Array.isArray(data.friends) ? JSON.parse(data.friends) : [],
        role: data.role ?? "user", // Default role
      },
    };
  } catch (err) {
    console.error(`Unexpected error fetching user with ID ${id}:`, err);
    return {
      isSuccess: false,
      message: err.message,
      data: null,
    };
  }
}

async function login(identifier, password) {
  try {
    const { data, error } = await conn
      .from("Users")
      .select("*")
      .or(
        `name.ilike.${identifier.toLowerCase()},email.ilike.${identifier.toLowerCase()}`
      )
      .single();

    if (error || !data || data.password !== password) {
      return { isSuccess: false, message: "Invalid credentials." };
    }

    const token = await createToken(data, "1h");
    return { isSuccess: true, data, token };
  } catch (err) {
    console.error("Unexpected error during login:", err);
    throw err;
  }
}

async function add(user) {
  if (!user.name || !user.email || !user.password) {
    return {
      isSuccess: false,
      message: "Missing required fields.",
    };
  }

  try {
    const { data, error } = await conn
      .from("Users")
      .insert([
        { ...user, friends: JSON.stringify([]) }, // Ensure friends is an empty array
      ])
      .select("*")
      .single();

    return { isSuccess: !error, message: error?.message || null, data };
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
        image: user.image ?? "/assets/User.jpg",
        friends: JSON.stringify(user.friends), // Ensure friends is saved as a string
      })
      .eq("id", id)
      .select("*")
      .single();

    return { isSuccess: !error, message: error?.message || null, data };
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

async function addFriend(id, friendId) {
  try {
    const user = await get(id);
    if (!user.isSuccess || !user.data) {
      return { isSuccess: false, message: "User not found." };
    }

    const friend = await get(friendId);
    if (!friend.isSuccess || !friend.data) {
      return { isSuccess: false, message: "Friend not found." };
    }

    const updatedFriends = [...new Set([...user.data.friends, friendId])];
    const updateResult = await update(id, {
      ...user.data,
      friends: updatedFriends,
    });

    return {
      isSuccess: updateResult.isSuccess,
      message: updateResult.isSuccess
        ? "Friend added successfully"
        : updateResult.message,
    };
  } catch (err) {
    console.error("Unexpected error in addFriend:", err);
    return { isSuccess: false, message: "Server error." };
  }
}

async function removeFriend(id, friendId) {
  try {
    const user = await get(id);
    if (!user.isSuccess || !user.data) {
      return { isSuccess: false, message: "User not found." };
    }

    const updatedFriends = user.data.friends.filter((id) => id !== friendId);
    return await update(id, { ...user.data, friends: updatedFriends });
  } catch (err) {
    console.error("Unexpected error in removeFriend:", err);
    throw err;
  }
}

async function createToken(user, expiresIn) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
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
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err);
      else resolve(payload);
    });
  });
}

module.exports = {
  getAll,
  get,
  login,
  add,
  update,
  remove,
  addFriend,
  removeFriend,
  createToken,
  verifyToken,
};
