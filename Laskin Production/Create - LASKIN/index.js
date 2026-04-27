const update = require('./update')
const create = require('./create')

function summarizeProducts(products) {
    return (products || []).slice(0, 5).map((product) => ({
        id: product.id,
        title: product.title,
        status: product.status,
        sku: product.variants && product.variants[0] ? product.variants[0].sku : undefined,
        price: product.variants && product.variants[0] ? product.variants[0].price : undefined,
        inventory_quantity: product.variants && product.variants[0] ? product.variants[0].inventory_quantity : undefined,
        inventory_policy: product.variants && product.variants[0] ? product.variants[0].inventory_policy : undefined,
    }));
}

exports.handler = async (event) => {
    console.log('[CreateLambda] received event', {
        recordsCount: event.Records ? event.Records.length : 0,
    });

    for (const { messageId, body } of event.Records) {
        console.log('[CreateLambda] processing SQS message', {
            messageId,
            rawBodyLength: body ? body.length : 0,
        });

        let payload = JSON.parse(body);
        console.log('[CreateLambda] parsed payload', {
            messageId,
            operation: payload.operation,
            productsCount: payload.products ? payload.products.length : 0,
            sample: summarizeProducts(payload.products),
        });

        switch(payload.operation){
            case 'create':
                console.log('[CreateLambda] dispatching create operation', { messageId });
                await create.customCreate(payload)
                break
            case 'update':
                console.log('[CreateLambda] dispatching update operation', { messageId });
                await update.customUpdate(payload)
                break
            default:
                console.warn('[CreateLambda] unsupported operation', {
                    messageId,
                    operation: payload.operation,
                })
        }

        console.log('[CreateLambda] finished SQS message', { messageId });
    }

    console.log('[CreateLambda] finished invocation', {
        recordsCount: event.Records ? event.Records.length : 0,
    });

    return `Successfully processed ${event.Records.length} messages.`;
};
