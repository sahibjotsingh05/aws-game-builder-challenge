import json
import boto3
import random

print('Loading function')
dynamodb = boto3.resource('dynamodb')
players_table = dynamodb.Table('players')
games_table = dynamodb.Table('games')
apigw = boto3.client('apigatewaymanagementapi', endpoint_url="https://lbd5gqoguj.execute-api.us-east-1.amazonaws.com/production/")


def lambda_handler(event, context):
	print('------------------------')
	print(event)
	#1. Iterate over each record
	try:
		for record in event['Records']:
			#2. Handle event by type
			if record['eventName'] == 'INSERT':
				handle_insert(record)
			elif record['eventName'] == 'MODIFY':
				handle_modify(record)
			elif record['eventName'] == 'REMOVE':
				handle_remove(record)
		print('------------------------')

		return "Success!"
	except Exception as e: 
		print(e)
		print('------------------------')
		return "Error"


def handle_insert(record):
	print("Handling INSERT Event")
	
	#3a. Get newImage content
	newImage = record['dynamodb']['NewImage']
	
	#3b. Parse values
	#newPlayerId = newImage['playerId']['S']

	#3c. Print it
	#print ('New row added with playerId=' + newPlayerId)

	print("Done handling INSERT Event")

def handle_modify(record):
    print("Handling MODIFY Event")
    
    newImage = record['dynamodb']['NewImage']
    
    # Extract the game_state
    game_state = newImage['game_state']['S']
    
    # Check if game_state is 'waiting'
    if game_state == 'waiting':
        # Extract the updated values for players and created_by
        players = [player['S'] for player in newImage['players']['L']]  # List of token values
        
        # Query players table for each token to get player details
        player_details = []
        connection_ids = []
        
        for token in players:
            response = players_table.get_item(Key={'token': token})
            if 'Item' in response:
                item = response['Item']
                # Manually convert Decimal fields to int or float
                player_details.append({
                    'playername': str(item['playername']),  # Ensure it's a string
                    'profilepic': str(item['profilepic'])   # Ensure it's a string
                })
                connection_ids.append(str(item['connectionId']))  # Ensure it's a string
        
        # Prepare the message data
        message_data = {
            'responseType': 'updateWaitingPlayers',
            'players': player_details,
            'createdBy': str(newImage['created_by']['S'])
        }
        
        # Send data to each connection
        for connection_id in connection_ids:
            try:
                apigw.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(message_data)  # JSON serialization is safe here
                )
                print(f"Sent data to connection: {connection_id}")
            except Exception as e:
                print(f"Error sending data to connection {connection_id}: {e}")
        
        print("Done sending player data")
    elif game_state == 'started':
        current_session = int(newImage['curr_session']['N'])
        max_sessions = int(newImage['courtsessions']['N'])
        print("debug: ",current_session, max_sessions)

        if current_session > max_sessions:
            # Emit an alternative message to all players
            players = [player['S'] for player in newImage['players']['L']]
            print("players found: ", players)
            connection_ids = []
            print("connection_ids found: ", connection_ids)
            
            for token in players:
                response = players_table.get_item(Key={'token': token})
                if 'Item' in response:
                    item = response['Item']
                    connection_ids.append(str(item['connectionId']))
            print("connection_ids found: ", connection_ids)

            # Broadcast an end-game message
            print([int(score['N']) for score in newImage['player_score']['L']])
            end_game_message = {
                'responseType': 'endGame',
                'message': 'Maximum court sessions reached. The game is over.',
                'finalScores': [int(score['N']) for score in newImage['player_score']['L']]
            }
            print("end_game_message: ", end_game_message)

            for connection_id in connection_ids:
                try:
                    apigw.post_to_connection(
                        ConnectionId=connection_id,
                        Data=json.dumps(end_game_message)
                    )
                except Exception as e:
                    print(f"Error sending end game data to connection {connection_id}: {e}")

            # Exit early since game should not continue
            return

        roles = (
            [role['S'] for role in newImage['player_roles']['L']]
            if 'player_roles' in newImage and 'L' in newImage['player_roles'] and newImage['player_roles']['L']
            else ['king', 'minister', 'thief', 'soldier']
        )
        random.shuffle(roles)
        role_indices = {roles[i]: i for i in range(4)}
        third_fouth = [role_indices['thief'], role_indices['soldier']]
        random.shuffle(third_fouth)
        role_mapping = {
            'kingIndex': role_indices['king'],
            'ministerIndex': role_indices['minister'],
            'thirdPersonIndex': third_fouth[0],
            'fourthPersonIndex': third_fouth[1]
        }

        players = [player['S'] for player in newImage['players']['L']]
        playernames = []
        playerpfps = []
        connection_ids = []
        
        print("players found: ", players)
        for token in players:
            response = players_table.get_item(Key={'token': token})
            if 'Item' in response:
                item = response['Item']
                playernames.append(str(item['playername']))
                playerpfps.append(str(item['profilepic']))
                connection_ids.append(str(item['connectionId']))
        
        # Update game state to 'guessing'
        games_table.update_item(
            Key={'pin': newImage['pin']['S']},
            UpdateExpression="SET game_state = :state, player_roles = :player_roles, right_answer = :right_answer",
            ExpressionAttributeValues={':state': 'guessing', ":player_roles": roles, ":right_answer": role_indices['thief']}
        )

        # Broadcast to all players
        print(f"connection_ids: {connection_ids}")
        print(f"roles: {roles}")
        print(f"connection_ids type: {type(connection_ids)}")
        print(f"roles type: {type(roles)}")
        for connection_id, role in zip(connection_ids, roles):
            currCard = 0
            if role == 'king':
                currCard  = 4
            if role == 'minister':
                currCard  = 5
            if role == 'soldier':
                currCard  = 6
            if role == 'thief':
                currCard  = 7
            message_data = {
                'responseType': 'rollCards',
                'currentSessions': int(newImage['courtsessions']['N']),
                'currCard': currCard,
                'players': playernames,
                'playersScore': [int(score['N']) for score in newImage['player_score']['L']],
                'playersPfp': playerpfps,
                'currSession': int(newImage['curr_session']['N']),
                **role_mapping
            }
            try:
                print(f"Sending data to connection: {connection_id}")
                print(f"Data: {message_data}")
                apigw.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(message_data)
                )
            except Exception as e:
                print(f"Error sending data to connection {connection_id}: {e}")
    elif game_state == 'invalid':
        
        players = [player['S'] for player in newImage['players']['L']]
        players_left = [player['S'] for player in newImage['leftPlayers']['L']] if 'leftPlayers' in newImage else []
        
        # Query the players table to get connection IDs for all players
        connection_ids = []
        
        for token in players:
            response = players_table.get_item(Key={'token': token})
            if 'Item' in response:
                item = response['Item']
                connection_ids.append(str(item['connectionId']))
        
        # Prepare the invalidGame message
        invalid_game_message = {
            'responseType': 'invalidGame',
            'message': 'The game has been marked as invalid.',
            'playersLeft': players_left
        }
        
        # Send the message to each connected player
        for connection_id in connection_ids:
            try:
                apigw.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(invalid_game_message)
                )
                print(f"Sent invalidGame message to connection: {connection_id}")
            except Exception as e:
                print(f"Error sending data to connection {connection_id}: {e}")
        
        print("Broadcasted invalidGame message to all connected players.")

    else:
        print(f"Game state is not 'waiting'. Current state: {game_state}")
    
    print("Done handling MODIFY Event")




def handle_remove(record):
	print("Handling REMOVE Event")

	print("Done handling REMOVE Event")