const app = require('./index')

const json = {
    "Records": [
      {
        "messageId": "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
        "receiptHandle": "MessageReceiptHandle",
        "body": "{\"operation\":\"create\",\"products\":[{\"id\":123,\"title\":\"AA1\",\"body_html\":\"<strong>Good snowboard!</strong>\",\"vendor\":\"Burton\",\"status\":\"draft\",\"variants\":[{\"option1\":\"Default Title\",\"price\":\"20000.00\",\"inventory_management\":\"shopify\",\"inventory_quantity\":10,\"sku\":\"123\"}],\"tags\":\"Producto\"},{\"id\":1234,\"title\":\"AA2\",\"body_html\":\"<strong>Good snowboard!</strong>\",\"vendor\":\"Burton\",\"status\":\"draft\",\"variants\":[{\"option1\":\"Default Title\",\"price\":\"15000.00\",\"inventory_management\":\"shopify\",\"inventory_quantity\":10,\"sku\":\"1234\"}],\"tags\":\"Producto\"},{\"id\":12345,\"title\":\"AA3\",\"body_html\":\"<strong>Good snowboard!</strong>\",\"vendor\":\"Burton\",\"status\":\"draft\",\"variants\":[{\"option1\":\"Default Title\",\"price\":\"20000.00\",\"inventory_management\":\"shopify\",\"inventory_quantity\":10,\"sku\":\"12345\"}],\"tags\":\"Producto\"},{\"id\":123456,\"title\":\"AA4\",\"body_html\":\"<strong>Good snowboard!</strong>\",\"vendor\":\"Burton\",\"status\":\"draft\",\"variants\":[{\"option1\":\"Default Title\",\"price\":\"25000.00\",\"compare_at_price\":\"35000\",\"inventory_management\":\"shopify\",\"inventory_quantity\":10,\"sku\":\"123456\"}],\"tags\":\"Producto\"}]}",
        "attributes": {
          "ApproximateReceiveCount": "1",
          "SentTimestamp": "1523232000000",
          "SenderId": "123456789012",
          "ApproximateFirstReceiveTimestamp": "1523232000001"
        },
        "messageAttributes": {},
        "md5OfBody": "{{{md5_of_body}}}",
        "eventSource": "aws:sqs",
        "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:MyQueue",
        "awsRegion": "us-east-1"
      }
    ]
  }

app.handler(json)