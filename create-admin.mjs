import { hashPassword } from "./server/auth.ts";
import { createUser } from "./server/db.ts";

async function createAdminUser() {
  console.log("Creating admin user...");
  
  const result = await createUser({
    username: "admin",
    email: "admin@mi42.local",
    passwordHash: await hashPassword("Admin123!"),
    name: "Administrator",
    role: "admin",
    loginMethod: "password",
    isActive: true,
  });

  if (result) {
    console.log("✓ Admin user created successfully");
    console.log("  Username: admin");
    console.log("  Password: Admin123!");
    console.log("  Email: admin@mi42.local");
  } else {
    console.error("✗ Failed to create admin user");
  }
}

createAdminUser().catch(console.error);
