var AWS = require('aws-sdk');
AWS.config.region = 'us-east-2';

  function sendToSQS(messages, DelaySeconds) {
    return new Promise((resolve) => {
        const params = {
            Entries: messages.map(m => {
                return {
                    Id: createHash(),
                    DelaySeconds,
                    MessageAttributes: {},
                    MessageBody: m,
                }
            }),
            QueueUrl: 'https://sqs.us-east-2.amazonaws.com/483965429761/laskinstage',
        }
        sqs.sendMessageBatch(params, (error, data) => {
            if (error) {
                //console.log('error', error)
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
} 

 export function recursiveEnqueue(products, DelaySeconds) {
    //console.log('Enqueuing...')
    let group = products.splice(0, 30)
    let message = {"operation":"create", "products": group}
    return sendToSQS([JSON.stringify(message)], DelaySeconds)
    .then((succeed) => {
        if(products.length > 0) {
            return recursiveEnqueue(products, DelaySeconds + 40)
        } else {
            return new Promise((resolve) => resolve(succeed))
        }
    })
} 

export function recursiveEnqueueUpdate(products, DelaySeconds) {
    //console.log('Enqueuing...')
    let group = products.splice(0, 30)
    let message = {"operation":"update", "products": group}
    return sendToSQS([JSON.stringify(message)], DelaySeconds)
    .then((succeed) => {
        if(products.length > 0) {
            return recursiveEnqueueUpdate(products, DelaySeconds + 30)
        } else {
            return new Promise((resolve) => resolve(succeed))
        }
    })
}

 function createHash(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}