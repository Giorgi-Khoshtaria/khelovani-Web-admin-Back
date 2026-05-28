import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
import mongoose from "mongoose";
import { loadTranslationCache } from "./src/types/translate.util.js";
import { getRedis } from "./src/utils/cache/redis.js";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URL_TEST!)
  .then(() => {
    console.log("MongoDB-test connected");
    loadTranslationCache();
  })
  .catch(console.error);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = () => {
  console.log("[shutdown] SIGTERM received — closing server");
  server.close(async () => {
    try {
      await mongoose.connection.close();
      const redis = getRedis();
      if (redis) await redis.quit();
      console.log("[shutdown] clean exit");
    } catch (err) {
      console.error("[shutdown] error during cleanup:", err);
    }
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
