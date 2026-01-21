const http = require("http");

// Test registration
function testRegister() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      username: "testuser",
      password: "test123",
      email: "test@example.com",
    });

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/register",
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
        console.log("\n=== REGISTER TEST ===");
        console.log("Status:", res.statusCode);
        console.log("Response:", body);
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log("\n❌ Register failed:", error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test user login
function testLogin() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      username: "testuser",
      password: "test123",
    });

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/login",
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
        console.log("\n=== USER LOGIN TEST ===");
        console.log("Status:", res.statusCode);
        console.log("Response:", body);
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log("\n❌ Login failed:", error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run tests sequentially
async function runTests() {
  try {
    await testRegister();
    await testLogin();
    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.log("\n❌ Tests failed:", error.message);
  }
}

runTests();
