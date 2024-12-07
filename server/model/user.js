const { getConnection } = require('./supabase');
const conn = getConnection();

/**
 * Get all users (Admin-only operation)
 * @returns {Promise<DataListEnvelope<User>>}
 */
async function getAll() {
    const { data, error, count } = await conn
        .from("users")
        .select("*", { count: "exact" });

    if (error) throw new Error(error.message);

    return {
        isSuccess: true,
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
    const { data, error } = await conn
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);

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
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    return {
        isSuccess: true,
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
    const { data, error } = await conn
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if (error) {
        return {
            isSuccess: false,
            message: "Invalid email or password",
        };
    }

    return {
        isSuccess: true,
        data: data,
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

module.exports = {
    getAll,
    get,
    add,
    update,
    remove,
    login,
    addFriend,
    removeFriend,
};
