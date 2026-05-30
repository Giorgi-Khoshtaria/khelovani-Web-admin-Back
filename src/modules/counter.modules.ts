import mongoose, { Schema } from "mongoose";

/**
 * Atomic named counters (e.g. yearly order sequences). One document per key.
 * `_id` is a custom string key, so this does not extend mongoose `Document`.
 */
export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

/**
 * Returns the next unique human-readable order number, e.g. "KH-2026-00481".
 * The `$inc` is atomic, so concurrent checkouts never collide.
 */
export const nextOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `order-${year}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return `KH-${year}-${String(counter!.seq).padStart(5, "0")}`;
};

export default Counter;
