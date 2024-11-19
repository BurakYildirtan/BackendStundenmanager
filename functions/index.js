// Dependencies for callable functions.
const constants = require("./constants.json");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

// Firebase Cloud Function, die von der Android-App aufgerufen wird
exports.createUser = onCall(async (request) => {
    try {
        logger.info("BEGIN: createUser()");
        if (request == null) {
            throw new HttpsError(constants.ERR_CODE_NULL, 'request is null');
        }
    
        const errStr = "";

        const email = request.data.email;
        if(!isEmailValid(email)) errStr += "email is not valid.";

        const password = request.data.password;
        if(!isPasswordValid(password))  errStr += "password is not valid.";

        const name = request.data.name;
        if(!isNameValid(name))  errStr += "name is not valid.";

        const surname = request.data.surname;
        if(!isNameValid(surname))  errStr += "surname is not valid.";

        const birthday = request.data.birthday;
        if(!isBdayValid(birthday))  errStr += "birthday is not valid.";

        const street = request.data.street;
        if(!isNameValid(street))  errStr += "street is not valid.";

        const zipCode = request.data.zipCode;
        if(!isNameValid(zipCode))  errStr += "zipcode is not valid.";

        const city =  request.data.city;
        if(!isNameValid(city))  errStr += "city is not valid.";

        if(errStr != "") throw new HttpsError(constants.ERR_CODE_INVALID_ARGUMENT, errStr);

        logger.info("BEGIN: create auth-user");
        const user = await admin.auth().createUser({
            email: email,
            password: password,
        });
        logger.info("SUCCESS: create auth-user");

        logger.info("BEGIN: create firestore-data");
        const uid = user.uid;
        const userRef = admin.firestore().collection('users').doc(uid);
        await userRef.set({
            name: name,
            surname: surname,
            birthday: birthday,
            street: street,
            zipCode: zipCode,
            city: city,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        logger.info("SUCCESS: create firestore-data");

        return {
            isSuccess: true,
            uid: uid,
            name: name,
            surname: surname,
            birthday: birthday,
            street: street,
            zipCode: zipCode,
            city: city,
        };
    } catch (error) {
        logger.error("ERROR: ", error);
        throw new HttpsError(constants.ERR_CODE_INTERNAL, "User could not be created: ", error);
    }
  });

function isEmailValid(email) {
    if(!email) return false;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    return true;
}

function isPasswordValid(password) {
    if(!password) return false;

    const regex = /^[a-zA-Z0-9äöüÄÖÜ]{6,}$/;
    if(!regex.test(password)) return false;

    return true;
}

function isNameValid(name) {
    if(!name) return false;

    const regex = /^[a-zA-Z0-9äöüÄÖÜ]$/;
    if(!regex.test(name)) return false;

    return true;
}

function isBdayValid(birthday) {
    if(!birthday) return false;

    const regex = /^\d{2}\.\d{2}\.\d{4}$/;
    if(!regex.test(birthday)) return false;

    return true;
}

function isStreetValid(street) {
    if(!street) return false;

    const streetRegex = /^[a-zA-ZäöüÄÖÜß0-9.,\- ]+$/;
    if(!regex.test(street)) return false;

    return true;
}

function isZipCodeValid(zipCode) {
    if(!zipCode) return false;

    const regex = /^[0-9]{5,7}/;
    if(!regex.test(zipCode)) return false;

    return true;
}

exports.createSession = onCall(async (request) => {
    try {
        logger.info("BEGIN: createSession()");
        if (request == null) {
            throw new HttpsError(constants.ERR_CODE_NULL, 'request is null');
        }
    
        const errStr = "";

        const uid = request.data.uid;
        if(!uid) errStr += "uid is null.";

        const startTime = request.data.startTime;
        if(!isStartTimeValid(startTime)) errStr += "startTime is not valid.";

        const endTime = request.data.endTime;
        if(!isEndTimeValid(startTime, endTime))  errStr += "endTime is not valid";

        if(errStr != "") throw new HttpsError(constants.ERR_CODE_INVALID_ARGUMENT, errStr);

        const sessionRef = admin.firestore().collection(constants.COLLECTION_USERS).doc(uid).collection(constants.COLLECTION_SESSIONS);


        const querySnapshot = await sessionRef.where("startTime", ">=", startTime)
            .where("startTime", "<=", endTime)
            .limit(1)
            .get();

        if(!querySnapshot.empty) {
            throw new HttpsError(constants.ERRO_CODE_SESSION_EXISTS, "Session already exists");
        }
        
        logger.info("BEGIN: create firestore-data");
        await sessionRef.set({
            startTime: startTime,
            endTime: endTime,
            breaks: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        logger.info("SUCCESS: create firestore-data");

        return {
            isSuccess: true
        };
    } catch (error) {
        logger.error("ERROR: ", error);
        throw new HttpsError(constants.ERR_CODE_INTERNAL, "Session could not created: ", error);
    }
  });

//Is valid check
function isStartTimeValid(startTime) {
    if(!startTime) return false;
    return true;
}

function isEndTimeValid(startTime, endTime) {
    if(!endTime) return false;
    if((startTime - endTime) < 0) return false;
    return true;
}

function isBreaksValid(breaks) {
    return true;
}