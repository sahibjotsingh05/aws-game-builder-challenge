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
    characters = string.ascii_letters + string.digits  # Letters and digits
    return ''.join(secrets.choice(characters) for _ in range(length))

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

connected_clients = {}  # Dictionary to track connected clients

@socketio.on('connect')
def handle_connect():
    token = request.args.get('token')  # Retrieve the token from the connection query string
    if not token:
        emit('server_response', {'message': 'Connection refused: No token provided'})
        return False  # Refuse the connection if no token is provided

    # Save the client connection
    connected_clients[request.sid] = token
    print(f'Client connected with token: {token}')

    # # Save to DynamoDB (connection event)
    # try:
    #     table.put_item(
    #         Item={
    #             'token': token,
    #             'event': 'connect',
    #             'timestamp': datetime.utcnow().isoformat()
    #         }
    #     )
    # except Exception as e:
    #     print(f"Error saving connection event: {e}")

    emit('server_response', {'message': 'Connected to the server!'})

@socketio.on('disconnect')
def handle_disconnect():
    token = connected_clients.pop(request.sid, None)  # Get the token for the disconnected client
    if token:
        print(f'Client disconnected with token: {token}')

        # Save to DynamoDB (disconnection event)
        # try:
        #     table.put_item(
        #         Item={
        #             'token': token,
        #             'event': 'disconnect',
        #             'timestamp': datetime.utcnow().isoformat()
        #         }
        #     )
        # except Exception as e:
        #     print(f"Error saving disconnection event: {e}")


def lambda_handler(event, context):
    return awsgi.response(app, event, context, base64_content_types={"image/png"})

if __name__ == '__main__':
    socketio.run(app)
