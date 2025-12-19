const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ticket.2cd4lt9.mongodb.net/?appName=ticket`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const email = process.argv[2];

  if (!email) {
    console.log("Please provide an email address.");
    console.log("Usage: node scripts/setAdmin.js <email>");
    process.exit(1);
  }

  try {
    await client.connect();
    const db = client.db("ticketBookingDB");
    const usersCollection = db.collection("users");

    const filter = { email: email };
    const updateDoc = {
      $set: {
        role: "admin",
      },
    };

    const result = await usersCollection.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${email} is already an admin or role didn't change.`);
    } else {
      console.log(`Successfully made ${email} an admin!`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
