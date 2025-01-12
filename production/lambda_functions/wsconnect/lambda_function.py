import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('players')

def lambda_handler(event, context):
    # Get the connection ID and token from the event
    connection_id = event['requestContext']['connectionId']
    token = event['queryStringParameters'].get('token', 'unknown')  # Default to 'unknown' if no token is provided

    # Store the connection ID and token in DynamoDB
    table.put_item(
        Item={
            'token': token,               # Use the token provided
            'connectionId': connection_id,  # Store the connection ID
            'status': 'online'            # Add the status column
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'connectionId': connection_id})
    }
