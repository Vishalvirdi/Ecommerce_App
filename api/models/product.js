const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },


  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);