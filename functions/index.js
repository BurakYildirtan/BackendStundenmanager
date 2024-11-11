// Dependencies for callable functions.
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

// Firebase Cloud Function, die von der Android-App aufgerufen wird
exports.createUser = onCall(async (request) => {
    try {
        logger.info("BEGIN: createUser()");
        if (request == null) {
            throw new HttpsError('request-null', 'request is null');
        }
    
        const email = request.data.email;
        const password = request.data.password;
        const name = request.data.name;
        const surname = request.data.surname;
        const birthday = request.data.birthday;
        const street = request.data.street;
        const zipCode = request.data.zipCode;
        const city =  request.data.city;
        if (!email || !password || !name || !surname || !birthday || !street || !zipCode || !city) {
            logger.error("ERROR: Input is not complete ", { data });
            throw new HttpsError('invalid-argument', 'Nicht alle Felder sind angegeben');
        }

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
            email: email,
            name: name,
            surname: surname,
            birthday: birthday,
            street: street,
            zipCode: zipCode,
            city: city,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info("SUCCESS: create firestore-data");

        return {
            isSuccess: true,
            uid: uid,
        };

    } catch (error) {
        logger.error("ERROR: ", error);
        throw new HttpsError("internal", "Fehler beim Erstellen des Benutzers", error);
    }

  });
