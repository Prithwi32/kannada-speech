// test-api.js - Quick test of API endpoints
require("dotenv").config();

const testURL = process.argv[2] || "http://localhost:3000";

console.log(`Testing API at: ${testURL}\n`);

// Test 1: Health check
fetch(`${testURL}/api/children`)
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ GET /api/children - SUCCESS");
    console.log(`   Found ${data.length} children`);
  })
  .catch((err) => {
    console.error("❌ GET /api/children - FAILED");
    console.error(`   Error: ${err.message}`);
  });

// Test 2: Admin login
setTimeout(() => {
  fetch(`${testURL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "admin1",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log("\n✅ POST /api/admin/login - SUCCESS");
        console.log(`   Token: ${data.token.substring(0, 20)}...`);
      } else {
        console.log("\n❌ POST /api/admin/login - FAILED");
        console.log(`   Message: ${data.message}`);
      }
    })
    .catch((err) => {
      console.error("\n❌ POST /api/admin/login - FAILED");
      console.error(`   Error: ${err.message}`);
    });
}, 1000);

// Test 3: SODA analysis endpoint
setTimeout(() => {
  fetch(`${testURL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_word: "test",
    }),
  })
    .then((res) => res.text())
    .then((data) => {
      console.log("\n✅ POST /api/analyze - Response received");
      console.log(`   Status: ${data.substring(0, 50)}...`);
    })
    .catch((err) => {
      console.error("\n❌ POST /api/analyze - FAILED");
      console.error(`   Error: ${err.message}`);
    });
}, 2000);

console.log("\nRunning tests...\n");
