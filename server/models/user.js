const { getConnection } = require("./supabase");
const conn = getConnection();
const jwt = require("jsonwebtoken");

async function getAll() {
  try {
    const { data, error, count } = await conn
      .from("users")
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
      .eq("userid", id)
      .single();

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
      .from("Users") // Ensure this matches your table name
      .select("*")
      .or(`name.eq.${identifier},email.eq.${identifier}`)
      .single();

    console.log("Query result:", data, "Error:", error);

    if (error || !data) {
      console.error(`Login failed for identifier: ${identifier}`);
      return {
        isSuccess: false,
        message: "Invalid username/email or password",
        data: null,
        token: null,
      };
    }

    if (data.password !== password) {
      return {
        isSuccess: false,
        message: "Invalid username/email or password",
        data: null,
        token: null,
      };
    }

    const token = await createToken(data, 3600000);
    console.log(`Login successful for identifier: ${identifier}`);
    return {
      isSuccess: true,
      message: "Login successful",
      data: { user: data, token },
    };
  } catch (err) {
    console.error("Unexpected error during login:", err);
    throw err;
  }
}

async function add(user) {
  try {
    const { data, error } = await conn
      .from("users")
      .insert([
        {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          username: user.username,
          password: user.password, // Store plaintext password (not recommended)
          isadmin: user.isadmin || false,
          bio: user.bio || "",
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

async function update(id, user) {
  try {
    const { data, error } = await conn
      .from("users")
      .update({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        username: user.username,
        bio: user.bio || "",
      })
      .eq("userid", id)
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
      .from("users")
      .delete()
      .eq("userid", id)
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

async function createToken(user, expiresIn) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userid: user.userid, email: user.email },
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
    jwt.verify(token, process.env.JWT_SECRET || "", (err, user) => {
      if (err) reject(err);
      else resolve(user);
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
