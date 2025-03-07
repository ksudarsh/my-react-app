import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true); // New state for email validation

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check email format before submit if email is present
    if (email && !isEmailValid) {
      setMessage("Invalid email format.");
      return; // Stop submission if the email is invalid
    }

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
      setIsEmailValid(true); //reset if name is cleared
    }
  };

  // Email format validation
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        setIsEmailValid(emailRegex.test(e.target.value));
        //check if the email is valid.
    } else {
        setIsEmailValid(true)
    }
  };

  useEffect(() => {
    // clear the email and phone if name is empty
    if (name === "") {
      setEmail("");
      setPhone("");
      setIsEmailValid(true); //reset if name is cleared
    }
  }, [name]);

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
          onChange={handleEmailChange} // Check email format on change
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
      {/* Display email validation message if email is invalid */}
      {!isEmailValid && email.length > 0 && (
        <p style={{ color: "red" }}>Invalid email format.</p>
      )}
    </div>
  );
}

export default App;
