import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  // 상품 이름 (필수)
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // 짧은 설명 (상세 설명 요약용)
  shortDescription: {
    type: String,
  },

  // 상품 이미지 URL 리스트 (최소 2개 이상 권장)
  images: {
    type: [String],
    default: [],
    validate: {
      // 이미지가 2개 이상인지 체크 (과제 요구사항 반영)
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: "이미지는 최소 2개 이상이어야 합니다.",
    },
  },

  // 카테고리 목록 (예: ['lifestyle'], ['slipon'], ['lifestyle','slipon'])
  categories: {
    type: [String],
    default: [],
  },

  // 기본 가격(정가)
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },

  // 할인율 (0~100%)
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // 사용 가능한 사이즈 목록 (예: [240, 245, 250])
  availableSizes: {
    type: [Number],
    default: [],
  },

  // 소재 목록 (예: ['Tree', 'Wool', 'Leather'])
  materials: {
    type: [String],
    default: [],
  },

  // 세일 시작일 (옵션)
  saleStart: {
    type: Date,
  },

  // 세일 종료일 (옵션)
  saleEnd: {
    type: Date,
  },

  // 상품 등록일 (신제품 정렬용)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", productSchema);
