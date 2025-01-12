import boto3
import json

# DynamoDB resource
dynamodb = boto3.resource('dynamodb')
games_table = dynamodb.Table('games')
table = dynamodb.Table('players')  # Replace with your actual table name

def lambda_handler(event, context):
    # Get the connection ID from the event
    connection_id = event['requestContext']['connectionId']
    
    # Query the DynamoDB table to find the record with the connection ID
    response = table.scan(
        FilterExpression="connectionId = :connectionId",
        ExpressionAttributeValues={
            ":connectionId": connection_id
        }
    )
    
    # If an item with the connection ID is found, update its status to "offline"
    if 'Items' in response and response['Items']:
        item = response['Items'][0]  # Get the first matching item
        token = item['token']  # Retrieve the token (partition key) from the item
        gameRoom = item['gameRoom']
        player_name = item['playername']
        
        # Update the item's status
        table.update_item(
            Key={'token': token},  # Use the token as the key
            UpdateExpression="set #status = :status",
            ExpressionAttributeNames={
                '#status': 'status'
            },
            ExpressionAttributeValues={
                ':status': 'offline'
            }
        )

        games_table.update_item(
            Key={'pin': gameRoom},
            UpdateExpression="""
                set game_state = :invalid, 
                leftPlayers = list_append(if_not_exists(leftPlayers, :empty_list), :player_name_list)
            """,
            ExpressionAttributeValues={
                ':invalid': 'invalid',
                ':empty_list': [],
                ':player_name_list': [player_name]
            },
            ReturnValues="UPDATED_NEW"
        )

        print(f"Status for connection ID {connection_id} updated to 'offline'")
    else:
        print(f"Connection ID {connection_id} not found in DynamoDB")
    
    return {
        'statusCode': 200,
        'body': json.dumps('Disconnected and status updated')
    }
