import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/submit", {
        name,
        email,
        phone,
      });
      if (response.data.error) {
        setMessage(response.data.error);
      } else {
        setMessage(response.data.message);
        // Do not clear the fields here
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage("Error submitting data.");
    }
  };

  // Clear the message and other fields if name is cleared
  const handleNameInputChange = (e) => {
    setName(e.target.value);
    setMessage(""); // Clear any error/success message
    if (e.target.value === "") {
      setEmail("");
      setPhone("");
    }
  };
  useEffect(() => {
    // clear the email and phone if name is empty
    if (name === ""){
        setEmail("");
        setPhone("");
    }
  }, [name])

  return (
    <div className="container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={handleNameInputChange} // Call handleNameInputChange when name changes
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Set email on change
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)} // Set phone on change
        />
        <button type="submit">Submit</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default App;
