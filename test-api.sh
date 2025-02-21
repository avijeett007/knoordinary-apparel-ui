#!/bin/bash

# Base URL
BASE_URL="http://localhost:3000/api"

echo "Testing Order APIs..."
echo "===================="

# 1. Create a new order
echo "\n1. Creating new order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "phoneNumber": "1234567890",
    "total": 89.98,
    "items": [
      {
        "productId": "1",
        "quantity": 1,
        "size": "M",
        "price": 29.99
      },
      {
        "productId": "2",
        "quantity": 1,
        "size": "L",
        "price": 59.99
      }
    ],
    "shippingAddress": "{\"name\":\"Test User\",\"street\":\"123 Test St\",\"city\":\"Test City\",\"state\":\"TS\",\"zipCode\":\"12345\",\"country\":\"Mexico\"}",
    "paymentDetails": "{\"paymentMethod\":\"test-card\",\"paymentId\":\"test-payment-123\"}"
  }')

# Extract order ID from response
ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Created order ID: $ORDER_ID"

# 2. Get orders by phone number
echo "\n2. Getting orders by phone number..."
curl -X GET "$BASE_URL/orders?phoneNumber=1234567890"

# 3. Get specific order
echo "\n3. Getting specific order..."
curl -X GET "$BASE_URL/orders?orderId=$ORDER_ID"

# 4. Update order item size
echo "\n4. Updating order item size..."
curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"items\": [{
      \"id\": \"$ORDER_ID\",
      \"size\": \"XL\"
    }]
  }"

# 5. Update shipping status
echo "\n5. Updating shipping status..."
curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"status\": \"shipped\"
  }"

# 6. Get updated order status
echo "\n6. Getting updated order status..."
curl -X GET "$BASE_URL/orders?orderId=$ORDER_ID"

# 7. Cancel order
echo "\n7. Cancelling order..."
curl -X DELETE "$BASE_URL/orders?orderId=$ORDER_ID"

# 8. Verify cancelled order
echo "\n8. Verifying cancelled order..."
curl -X GET "$BASE_URL/orders?orderId=$ORDER_ID"

echo "\nAPI Testing Complete!"
