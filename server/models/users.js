const { getConnection } = require("./supabase");
const conn = getConnection();
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in environment variables");
}

function generateUserId() {
  return Math.floor(Math.random() * 99999999) + 1;
}

async function initializeDefaultAdmin() {
  try {
    const { count, error: countError } = await conn
      .from("Users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      throw new Error(`Error checking for admin users: ${countError.message}`);
    }

    if (count === 0) {
      const defaultAdmin = {
        id: generateUserId(),
        name: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        friends: null,
        image: null
      };

      const { error: insertError } = await conn
        .from("Users")
        .insert([defaultAdmin]);

      if (insertError) {
        throw new Error(`Error creating default admin: ${insertError.message}`);
      }
    }
  } catch (err) {
    throw new Error(`Error initializing default admin: ${err.message}`);
  }
}

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
    throw new Error(`Error fetching all users: ${err.message}`);
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
    throw new Error(`Error fetching user ${id}: ${err.message}`);
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

    const lowerIdentifier = identifier.toLowerCase();

    let { data: emailUser, error: emailError } = await conn
      .from("Users")
      .select("*")
      .ilike("email", lowerIdentifier)
      .maybeSingle();

    if (!emailUser && !emailError) {
      const { data: nameUser, error: nameError } = await conn
        .from("Users")
        .select("*")
        .ilike("name", lowerIdentifier)
        .maybeSingle();

      if (nameError) {
        throw new Error(`Error searching by username: ${nameError.message}`);
      }

      if (nameUser) {
        emailUser = nameUser;
      }
    } else if (emailError) {
      throw new Error(`Error searching by email: ${emailError.message}`);
    }

    if (!emailUser) {
      return {
        isSuccess: false,
        message: "Invalid credentials",
        data: null,
      };
    }

    if (emailUser.password !== password) {
      return {
        isSuccess: false,
        message: "Invalid credentials",
        data: null,
      };
    }

    const token = await createToken(emailUser, "1h");

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
    throw new Error(`Error during login: ${err.message}`);
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

    const { data: existingUser, error: checkError } = await conn
      .from("Users")
      .select("*")
      .or(
        `email.ilike.${user.email.toLowerCase()},name.ilike.${user.name.toLowerCase()}`
      )
      .maybeSingle();

    if (checkError) {
      throw new Error(`Error checking existing user: ${checkError.message}`);
    }

    if (existingUser) {
      return {
        isSuccess: false,
        message: "User with this email or username already exists.",
        data: null,
      };
    }

    const newUser = {
      id: generateUserId(),
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password,
      role: user.role || "user",
      friends: [],
      image: user.image || null,
    };

    const { data: insertedUser, error: insertError } = await conn
      .from("Users")
      .insert([newUser])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error adding user: ${insertError.message}`);
    }

    return {
      isSuccess: true,
      message: "User added successfully",
      data: {
        ...insertedUser,
        friends: [],
      },
    };
  } catch (err) {
    throw new Error(`Error adding user: ${err.message}`);
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
    throw new Error(`Error updating user ${id}: ${err.message}`);
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
    throw new Error(`Error removing user ${id}: ${err.message}`);
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
    throw new Error(`Error adding friend: ${err.message}`);
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
    throw new Error(`Error removing friend: ${err.message}`);
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
