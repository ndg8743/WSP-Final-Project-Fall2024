/** @type {{ users: User[] }} */
const data = require("../data/users.json");

/**
 * @template T
 * @typedef {import("../../client/src/models/dataEnvelope").DataEnvelope} DataEnvelope
 * @typedef {import("../../client/src/models/dataEnvelope").DataListEnvelope} DataListEnvelope
 */
/**
 * @typedef {import("../../client/src/models/user").User} User
 */

/**
 * Get all users
 * @returns {Promise<DataListEnvelope<User>>}
 */
async function getAll() {
  return {
    isSuccess: true,
    data: data.users,
    total: data.users.length,
  };
}

/**
 * Get a user by id
 * @param {number} id
 * @returns {Promise<DataEnvelope<User>>}
 */
async function get(id) {
  const item = data.users.find((user) => user.id == id);
  return {
    isSuccess: !!item,
    data: item,
  };
}

/**
 * Add a new user
 * @param {User} user
 * @returns {Promise<DataEnvelope<User>>}
 */
async function add(user) {
  user.id = data.users.reduce((prev, x) => (x.id > prev ? x.id : prev), 0) + 1;
  user.role = user.role || 'user';
  user.friends = user.friends || [];
  user.image = user.image || '';
  user.password = user.password || '';
  data.users.push(user);
  return {
    isSuccess: true,
    data: user,
  };
}

/**
 * Update a user
 * @param {number} id
 * @param {User} user
 * @returns {Promise<DataEnvelope<User>>}
 */
async function update(id, user) {
  const userToUpdate = await get(id);
  Object.assign(userToUpdate.data, user);
  return {
    isSuccess: true,
    data: userToUpdate.data,
  };
}

/**
 * Remove a user
 * @param {number} id
 * @returns {Promise<DataEnvelope<number>>}
 */
async function remove(id) {
  const itemIndex = data.users.findIndex((user) => user.id == id);
  if (itemIndex === -1)
    throw {
      isSuccess: false,
      message: "Item not found",
      data: id,
      status: 404,
    };
  data.users.splice(itemIndex, 1);
  return { isSuccess: true, message: "Item deleted", data: id };
}

/**
 * Login a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<DataEnvelope<User>>}
 */
async function login(email, password) {
  const user = data.users.find((user) => user.email === email && user.password === password);
  if (!user) {
    return {
      isSuccess: false,
      message: "Invalid email or password",
    };
  }
  return {
    isSuccess: true,
    data: user,
  };
}

module.exports = {
  getAll,
  get,
  add,
  update,
  remove,
  login,
};