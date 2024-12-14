const { getConnection } = require("./supabase");
const conn = getConnection();
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in environment variables");
}

// Generate a random 8-digit user ID
function generateUserId() {
  return Math.floor(Math.random() * 99999999) + 1;
}

// Initialize default admin user if none exists
async function initializeDefaultAdmin() {
  try {
    // Check if any admin exists
    const { count, error: countError } = await conn
      .from("Users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      console.error("Error checking for admin users:", countError);
      return;
    }

    // If no admin exists, create one
    if (count === 0) {
      const defaultAdmin = {
        id: generateUserId(),
        name: "admin",
        email: "admin@example.com",
        password: "admin123", // This should be changed immediately in production
        role: "admin",
        friends: null, // Initialize as null instead of empty array
        image: null
      };

      const { error: insertError } = await conn
        .from("Users")
        .insert([defaultAdmin]);

      if (insertError) {
        console.error("Error creating default admin:", insertError);
      } else {
        console.log("Default admin user created");
      }
    }
  } catch (err) {
    console.error("Error initializing default admin:", err);
  }
}

// Call initialization on module load
initializeDefaultAdmin();

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
        image: data.image,
        friends: Array.isArray(data.friends) ? data.friends : [],
        role: data.role ?? "user",
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
    if (!identifier || !password) {
      return {
        isSuccess: false,
        message: "Email/username and password are required",
        data: null,
      };
    }

    console.log("Login attempt for:", identifier); // Debug log

    // Convert identifier to lowercase for case-insensitive comparison
    const lowerIdentifier = identifier.toLowerCase();

    // Try to find user by email first (case-insensitive)
    let { data: emailUser, error: emailError } = await conn
      .from("Users")
      .select("*")
      .ilike("email", lowerIdentifier)
      .maybeSingle();

    // If no user found by email, try username (case-insensitive)
    if (!emailUser && !emailError) {
      const { data: nameUser, error: nameError } = await conn
        .from("Users")
        .select("*")
        .ilike("name", lowerIdentifier)
        .maybeSingle();

      if (nameError) {
        console.error("Error searching by username:", nameError);
        return {
          isSuccess: false,
          message: "Database error occurred",
          data: null,
        };
      }

      if (nameUser) {
        emailUser = nameUser;
      }
    } else if (emailError) {
      console.error("Error searching by email:", emailError);
      return {
        isSuccess: false,
        message: "Database error occurred",
        data: null,
      };
    }

    // If no user found at all
    if (!emailUser) {
      return {
        isSuccess: false,
        message: "Invalid credentials",
        data: null,
      };
    }

    // Check password
    if (emailUser.password !== password) {
      return {
        isSuccess: false,
        message: "Invalid credentials",
        data: null,
      };
    }

    const token = await createToken(emailUser, "1h");

    // Structure the response to match client expectations
    return {
      isSuccess: true,
      data: {
        token,
        users: {
          id: emailUser.id,
          name: emailUser.name,
          email: emailUser.email,
          role: emailUser.role || "user",
          image: emailUser.image,
          friends: Array.isArray(emailUser.friends) ? emailUser.friends : [],
        },
      },
    };
  } catch (err) {
    console.error("Unexpected error during login:", err);
    return {
      isSuccess: false,
      message: "An unexpected error occurred",
      data: null,
    };
  }
}

async function add(user) {
  try {
    if (!user.name || !user.email || !user.password) {
      return {
        isSuccess: false,
        message: "Missing required fields.",
        data: null,
      };
    }

    // Check if user already exists (case-insensitive)
    const { data: existingUser, error: checkError } = await conn
      .from("Users")
      .select("*")
      .or(
        `email.ilike.${user.email.toLowerCase()},name.ilike.${user.name.toLowerCase()}`
      )
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing user:", checkError);
      return {
        isSuccess: false,
        message: "Error checking user existence",
        data: null,
      };
    }

    if (existingUser) {
      return {
        isSuccess: false,
        message: "User with this email or username already exists.",
        data: null,
      };
    }

    // Add random 8-digit ID and prepare user data
    const newUser = {
      id: generateUserId(),
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password,
      role: user.role || "user",
      friends: [], // Initialize as empty array
      image: user.image || null,
    };

    console.log("Attempting to create user:", {
      ...newUser,
      password: "[REDACTED]",
    }); // Debug log

    // Insert new user
    const { data: insertedUser, error: insertError } = await conn
      .from("Users")
      .insert([newUser])
      .select()
      .single();

    if (insertError) {
      console.error("Error adding user:", insertError);
      return {
        isSuccess: false,
        message: insertError.message || "Error adding user",
        data: null,
      };
    }

    console.log("User created successfully:", {
      ...insertedUser,
      password: "[REDACTED]",
    }); // Debug log

    // Return the user with an empty array for friends in the response
    return {
      isSuccess: true,
      message: "User added successfully",
      data: {
        ...insertedUser,
        friends: [],
      },
    };
  } catch (err) {
    console.error("Unexpected error in add:", err);
    return {
      isSuccess: false,
      message: "An unexpected error occurred",
      data: null,
    };
  }
}

async function update(id, user) {
  try {
    const updateData = {
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role,
      image: user.image,
    };

    // Only include friends if it's provided
    if (user.friends !== undefined) {
      updateData.friends = user.friends.length > 0 ? user.friends : null;
    }

    const { data, error } = await conn
      .from("Users")
      .update(updateData)
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

    let newFriends = [];

    if (user.data.friends?.length == 0) {
      newFriends = [friendId];
    } else {
      newFriends = [...new Set([...(user.data.friends || []), friendId])];
    }

    const updateResult = await update(id, {
      ...user.data,
      friends: newFriends,
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

    if (!user.data.friends?.includes(friendId)) {
      return { isSuccess: false, message: "User is not a friend." };
    }

    if (user.data.friends.length == 0) {
      return { isSuccess: false, message: "You don't have any friends." };
    }

    const updatedFriends = (user.data.friends || []).filter(
      (fid) => fid !== friendId
    );
    return await update(id, { ...user.data, friends: updatedFriends });
  } catch (err) {
    console.error("Unexpected error in removeFriend:", err);
    throw err;
  }
}

async function createToken(user, expiresIn) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        userid: user.id,
        email: user.email,
        role: user.role || "user",
      },
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
