import { hashPassword } from "./server/auth";
import { createUser } from "./server/db";

async function createTestUsers() {
  console.log("Creating test users for all roles...\n");
  
  const testUsers = [
    {
      username: "internal_user",
      email: "internal@bl.cx",
      password: "Int3rn",
      name: "Internal Test User",
      role: "internal" as const,
      description: "Internal B+L employee"
    },
    {
      username: "external_user",
      email: "customer@example.com",
      password: "Ext3rn",
      name: "External Test User",
      role: "external" as const,
      description: "External customer"
    }
  ];

  for (const user of testUsers) {
    try {
      const passwordHash = await hashPassword(user.password);
      
      const result = await createUser({
        username: user.username,
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        loginMethod: "password",
        isActive: true,
      });

      if (result) {
        console.log(`✓ ${user.description} created successfully`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Password: ${user.password}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}\n`);
      }
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log(`ℹ ${user.description} already exists (${user.username})\n`);
      } else {
        console.error(`✗ Failed to create ${user.description}:`, error.message, "\n");
      }
    }
  }

  console.log("\n=== Test User Summary ===");
  console.log("Admin:    admin / Adm1n!");
  console.log("Internal: internal_user / Int3rn");
  console.log("External: external_user / Ext3rn");
  console.log("\nYou can now test role-based access at /login");
}

createTestUsers().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
