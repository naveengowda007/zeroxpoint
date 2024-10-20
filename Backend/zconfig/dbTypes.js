const dbTypes = {
  payment_info: ["id", "userid", "payment_type", "payment_data", "is_deleted"],
  users: [
    "id",
    "userid",
    "name",
    "phone",
    "email",
    "password",
    "notification_token",
    "default_location_id",
    "default_payment_id",
    "is_deleted",
    "is_verified",
    "created_at",
  ],
  user_locations: [
    "id",
    "userid",
    "name",
    "phone",
    "address_text",
    "latitude",
    "longitude",
    "is_deleted",
  ],
  shops: [
    "id",
    "userid",
    "vendor_name",
    "phone",
    "email",
    "password",
    "shop_name",
    "address_text",
    "latitude",
    "longitude",
    "default_payment_id",
    "default_priceTable_id",
    "is_deleted",
    "created_at",
  ],
  delivery_agents: [
    "id",
    "userid",
    "name",
    "phone",
    "email",
    "password",
    "notification_token",
    "default_location_id",
    "default_payment_id",
    "is_deleted",
    "is_verified",
    "ratings",
    "created_at",
  ],
  cart: ["id", "userid", "cartid", "order_details", "created_at"],
  orders: [
    "id",
    "userid",
    "cartid",
    "delivery_location",
    "created_at",
    "shop_id",
    "delivery_user_id",
    "pickup_delivery_user_id",
    "order_details",
    "order_type",
    "status",
  ],
  otp: ["id", "userid", "otp", "created_at"],
  admin: [
    "id",
    "userid",
    "name",
    "phone",
    "email",
    "password",
    "level",
    "notification_token",
    "is_deleted",
    "is_verified",
  ],
  adminpricetable: ["id", "price_table", "created_at"],
  vendorpricetable: ["id", "userid", "price_table", "created_at"],
};

module.exports = dbTypes;
