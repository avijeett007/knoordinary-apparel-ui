#!/bin/bash

# Base URL
BASE_URL="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Order Management APIs...${NC}"
echo "=============================="

# Helper function to print test case header
print_test() {
    echo -e "\n${GREEN}$1${NC}"
    echo "------------------------------"
}

# Helper function for curl requests with JSON formatting
do_curl() {
    RESPONSE=$(curl -s -w "\n" "$@")
    # Try to format with jq if it's valid JSON
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
}

# Store test data in variables
TEST_SHIPPING_ADDRESS='{
  "name": "Test User",
  "street": "123 Test St",
  "city": "Test City",
  "state": "TS",
  "zipCode": "12345",
  "country": "Mexico"
}'

TEST_PAYMENT_DETAILS='{
  "paymentMethod": "test-card",
  "paymentId": "test-payment-123"
}'

# 1. Create a new order (Success case)
print_test "1. Creating new order (Success case)"
ORDER_RESPONSE=$(do_curl -X POST "$BASE_URL/orders" \
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
    "shippingAddress": '"$TEST_SHIPPING_ADDRESS"',
    "paymentDetails": '"$TEST_PAYMENT_DETAILS"'
  }')

# Extract order ID from response
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
echo "Created order ID: $ORDER_ID"

# 2. Create order with invalid data (should fail)
print_test "2. Creating order with invalid data (should fail)"
do_curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "phoneNumber": "1234567890"
  }'

# 3. Get all orders
print_test "3. Getting all orders"
do_curl -X GET "$BASE_URL/orders"

# 4. Get orders by phone number
print_test "4. Getting orders by phone number"
do_curl -X GET "$BASE_URL/orders?phoneNumber=1234567890"

# 5. Get specific order
print_test "5. Getting specific order"
do_curl -X GET "$BASE_URL/orders?orderId=$ORDER_ID"

# 6. Get non-existent order (should return empty array)
print_test "6. Getting non-existent order"
do_curl -X GET "$BASE_URL/orders?orderId=non-existent-id"

# 7. Update order items and shipping address
print_test "7. Updating order items and shipping address"
UPDATED_SHIPPING_ADDRESS='{
  "name": "Updated User",
  "street": "456 New St",
  "city": "New City",
  "state": "NS",
  "zipCode": "67890",
  "country": "Mexico"
}'

do_curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$ORDER_ID'",
    "status": "processing",
    "items": [
      {
        "id": "'$ORDER_ID'",
        "quantity": 2,
        "size": "XL",
        "price": 29.99
      }
    ],
    "shippingAddress": '"$UPDATED_SHIPPING_ADDRESS"'
  }'

# 8. Verify updated order
print_test "8. Verifying updated order"
do_curl -X GET "$BASE_URL/orders?orderId=$ORDER_ID"

# 9. Update order status to shipped
print_test "9. Updating order status to shipped"
do_curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$ORDER_ID'",
    "status": "shipped"
  }'

# 10. Update non-existent order (should fail)
print_test "10. Updating non-existent order"
do_curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "non-existent-id",
    "status": "shipped"
  }'

# 11. Update order with invalid status (should fail)
print_test "11. Updating order with invalid status"
do_curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$ORDER_ID'",
    "status": "invalid-status"
  }'

# 12. Cancel order
print_test "12. Cancelling order"
do_curl -X DELETE "$BASE_URL/orders?orderId=$ORDER_ID"

# 13. Verify cancelled order
print_test "13. Verifying cancelled order"
do_curl -X GET "$BASE_URL/orders?orderId=$ORDER_ID"

# 14. Try to update cancelled order (should fail)
print_test "14. Trying to update cancelled order"
do_curl -X PUT "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$ORDER_ID'",
    "status": "processing"
  }'

# 15. Create multiple orders and test pagination
print_test "15. Creating multiple orders for pagination test"
for i in {1..3}; do
  NEW_SHIPPING_ADDRESS=$(echo "$TEST_SHIPPING_ADDRESS" | jq --arg name "Test User $i" '.name = $name')
  NEW_PAYMENT_DETAILS=$(echo "$TEST_PAYMENT_DETAILS" | jq --arg id "test-payment-$i" '.paymentId = $id')
  
  do_curl -X POST "$BASE_URL/orders" \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "test-user-'$i'",
      "phoneNumber": "123456789'$i'",
      "total": 89.98,
      "items": [
        {
          "productId": "1",
          "quantity": 1,
          "size": "M",
          "price": 29.99
        }
      ],
      "shippingAddress": '"$NEW_SHIPPING_ADDRESS"',
      "paymentDetails": '"$NEW_PAYMENT_DETAILS"'
    }'
  echo -e "\nCreated test order $i"
done

echo -e "\n${GREEN}API Testing Complete!${NC}"
