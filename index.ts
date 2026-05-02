import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");
import "dotenv/config";
import mongoose from "mongoose";
import { loadTranslationCache } from "./src/types/translate.util.js";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URL_TEST!)
  .then(() => {
    console.log("MongoDB-test connected");
    loadTranslationCache();
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
