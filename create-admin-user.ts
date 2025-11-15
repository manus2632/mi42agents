import { hashPassword } from "./server/auth";
import { createUser } from "./server/db";

async function createAdminUser() {
  console.log("Creating admin user...");
  
  try {
    const passwordHash = await hashPassword("Adm1n!");
    
    const result = await createUser({
      username: "admin",
      email: "admin@mi42.local",
      passwordHash,
      name: "Administrator",
      role: "admin",
      loginMethod: "password",
      isActive: true,
    });

    if (result) {
      console.log("✓ Admin user created successfully!");
      console.log("  Username: admin");
      console.log("  Password: Adm1n!");
      console.log("  Email: admin@mi42.local");
      console.log("  Role: admin");
      console.log("\nYou can now login at /login");
    }
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("ℹ Admin user already exists");
    } else {
      console.error("✗ Failed to create admin user:", error);
    }
  }
}

createAdminUser().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
