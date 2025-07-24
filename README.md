# My React App

This project is a React application that displays a list of students and provides interactive functionalities for managing and grouping them.

## Project Structure

```
my-react-app
├── public
│   ├── index.html          # Main HTML file serving the React application
│   └── data
│       └── students.json   # JSON file containing student data
├── src
│   ├── components
│   │   ├── App.jsx         # Main application component
│   │   └── ClassList.jsx   # Component for displaying and managing student list
│   ├── App.css             # Styles for the application
│   ├── index.js            # Entry point of the React application
│   └── index.css           # Global styles for the application
├── package.json            # Configuration file for npm
├── .babelrc                # Babel configuration file
├── .eslintrc.json          # ESLint configuration file
└── README.md               # Documentation for the project
```

## Features

- Loads student data from a JSON file.
- Displays student names in a column format.
- Supports long press/double click to reveal additional student data in an accordion format.
- Allows single press/click to move a student's name to the bottom of the list.
- Includes a visual multi-point slider for grouping students for questions.

## Student Data Structure

The student data in `public/data/students.json` is structured as follows:

```json
[
  {"firstName": "Aiden", "lastName": "Smith", "credits": 30, "discipline": 1, "support": true},
  {"firstName": "Brianna", "lastName": "Johnson", "credits": 25, "discipline": 0, "support": false},
  {"firstName": "Carter", "lastName": "Williams", "credits": 20, "discipline": 2, "support": true},
  ...
  {"firstName": "Zoe", "lastName": "Brown", "credits": 15, "discipline": 1, "support": false}
]
```

## Getting Started

1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the development server.

## License

This project is licensed under the MIT License.