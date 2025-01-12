import boto3
import json
from boto3.dynamodb.conditions import Attr
from datetime import datetime

# Initialize AWS resources
dynamodb = boto3.resource('dynamodb')
players_table = dynamodb.Table('players')
games_table = dynamodb.Table('games')

apigw = boto3.client('apigatewaymanagementapi', endpoint_url="https://lbd5gqoguj.execute-api.us-east-1.amazonaws.com/production/")

def lambda_handler(event, context):
    try:
        # Extract the connection ID and message body
        connection_id = event['requestContext']['connectionId']
        body = json.loads(event['body'])
        action = body.get('action')  # Identify the action

        if action == "joinRoom":
            return join_room(connection_id, body)
        elif action == "startGame":
            return start_game(connection_id, body)
        elif action == "guessThief":
            return guess_thief(connection_id, body)
        elif action == "sendMessage":
            return send_room_message(body)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Unknown action'})
            }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }

def guess_thief(connection_id, body):
    gameid = body['gameid']
    player_choice = body['choice']
    
    # Step 1: Get game details from games_table using gameid
    game_response = games_table.get_item(Key={'pin': gameid})
    if 'Item' not in game_response:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Game not found'})
        }
    game_data = game_response['Item']
    last_update = game_data['updated_at']
    print("gamedata", game_data)
    
    # Step 2: Identify the minister's index from roles
    roles = game_data['player_roles']
    minister_index = roles.index('minister') if 'minister' in roles else None
    print("minister index", minister_index)
    if minister_index is None:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Minister role not found'})
        }

    # Step 3: Get the token of the minister from players
    players = game_data['players']
    if minister_index >= len(players):
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid minister index'})
        }
    minister_token = players[minister_index]

    # Step 4: Retrieve the connectionId from players_table using the token
    response = players_table.scan(
        FilterExpression=Attr('token').eq(minister_token)
    )
    if not response['Items']:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Minister not found in players table'})
        }
    minister_data = response['Items'][0]
    minister_connection_id = minister_data['connectionId']

    # Step 5: Verify if the connectionId matches
    if connection_id != minister_connection_id:
        return {
            'statusCode': 403,
            'body': json.dumps({'error': 'Unauthorized: Not the minister'})
        }

    # Step 6: Retrieve right_answer from games_table
    right_answer = int(game_data['right_answer'])
    if right_answer is None:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'right_answer not found in game data'})
        }

    connection_ids = []
    for token in players:
        response = players_table.get_item(Key={'token': token})
        if 'Item' in response:
            item = response['Item']
            connection_ids.append(str(item['connectionId']))

    # Step 7: Compare the answer
    playerScores = [int(score) for score in game_data['player_score']]
    print("playerscores", playerScores)
    last_update_datetime = datetime.fromisoformat(last_update)
    current_time = datetime.utcnow()
    time_difference = (current_time - last_update_datetime).total_seconds()
    inTime = time_difference <= 120

    print("last_update_datetime", last_update_datetime)
    print("current_time", current_time)
    print("time_difference", time_difference)
    print("inTime", inTime)

    if player_choice == right_answer and inTime:
        print("Right Answer")
        for i in range(len(playerScores)):
            if roles[i] == 'king':
                playerScores[i] += 1000
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '1000'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
            if roles[i] == 'soldier':
                playerScores[i] += 500
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '500'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
            if roles[i] == 'minister':
                playerScores[i] += 900
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '900'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
            if roles[i] == 'thief':
                playerScores[i] -= 500
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '-500'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
    else:
        print("Wrong Answer")
        for i in range(len(playerScores)):
            if roles[i] == 'king':
                playerScores[i] += 1000
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '1000'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
            if roles[i] == 'soldier':
                playerScores[i] += 500
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '500'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
            if roles[i] == 'minister':
                playerScores[i] -= 500
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '-500'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
            if roles[i] == 'thief':
                playerScores[i] += 500
                message_data = {
                    'responseType': 'deltaAura',
                    'message': '500'
                }
                apigw.post_to_connection(
                    ConnectionId=connection_ids[i],
                    Data=json.dumps(message_data)
                )
    current_datetime = datetime.utcnow().isoformat()
    games_table.update_item(
    Key={'pin': gameid},
    UpdateExpression="SET game_state = :state, curr_session = curr_session + :increment, player_score = :player_score, updated_at = :updated_at",
    ExpressionAttributeValues={
        ':state': 'started',
        ':increment': 1,
        ':player_score': playerScores,
        ':updated_at': current_datetime
    }
    )
    return {
    'statusCode': 200,
    'body': json.dumps({'message': 'Answered'})
    }


def start_game(connection_id, body):
    gameid = body['gameid']

    try:
        game_response = games_table.get_item(Key={'pin': gameid})
        if 'Item' not in game_response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Game not found'})
            }
        created_by = game_response['Item']['created_by']

        # Step 2: Retrieve the token from `players_table` where `connectionId` matches
        response = players_table.scan(
        FilterExpression=Attr('connectionId').eq(connection_id)
        )
        if not response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Player not found'})
            }
        player = response['Items'][0]
        token = player['token']

        # Step 3: Check if `created_by` matches the retrieved token
        if created_by != token:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Unauthorized action'})
            }

        # Step 4: Update the `games_table` to set `game_state` to "started" and `session` to 1
        current_datetime = datetime.utcnow().isoformat()

        games_table.update_item(
            Key={'pin': gameid},
            UpdateExpression="SET game_state = :state, curr_session = :curr_session, player_score = :player_score, updated_at = :updated_at",
            ExpressionAttributeValues={
                ':state': 'started',
                ':curr_session': 1,
                ':player_score': [0, 0, 0, 0],
                ':updated_at': current_datetime
            }
        )


        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Game started successfully'})
        }

    except Exception as e:
        print(f"Error in start_game: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }   

def join_room(connection_id, body):
    gameid = body['gameid']
    gameusertoken = body['gameusertoken']
    gamepfppic = body['gamepfppic']
    gameusername = body['gameusername']

    print("join room invoked")

    players_table.update_item(
    Key={'token': gameusertoken},
    UpdateExpression="SET playername = :playername, profilepic = :profilepic, gameRoom = :room",
    ExpressionAttributeValues={
        ':playername': gameusername,
        ':profilepic': gamepfppic,
        ':room': gameid
    }
    )

    games_table.update_item(
    Key={'pin': gameid},
    UpdateExpression="SET #players = list_append(#players, :new_player)",
    ConditionExpression="size(#players) < :max_players",
    ExpressionAttributeNames={
        '#players': 'players'
    },
    ExpressionAttributeValues={
        ':new_player': [gameusertoken],
        ':max_players': 4
    }
    )


    return {
        'statusCode': 200,
        'body': f'Joined room'
    }

def send_room_message(body):
    room_id = body['roomId']
    message = body['message']
    print("sent room message invoked")
    
    # Query connections in the specified room
    # response = table.scan(
    #     FilterExpression='RoomId = :roomId',
    #     ExpressionAttributeValues={':roomId': room_id}
    # )
    
    # Broadcast the message to all connections in the room
    # for item in response['Items']:
    #     connection_id = item['ConnectionId']
    #     try:
    # apigw.post_to_connection(
    #     ConnectionId=connection_id,
    #     Data=json.dumps({'message': message})
    # )
    #     except apigw.exceptions.GoneException:
    #         # Clean up stale connections
    #         table.delete_item(Key={'ConnectionId': connection_id})
    
    return {
        'statusCode': 200,
        'body': 'Message sent'
    }
