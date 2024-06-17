const update = require('./update')
const create = require('./create')

exports.handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    for (const { messageId, body } of event.Records) {
/*         console.log('SQS message %s: %j', messageId, body);
 */        
        let payload = JSON.parse(body);

        switch(payload.operation){
            case 'create':
                await create.customCreate(payload)
            case 'update':
                await update.customUpdate(payload)
        }
    }
    return `Successfully processed ${event.Records.length} messages.`;
};