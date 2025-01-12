from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import awsgi
import secrets
import string
import requests
import datetime
import boto3
from botocore.exceptions import ClientError
import os

app = Flask(__name__, static_folder="public")
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5000")

def generate_random_string(length=7):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def generate_six_digit_pin():
    return ''.join(secrets.choice(string.digits) for _ in range(6))


@app.route('/')
def hello():
    random_string = generate_random_string()  # Generate the 7-digit alphanumeric string
    return render_template('index.html', random_string=random_string)

dynamodb = boto3.resource(
    'dynamodb',
    region_name='us-east-1',  # Change to your region
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),  # Optional for local testing
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')  # Optional for local testing
)

# Reference the table
table = dynamodb.Table('players')

players_table = dynamodb.Table('players')
games_table = dynamodb.Table('games')

connected_clients = {}

@app.route('/add-player', methods=['POST'])
def add_player():
    """Add a new player to the DynamoDB table."""
    try:
        # Parse the incoming request
        data = request.json
        token = data['token']
        datetime_joined = data['datetimejoined']
        status = data['status']

        # Insert into DynamoDB
        response = table.put_item(
            Item={
                'token': token,  # Partition key
                'datetimejoined': datetime_joined,
                'status': status
            }
        )
        return jsonify({'message': 'Player added successfully', 'response': response}), 200

    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except ClientError as e:
        return jsonify({'error': e.response['Error']['Message']}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/validate-game-pin', methods=['POST'])
def validate_game_pin():
    try:
        data = request.json
        game_pin = data.get('game_pin')

        if not game_pin:
            return jsonify({'error': 'Game pin is required'}), 200

        # Query the DynamoDB games table for the provided pin
        response = games_table.get_item(Key={'pin': game_pin})
        game_item = response.get('Item')

        # Check if the game exists and is valid
        if not game_item:
            return jsonify({'error': 'Game pin not found'}), 200

        if game_item.get('invalid') == True:
            return jsonify({'error': 'Game PIN is invalid'}), 200

        return jsonify({'message': 'Game PIN is valid', 'game': game_item}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 200

connected_clients = {}  # Dictionary to track connected clients

@socketio.on('connect')
def handle_connect(auth):
    token = request.args.get('token')  # Retrieve the token
    if not token:
        emit('server_response', {'message': 'Connection refused: No token provided'})
        return False

    connected_clients[request.sid] = token
    print(f'Client connected with token: {token}')

    try:
        players_table.update_item(
            Key={'token': token},  # Only use 'token' as key
            UpdateExpression="SET #s = :online",
            ExpressionAttributeNames={'#s': 'status'},  # Escape reserved keywords
            ExpressionAttributeValues={':online': 'online'}
        )
        emit('server_response', {'message': 'Connected and status updated to online'})
    except ClientError as e:
        print(f"Error updating status to online: {e}")


@socketio.on('disconnect')
def handle_disconnect():
    token = connected_clients.pop(request.sid, None)  # Get the token for the disconnected client
    if token:
        print(f'Client disconnected with token: {token}')
        try:
            players_table.update_item(
                Key={'token': token},  # Only use 'token' as key
                UpdateExpression="SET #s = :offline",
                ExpressionAttributeNames={'#s': 'status'},  # Escape reserved keywords
                ExpressionAttributeValues={':offline': 'offline'}
            )
        except ClientError as e:
            print(f"Error updating status to offline: {e}")

@app.route('/create-game', methods=['POST'])
def create_game():
    try:
        data = request.json
        token = data.get('token')
        player_name = data.get('name')
        court_sessions = data.get('courtsessions')
        profile_pic = data.get('profilepic')

        # if not all([token, player_name, court_sessions, profile_pic]):
        #     return jsonify({'error': 'Missing required fields'}), 400

        # Generate a unique six-digit game pin
        game_pin = generate_six_digit_pin()

        # Fetch player record for reference
        player_response = players_table.get_item(Key={'token': token})
        player = player_response.get('Item')

        if not player:
            return jsonify({'error': 'Player not found'}), 404

        # Insert game into the "games" table
        games_table.put_item(
            Item={
                'pin': game_pin,
                'created_by': token,
                'players': [token],  # Reference to the player
                'courtsessions': court_sessions
            }
        )

        players_table.update_item(
            Key={'token': token},
            UpdateExpression="SET playername = :playername, profilepic = :profilepic",
            ExpressionAttributeValues={
                ':playername': player_name,
                ':profilepic': profile_pic
            }
        )

        return jsonify({'message': 'Game created successfully', 'game_pin': game_pin}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def lambda_handler(event, context):
    return awsgi.response(app, event, context, base64_content_types={"image/png"})

if __name__ == '__main__':
    socketio.run(app)
