// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let usersCollection;

// Connect DB then start server
connectDB().then((db) => {
  usersCollection = db.collection("users");

  // Routes
  app.get("/", (req, res) => {
    res.send("✅ API is running & connected to MongoDB Atlas");
  });

  // Get all users
  app.get("/users", async (req, res) => {
    try {
      const users = await usersCollection.find().toArray();
      // Convert ObjectId to string for frontend compatibility
      const usersWithStringId = users.map(user => ({
        ...user,
        _id: user._id.toString()
      }));
      res.json(usersWithStringId);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Add user
  app.post("/users", async (req, res) => {
    try {
      const user = req.body;
      if (!user.name || !user.email || !user.age) {
        return res.status(400).json({ message: "Name, email, and age are required" });
      }
      const result = await usersCollection.insertOne(user);
      // Return the created user with string ID
      res.status(201).json({ 
        ...user, 
        _id: result.insertedId.toString() 
      });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Get single user
  app.get("/users/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!user) return res.status(404).json({ message: "User not found" });
      
      // Convert ObjectId to string
      res.json({
        ...user,
        _id: user._id.toString()
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Update user
  app.put("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      delete updatedData._id;
      
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedData },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Convert ObjectId to string
      res.json({
        ...result.value,
        _id: result.value._id.toString()
      });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // DELETE user
  app.delete("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const result = await usersCollection.findOneAndDelete({ _id: new ObjectId(id) });
      
      if (!result.value) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "User deleted successfully", 
        user: {
          ...result.value,
          _id: result.value._id.toString()
        } 
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to connect to database:", err);
});