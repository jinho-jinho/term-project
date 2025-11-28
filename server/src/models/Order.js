import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 주문한 사용자 ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 주문에 포함된 상품들
    items: [
      {
        // 주문 당시의 상품 ID (참조용)
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // 주문 당시 상품 이름 스냅샷 (이후 이름 변경 대비)
        nameSnapshot: {
          type: String,
          required: true,
        },
        // 주문 당시 결제 단가 스냅샷 (할인 반영된 가격)
        priceSnapshot: {
          type: Number,
          required: true,
          min: 0,
        },
        // 주문한 사이즈
        size: {
          type: Number,
          required: true,
        },
        // 주문 수량
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    // 주문 총 금액 (모든 아이템 가격 * 수량 합)
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 결제 완료 시각 (판매현황/기간 필터용)
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 생성/수정 시각 기록
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
