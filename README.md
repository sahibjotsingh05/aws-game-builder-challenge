# Project Overview

This project consists of two primary folders: **development** and **production**. Below is an explanation of their contents and functions.

## Development Folder

In the **development** folder, there is a simple Flask application. The Flask app serves as the foundation for designing the frontend by rendering HTML pages and handling JavaScript-invoked animations. It also establishes basic WebSocket connections for real-time communication between the client and server.

### Key Features:
- **Frontend Design:** HTML and JavaScript for designing the frontend interface.
- **Animations:** JavaScript code invoked for animations on the page.
- **WebSockets:** Basic WebSocket implementation for real-time updates.

## Production Folder

In the **production** folder, the architecture is hosted on AWS, where the Lambda functions manage the backend logic, and the S3 bucket stores the frontend code, including the styling (CSS) and JavaScript for handling WebSocket interactions and animations.

### Lambda Functions
The **lambda functions** are essential to the backend, performing various operations as described below:

1. **crownchase**:
   - Returns the HTML page with CSS and game assets.
   - Implements Flask routes to handle game operations, such as creating a pin and returning a token to identify users on both the frontend and backend.

2. **wsconnect**:
   - This function is invoked when a client establishes a WebSocket connection using the token.
   - It sets the player’s status to online in the backend.

3. **wsdefault**:
   - Handles basic WebSocket operations, including client communication to join a room using a pin.
   - Manages the start of the game, the minister guessing the thief, and sending messages to connected players.

4. **wsdbstream**:
   - This function is invoked when there is a change in the DynamoDB database, such as a game state change (e.g., guess availability, player entry/exit).
   - It sends updates to all connected players about the state change or game events.

5. **wsdisconnect**:
   - Triggered when a player leaves the room, either by closing the tab or disconnecting from the server.
   - It helps set the game state to invalid and ensures proper cleanup.

### S3 Bucket

The **S3 bucket** contains files crucial for the frontend, including:
- **CSS**: Governs the styling of the game interface.
- **Frontend JavaScript**: Handles the animations and WebSocket interactions that occur between the frontend and the backend.

This folder serves as the heart of the frontend, managing the overall user experience and providing the functionality necessary for real-time communication.

---

This structure supports a scalable, interactive application with a Flask-based frontend in development and AWS Lambda-based backend in production, all integrated via WebSocket communication.
