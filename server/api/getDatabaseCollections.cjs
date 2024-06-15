const {
  GROUPS_INTEGRATION_COLLECTION,
  GROUPS_PROD_COLLECTION,
  PIECES_INTEGRATION_COLLECTION,
  PIECES_PROD_COLLECTION,
  PUZZLES_INTEGRATION_COLLECTION,
  PUZZLES_PROD_COLLECTION,
} = require("../constants.cjs");

module.exports.default = function (db, data) {
  const collections = {};
  // console.log("getDatabaseCollections", data);
  collections.puzzles = data.integration
    ? db.collection(PUZZLES_INTEGRATION_COLLECTION)
    : db.collection(PUZZLES_PROD_COLLECTION);
  collections.pieces = data.integration
    ? db.collection(PIECES_INTEGRATION_COLLECTION)
    : db.collection(PIECES_PROD_COLLECTION);
  collections.groups = data.integration
    ? db.collection(GROUPS_INTEGRATION_COLLECTION)
    : db.collection(GROUPS_PROD_COLLECTION);

  return collections;
};
