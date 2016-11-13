/* eslint-disable camelcase */
const dbDriver = require('./driver');

let db;
const collections = {};
const dbName = process.env.DB_NAME;

// NOTE: This initialisation takes some time, but the code does not
// enforce waiting for it. For now it is not expected to create problems,
// but it must be done propperly later.

// Load database
dbDriver.getDatabase(dbName)
  .then(d => (db = d))
  // Load collections
  .then(() => dbDriver.getCollection(db, 'credentials'))
  .then(col => (collections.credentials = col));

module.exports = {};

/**
 * @method saveCredentials
 * @param  {String} accessTokenKey
 * @param  {String} accesTokenSecret
 * @return {Promise<void>} resolved when the record is successfully saved.
 */
module.exports.saveCredentials = ({ oauth_token, oauth_token_secret, user_id, screen_name }) => {
  const record = {
    key: oauth_token,
    secret: oauth_token_secret,
    user_id,
    screen_name,
  };

  // Remove any previous record with the same key
  return dbDriver.remove(collections.credentials, { key: record.key })
    // Save key and password in the database
    .then(() => dbDriver.insert(collections.credentials, record))
    .then(() => console.log(`Credentials for ${screen_name} saved successfully`))
    .catch(err => console.log(`Failed to save credentials for ${screen_name}: ${err}`));
};

/**
 * @method getCredentials
 * @param  {String} accessTokenKey [description]
 * @return {Promise<Object>} resolves with object containing key and secret
 */
module.exports.getCredentials = (accessTokenKey) => {
  return dbDriver.find(
    collections.credentials,
    { key: accessTokenKey }
  );
};
