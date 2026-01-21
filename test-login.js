// test-login.js - Test admin login endpoint
const http = require("http");

const data = JSON.stringify({
  username: "admin",
  password: "admin1",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/admin/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  let body = "";

  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("\n=== ADMIN LOGIN TEST ===");
    console.log("Status:", res.statusCode);
    console.log("Response:", body);
    console.log("========================\n");

    try {
      const json = JSON.parse(body);
      if (json.success) {
        console.log("✅ Login SUCCESS!");
        console.log("Token:", json.token.substring(0, 30) + "...");
      } else {
        console.log("❌ Login FAILED:", json.message);
      }
    } catch (e) {
      console.log("❌ Invalid JSON response");
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("Make sure server is running: npm start");
});

req.write(data);
req.end();
