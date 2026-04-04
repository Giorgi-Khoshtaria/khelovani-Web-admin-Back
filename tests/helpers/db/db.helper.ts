import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import "dotenv/config";

/**
 * Helper to directly interact with the test database using standard MongoDB driver.
 */
export class DbHelper {
  private static client: MongoClient | null = null;

  private static async getClient(): Promise<MongoClient> {
    if (this.client) return this.client;
    const uri = process.env.MONGODB_URL_TEST;
    if (!uri) throw new Error("MONGODB_URL_TEST not found in environment.");

    this.client = new MongoClient(uri, {
      connectTimeoutMS: 20000,
      serverSelectionTimeoutMS: 20000,
    });
    await this.client.connect();
    return this.client;
  }

  /**
   * Directly verify a user in the database.
   */
  static async verifyUserByEmail(email: string): Promise<boolean> {
    const client = await this.getClient();
    const db = client.db(); // uses database from connection string
    const result = await db
      .collection("users")
      .updateOne(
        { email: email.toLowerCase().trim() },
        { $set: { isVerified: true } },
      );

    return result.modifiedCount > 0 || result.matchedCount > 0;
  }

  /**
   * Create an admin user directly in the database.
   */
  static async createAdminUser(
    email: string,
    password: string,
  ): Promise<boolean> {
    const client = await this.getClient();
    const db = client.db();

    // First, get the admin role
    const role = await db.collection("roles").findOne({ name: "admin" });
    if (!role) {
      throw new Error(
        "Admin role not found in database. Run seed:roles first.",
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await db
      .collection("admins")
      .findOne({ email: email.toLowerCase().trim() });

    if (existingAdmin) {
      await db
        .collection("admins")
        .updateOne(
          { _id: existingAdmin._id },
          { $set: { password: hashedPassword, updatedAt: new Date() } },
        );
      return true;
    }

    // Create the admin user
    const result = await db.collection("admins").insertOne({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.acknowledged;
  }

  /**
   * Delete an admin user directly from the database.
   */
  static async deleteAdminUser(email: string): Promise<boolean> {
    const client = await this.getClient();
    const db = client.db();

    const result = await db.collection("admins").deleteOne({
      email: email.toLowerCase().trim(),
    });

    return result.deletedCount > 0;
  }

  /**
   * Get partner details from the database by email.
   */
  static async getPartnerByEmail(email: string): Promise<any> {
    const client = await this.getClient();
    const db = client.db();
    return db.collection("organisations").findOne({
      email: email.toLowerCase().trim(),
    });
  }

  /**
   * Create an approved partner directly in the database.
   */
  static async createApprovedPartner(
    email: string,
    password: string,
  ): Promise<boolean> {
    const client = await this.getClient();
    const db = client.db();

    // 1. Get the organisation role and ensure it's active
    await db.collection("roles").updateOne(
      { name: "organisation" },
      { $set: { isActive: true } },
      { upsert: true }
    );
    const role = await db.collection("roles").findOne({ name: "organisation" });
    if (!role) {
      throw new Error(
        "Organisation role not found in database. Run seed:roles first.",
      );
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the organisation
    const result = await db.collection("organisations").insertOne({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      status: "APPROVED", // MUST BE UPPERCASE to match new PartnerStatusEnum.APPROVED
      role: role._id,
      companyNameGe: "QA Partner Ge",
      companyNameEn: "QA Partner En",
      identificationCode: Math.random().toString().slice(2, 11),
      contactPerson: "QA Contact",
      phone: "555123456",
      city: "tbilisi",
      address: "QA Address",
      category: "art",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.acknowledged;
  }

  /**
   * Delete a partner from the database by email.
   */
  static async deletePartnerByEmail(email: string): Promise<boolean> {
    const client = await this.getClient();
    const db = client.db();
    const result = await db.collection("organisations").deleteOne({
      email: email.toLowerCase().trim(),
    });
    return result.deletedCount > 0;
  }

  static async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}
