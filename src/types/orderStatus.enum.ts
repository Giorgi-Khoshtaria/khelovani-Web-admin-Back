export enum OrderStatus {
  Paid = "paid", // payment done, order placed, partner to fulfil
  Delivered = "delivered", // partner marked it delivered
  Cancelled = "cancelled", // cancelled by user (while still "paid")
}
