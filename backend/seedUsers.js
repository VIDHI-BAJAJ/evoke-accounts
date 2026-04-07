const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  passwordHash: String,
  userId: String, // stable ID to track users across email changes
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected!");

  const users = [
    {
      userId: "user1", // stable identifier — never changes
      email: process.env.USER1_EMAIL,
      name: process.env.USER1_NAME,
      password: process.env.USER1_PASSWORD,
    },
    {
      userId: "user2", // stable identifier — never changes
      email: process.env.USER2_EMAIL,
      name: process.env.USER2_NAME,
      password: process.env.USER2_PASSWORD,
    },
  ];

  for (const u of users) {
    if (!u.email || !u.password) {
      console.log(`Skipping ${u.userId} — missing env vars`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 12);

    // Use stable userId to find the user, so email changes work correctly
    await User.findOneAndUpdate(
      { userId: u.userId },
      { userId: u.userId, email: u.email, name: u.name, passwordHash },
      { upsert: true, new: true }
    );
    console.log(`Seeded: ${u.name} (${u.email})`);
  }

  await mongoose.disconnect();
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
