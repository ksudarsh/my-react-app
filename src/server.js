const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Configure CORS to allow requests from your React app's origin
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your React app's URL if deployed
  methods: "POST", // Specify allowed methods
  allowedHeaders: "Content-Type", // Specify allowed headers
};
app.use(cors(corsOptions));
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbybnpgrkBN3zlyMGQ48AYOhfh9yIMiqZQYzBOoya_x64bU4qFESOPXGVgiZfA1TWB3h/exec", // Replace this with the Google Apps Script URL you copied
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error in /submit:", error); // Log the error for debugging
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
