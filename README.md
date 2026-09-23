# Dictionary App

A responsive React dictionary app for exploring word meanings, pronunciation, examples, synonyms, antonyms, and related imagery in a clean, accessible interface.

![Dictionary App Preview](https://github.com/s-shemmee/Dictionary-React-App/assets/56132945/6e13bff1-f7ac-47f2-b505-0cd7e9d67cd2)

*Screenshot: the dictionary search experience with pronunciation, definitions, and related media.*

## Table of Contents
- [Features](#features)
- [Accessibility](#accessibility)
- [How it Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Demo](#demo)
- [Credits](#credits)
- [Contributing](#contributing)
- [License](#license)

## Features
- Search word definitions with clean, readable result sections
- Displays part of speech categories such as noun, verb, adjective, and more
- Shows pronunciation text alongside the word
- Includes audio playback via real audio fallback when available
- Uses browser speech synthesis as a backup when no audio file is available
- Lists example sentences, synonyms, and antonyms for each meaning
- Shows image results related to the searched keyword
- Responsive layout built for desktop and mobile screens
- Accessible search form and validation states with screen-reader-friendly announcements
- Loading, warning, and error feedback for better UX

## Accessibility
This app is designed with accessibility in mind:
- semantic form and search labeling
- keyboard-friendly interactions
- visible focus states for form controls
- screen-reader announcements for loading and error states
- high-contrast status messaging for warnings and errors
- responsive layout that remains usable on smaller screens

## How it Works
The app follows a simple flow:
1. The user types a word into the search field.
2. The app requests dictionary data from the free dictionary API.
3. It normalizes the response into the app’s internal result format.
4. It presents definitions, pronunciation, part-of-speech sections, and related examples.
5. If an audio file is available, the app plays it; otherwise it falls back to browser speech synthesis.
6. Related images are fetched to enrich the result visually.

## Tech Stack
- React
- JavaScript
- CSS
- Axios
- Pexels API for related images
- Free Dictionary API for word data
- Wikimedia API for pronunciation audio fallback

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/s-shemmee/Dictionary-React-App.git
   ```
2. Open the project folder:
   ```bash
   cd Dictionary-React-App
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app in development mode:
   ```bash
   npm start
   ```
5. Open the app in your browser at:
   ```text
   http://localhost:3000
   ```

## Usage
- Type any word into the search field
- Press Search or hit Enter
- Review the definition, pronunciation, examples, and related words
- Use the audio button to hear the pronunciation when available

## Demo
A live demo of the app is available here:
- [Dictionary App](https://dictionary-app-shemmee.vercel.app)

## Credits
- Built by [s-shemmee](https://github.com/s-shemmee)
- Uses the [Free Dictionary API](https://dictionaryapi.dev) for dictionary data
- Uses the [Pexels API](https://www.pexels.com/api/documentation/) for related images
- Uses Wikimedia media sources for pronunciation audio fallback

## Contributing
Contributions are welcome.

If you’d like to improve the project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with a clear description of the update

## License
This project is licensed under the MIT License.
