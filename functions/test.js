const chai = require("chai");
const constants = require("./constants.json");
const expect = chai.expect;
const admin = require("firebase-admin");
const sinon = require("sinon");
const functionsTest = require("firebase-functions-test")(
  {
    projectId: "stundenmanager-ffbb7",
  },
  "../credentials/firebase-credentials.json"
);

const myFunctions = require("./index.js");

describe("Firebase Functions Tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("Create User successfully", async () => {
    const createUserStub = sinon.stub(admin.auth(), "createUser").resolves({
      uid: "test-uid",
    });
    const setStub = sinon.stub().resolves();
    const collectionStub = sinon.stub(admin.firestore(), "collection").returns({
      doc: () => ({ set: setStub }),
    });

    const request = {
      data: {
        email: "test@example.com",
        password: "password123",
        name: "Speiyil",
        surname: "Buvi",
        birthday: "01.01.1900",
        street: "Albertusstrasse 53",
        zipCode: "72355",
        city: "Schömberg",
      },
    };

    // Aufruf der Funktion
    const result = await myFunctions.createUser.run(request);

    // Assertions
    expect(result.isSuccess).to.be.true;
    expect(result.uid).to.equal("test-uid");
    expect(createUserStub.calledOnce).to.be.true;
    expect(setStub.calledOnce).to.be.true;

    // Stubs wiederherstellen
    createUserStub.restore();
    collectionStub.restore();
  });
});