# Online Pong Game

Welcome to the Online Pong Game! This project is part of the 42 School Common Core curriculum. It features a multiplayer online Pong game with chat functionality, leaderboards, user profile management, channels for group interactions, and the ability to play against friends or AI.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Technologies Used](#technologies-used)
6. [Contributing](#contributing)
7. [License](#license)
8. [Acknowledgements](#acknowledgements)

## Introduction

The Online Pong Game is a web-based application that allows users to play the classic Pong game online. Users can chat with each other, view and compete on leaderboards, customize their user profiles, and create or join channels for group chating. The game can be played against other users or an AI opponent.

## Features

- **Multiplayer Gameplay**: Play Pong with friends or against AI.
- **Chat**: Real-time chat functionality.
- **Leaderboards**: Track top players and scores.
- **User Profile**: Change user information and customize profile.
- **Channels**: Create and join channels for group interactions.
- **Friends System**: Add and manage friends for easy matchmaking.

## Installation

To install and run the Online Pong Game, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/UBA-code/pong.git
   cd pong
2. **Set up environment variables**:
   an `.env` example file located in the root directory, add the necessary environment variables.

3. **Run the application**:
  (before starting, docker and docker compose need to be installed already)
   ```sh
   docker compose up --build
## Usage

1. **/login**: log in with Intra account.
2. **/settings**: Customize your user profile with personal information and preferences.
3. **/play**: Start a game with a friend, or play against AI.
4. **/chat**: Use the chat feature to communicate with other players in real-time or join others channels.
5. **/leaderbard**: Check the leaderboards to see top players and scores.
5. **/profile**: Check you profile and see games history, friends request and statistics.

## Technologies Used

- **Frontend**:
  - HTML/CSS
  - tailwind (css styling)
  - framer motion (animations)
  - Typescript (React)
  - redux (states managment)
  - axios (HTTP client)
  - react query (handling http request and support caching)

- **Backend**:
  - Nest
  - PostgreSQL
  - Socket.io

- **Other Tools**:
  - Docker (optional for containerization)


## Acknowledgements

Special thanks to the 42 School for the opportunity and resources to complete this project. Thanks to all the testers who helped improve this game.
