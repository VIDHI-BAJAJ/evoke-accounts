const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  passwordHash: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected!");

  const users = [
    {
      email: process.env.USER1_EMAIL,
      name: process.env.USER1_NAME,
      password: process.env.USER1_PASSWORD,
    },
    {
      email: process.env.USER2_EMAIL,
      name: process.env.USER2_NAME,
      password: process.env.USER2_PASSWORD,
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.findOneAndUpdate(
      { email: u.email },
      { email: u.email, name: u.name, passwordHash },
      { upsert: true }
    );
    console.log("Seeded:", u.email);
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(console.error);