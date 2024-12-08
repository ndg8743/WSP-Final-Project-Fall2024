const { getConnection } = require('./supabase');
const conn = getConnection();
const jwt = require("jsonwebtoken");

/**
 * Get all users (Admin-only operation)
 * @returns {Promise<DataListEnvelope<User>>}
 */
async function getAll() {
    const { data, error, count } = await conn
        .from("users")
        .select("*", { count: "estimated" });

    return {
        isSuccess: !error,
        message: error?.message,
        data: data,
        total: count,
    };
}

/**
 * Get a user by ID
 * @param {number} id
 * @returns {Promise<DataEnvelope<User>>}
 */
async function get(id) {
    console.log(`Fetching user with ID: ${id}`);
    const { data, error } = await conn
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(`Error fetching user with ID ${id}: ${error.message}`);
        throw new Error(error.message);
    }

    console.log(`Successfully fetched user with ID: ${id}`);
    return {
        isSuccess: true,
        data: data,
    };
}

/**
 * Add a new user
 * @param {User} user
 * @returns {Promise<DataEnvelope<User>>}
 */
async function add(user) {
    const { data, error } = await conn
        .from("users")
        .insert([user])
        .single();

    return {
        isSuccess: !error,
        message: error?.message,
        data: data,
    };
}

/**
 * Update a user
 * @param {number} id
 * @param {User} user
 * @returns {Promise<DataEnvelope<User>>}
 */
async function update(id, user) {
    const { data, error } = await conn
        .from("users")
        .update(user)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    return {
        isSuccess: true,
        data: data,
    };
}

/**
 * Remove a user (Admin-only operation)
 * @param {number} id
 * @returns {Promise<DataEnvelope<number>>}
 */
async function remove(id) {
    const { data, error } = await conn
        .from("users")
        .delete()
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    return {
        isSuccess: true,
        data: data,
    };
}

/**
 * Login a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<DataEnvelope<User>>}
 */
async function login(email, password) {
    console.log(`Attempting login for email: ${email}`);
    const { data, error } = await conn
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if (error) {
        console.error(`Login error for email ${email}: ${error.message}`);
        return {
            isSuccess: false,
            message: error.message,
            data: null,
            token: null
        };
    }

    const token = await createToken(data, 3600000);
    console.log(`Login successful for email: ${email}`);
    return {
        isSuccess: true,
        message: "Login successful",
        data: { user: data, token: token }
    };
}

/**
 * Add a friend to a user's friend list
 * @param {number} userId
 * @param {number} friendId
 * @returns {Promise<DataEnvelope<User>>}
 */
async function addFriend(userId, friendId) {
    const { data, error } = await conn
        .from("users")
        .update({ friends: conn.raw('array_append(friends, ?)', [friendId]) })
        .eq("id", userId)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    return {
        isSuccess: true,
        data: data,
    };
}

/**
 * Remove a friend from a user's friend list
 * @param {number} userId
 * @param {number} friendId
 * @returns {Promise<DataEnvelope<User>>}
 */
async function removeFriend(userId, friendId) {
    const { data, error } = await conn
        .from("users")
        .update({ friends: conn.raw('array_remove(friends, ?)', [friendId]) })
        .eq("id", userId)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    return {
        isSuccess: true,
        data: data,
    };
}

async function createToken(user, expiresIn) {
    return new Promise((resolve, reject) => {
        jwt.sign({ userid: user.id, email: user.email }, process.env.JWT_SECRET ?? "", { expiresIn }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET ?? "", (err, user) => {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
}

module.exports = {
    getAll,
    get,
    add,
    update,
    remove,
    login,
    addFriend,
    removeFriend,
    createToken,
    verifyToken,
};
