import { aws_dynamodb as dynamo, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from 'constructs';

///// Table format ///////////////
// AttendeeId :
// AttendeeName:
// TTL:
////////////////////

export const createAttendeeTable = (scope: Construct, id: string) => {
    const attendeeTable = new dynamo.Table(scope, "attendeeTable", {
        tableName: `${id}_AttendeeTable`,
        partitionKey: {
            name: "AttendeeId",
            type: dynamo.AttributeType.STRING,
        },
        readCapacity: 2,
        writeCapacity: 2,
        removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    return { attendeeTable }

}