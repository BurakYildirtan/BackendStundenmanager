// Dependencies for callable functions.
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions/v2");

// Dependencies for the addMessage function.
const {getDatabase} = require("firebase-admin/database");

// Saves a message to the Firebase Realtime Database but sanitizes the
// text by removing swearwords.
exports.addmessage = onCall((request) => {
    // ...
  });