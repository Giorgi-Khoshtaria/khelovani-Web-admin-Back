import mongoose, { Schema, Document } from "mongoose";
import { OrderStatus } from "../types/orderStatus.enum.js";

/**
 * Line item — a price/title/image SNAPSHOT taken at purchase time so later
 * product edits never mutate historical orders.
 */
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  titleGe: string;
  titleEn?: string;
  image: string;
  unitPrice: number; // charged price (after any discount)
  originalPrice: number; // pre-discount price
  quantity: number;
}

export interface IOrderContact {
  person: string;
  email: string;
  phone: string;
}

export interface IOrderAddress {
  label?: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  additionalComment?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId; // single partner per order
  items: IOrderItem[];
  itemsCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  contact: IOrderContact;
  shippingAddress: IOrderAddress;
  placedAt: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    titleGe: { type: String, required: true },
    titleEn: { type: String },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    itemsCount: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Paid,
      index: true,
    },
    contact: {
      person: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      label: { type: String },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      additionalComment: { type: String },
    },
    placedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ partner: 1, status: 1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
