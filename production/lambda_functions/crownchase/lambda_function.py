from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import awsgi
import secrets
import string
import requests
import datetime
import boto3
from botocore.exceptions import ClientError
import os

app = Flask(__name__, static_folder="public")
CORS(app, origins=["*"])

def generate_random_string(length=7):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def generate_six_digit_pin():
    return ''.join(secrets.choice(string.digits) for _ in range(6))


@app.route('/')
def hello():
    random_string = generate_random_string()  # Generate the 7-digit alphanumeric string
    return render_template('index.html', random_string=random_string)

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

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

@app.route('/create-game', methods=['POST'])
def create_game():
    try:
        data = request.json
        token = data.get('token')
        player_name = data.get('name')
        court_sessions = data.get('courtsessions')
        #court_sessions = 2
        profile_pic = data.get('profilepic')

        game_pin = generate_six_digit_pin()

        player_response = players_table.get_item(Key={'token': token})
        player = player_response.get('Item')

        if not player:
            return jsonify({'error': 'Player not found'}), 404

        # Insert game into the "games" table
        games_table.put_item(
            Item={
                'pin': game_pin,
                'created_by': token,
                'players': [],
                'courtsessions': court_sessions,
                'game_state': 'waiting'
            }
        )

        return jsonify({'message': 'Game created successfully', 'game_pin': game_pin}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def lambda_handler(event, context):
    return awsgi.response(app, event, context, base64_content_types={"image/png"})
