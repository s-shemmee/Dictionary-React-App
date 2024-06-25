import React from "react";
import Dictionary from "./components/Dictionary";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="container">
        <header className="App-header">
          <h1 className="heading">Dictionary</h1>
        </header>
        <main>
          <Dictionary defaultKeyword="aesthetic" />
        </main>
        <footer className="mt-5 footer">
          <p className="m-0 credit">
            Coded by{" "}
            <a
              href="https://github.com/s-shemmee"
              target="_blank"
              rel="noopener noreferrer"
            >
              s-shemmee
            </a>
            ,
            <a
              href="https://github.com/shemmee/Dictionary-React-App"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open sourced on Github.
            </a>{" "}
            Hosted on Vercel
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
