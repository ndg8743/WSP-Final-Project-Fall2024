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
      .from("users")
      .select("*")
      .eq("userId", id)
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
      .or(`name.ilike.${identifier.toLowerCase()},email.ilike.${identifier.toLowerCase()}`)
      .single();

    console.log("Query result:", data, "Error:", error);

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
      data: { users: data, token },
    };
  } catch (err) {
    console.error("Unexpected error during login:", err);
    throw err;
  }
}

async function add(users) {
  try {
    const { data, error } = await conn
      .from("Users")
      .insert([
        {
          firstname: users.firstname,
          lastname: users.lastname,
          email: users.email,
          username: users.username,
          password: users.password,
          isadmin: users.isadmin || false,
          bio: users.bio || "",
        },
      ])
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

async function update(id, users) {
  try {
    const { data, error } = await conn
      .from("Users")
      .update({
        firstname: users.firstname,
        lastname: users.lastname,
        email: users.email,
        username: users.username,
        bio: users.bio || "",
      })
      .eq("userId", id)
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
      .eq("userId", id)
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

module.exports = {
  getAll,
  get,
  login,
  add,
  update,
  remove,
  createToken,
  verifyToken,
};
