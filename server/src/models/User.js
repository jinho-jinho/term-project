import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 사용자 이메일 (로그인 ID, 유니크)
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true, // 앞뒤 공백 제거
      lowercase: true, // 소문자로 저장
    },
    // 비밀번호 해시 (bcrypt 결과)
    passwordHash: {
      type: String,
      required: true,
    },
    // 사용자 이름 (선택 필드)
    name: {
      type: String,
    },
    // 권한 역할 (일반 유저 / 관리자)
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    // createdAt, updatedAt 자동 생성
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
