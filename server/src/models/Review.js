import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // 리뷰 대상 상품 ID
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // 리뷰 작성자 ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 평점 (1~5점)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 리뷰 내용 텍스트
    content: {
      type: String,
      required: true,
    },
  },
  {
    // createdAt, updatedAt 자동 생성 
    timestamps: true,
  }
);

export default mongoose.model("Review", reviewSchema);
