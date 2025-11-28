import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    // 장바구니 소유 사용자 ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 장바구니에 담긴 상품 목록
    items: [
      {
        // 담긴 상품 ID
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // 선택한 사이즈
        size: {
          type: Number,
          required: true,
        },
        // 수량 (최소 1개 이상)
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    // 생성/수정 시각 기록 (옵션이지만 있으면 디버깅에 도움)
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
