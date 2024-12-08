const data = require("../data/meals.json");
const { getConnection } = require("./supabase");
const conn = getConnection();

/**
 * @template T
 * @typedef {import("../../client/src/models/dataEnvelope").DataEnvelope} DataEnvelope
 * @typedef {import("../../client/src/models/dataEnvelope").DataListEnvelope} DataListEnvelope
 */
/**
 * @typedef {import("../../client/src/models/meals").Meal} Meal
 */

/**
 * Get all meals
 * @returns {Promise<DataListEnvelope<Meal>>}
 */
async function getAll() {
  const { data, error, count } = await conn
    .from("meals")
    .select("*", { count: "estimated" });
  return {
    isSuccess: !error,
    message: error?.message,
    data: data,
    total: count,
  };
}

/**
 * Get a meal by id
 * @param {number} id
 * @returns {Promise<DataEnvelope<Meal>>}
 */
async function get(id) {
  const { data, error } = await conn
    .from("meals")
    .select("*")
    .eq("id", id)
    .single();
  return {
    isSuccess: !error,
    message: error?.message,
    data: data,
  };
}

/**
 * Add a new meal
 * @param {Meal} meal
 * @returns {Promise<DataEnvelope<Meal>>}
 */
async function add(meal) {
  const { data, error } = await conn
    .from("meals")
    .insert([meal])
    .select("*")
    .single();
  return {
    isSuccess: !error,
    message: error?.message,
    data: data,
  };
}

/**
 * Update a meal
 * @param {number} id
 * @param {Meal} meal
 * @returns {Promise<DataEnvelope<Meal>>}
 */
async function update(id, meal) {
  const { data, error } = await conn
    .from("meals")
    .update(meal)
    .eq("id", id)
    .select("*")
    .single();
  return {
    isSuccess: !error,
    message: error?.message,
    data: data,
  };
}

/**
 * Remove a meal
 * @param {number} id
 * @returns {Promise<DataEnvelope<number>>}
 */
async function remove(id) {
  const { data, error } = await conn
    .from("meals")
    .delete()
    .eq("id", id)
    .select("*")
    .single();
  return {
    isSuccess: !error,
    message: error?.message,
    data: data,
  };
}

module.exports = {
  getAll,
  get,
  add,
  update,
  remove,
};
