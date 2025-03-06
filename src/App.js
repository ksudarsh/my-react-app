import { useState } from "react";

function App() {
    const [name, setName] = useState("");

    const handleChange = (event) => {
        setName(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        alert(`Hello, ${name}!`);
    };

    return (
        <div>
            <h1>React Form</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={name} onChange={handleChange} placeholder="Enter your name" />
                <button type="submit">Submit</button>
            </form>
            <p>Your name is: {name}</p>
        </div>
    );
}

export default App;
