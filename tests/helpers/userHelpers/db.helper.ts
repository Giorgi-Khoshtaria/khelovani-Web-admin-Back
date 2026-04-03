import { MongoClient } from "mongodb";
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
    const result = await db.collection("users").updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { isVerified: true } }
    );
    
    return (result.modifiedCount > 0 || result.matchedCount > 0);
  }

  static async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}
