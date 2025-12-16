import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* 관리자만 접근 가능 (세션 기반) */
router.use(requireAdmin);

/* 업로드 경로 (절대경로)
   실제: server/public/img */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMG_DIR = path.join(__dirname, "../../public/img");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only jpg/png/webp allowed"), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use((err, req, res, next) => {
  if (!err) return next();
  console.error("ADMIN ROUTE ERROR:", err);
  return res.status(400).json({ message: err.message || "업로드 오류" });
});

/* (1) 상품 목록 조회 */
router.get("/products", async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json(items);
});

/* (2) 상품 등록 (사진 필수) */
router.post("/products", upload.array("images", 10), async (req, res) => {
  try {
    const {
      name,
      shortDescription = "",
      basePrice,
      discountRate = 0,
      categories = "[]",
      materials = "[]",
      availableSizes = "[]",
    } = req.body;

    if (!req.files || req.files.length < 2) {
      return res
        .status(400)
        .json({ message: "이미지는 최소 2개 이상이어야 합니다." });
    }
    if (!name?.trim()) {
      return res.status(400).json({ message: "상품명(name)은 필수입니다." });
    }
    if (!basePrice || Number(basePrice) <= 0) {
      return res
        .status(400)
        .json({ message: "basePrice는 0보다 커야 합니다." });
    }

    let cats = [];
    let mats = [];
    let sizes = [];

    try {
      cats = JSON.parse(categories);
      mats = JSON.parse(materials);
      sizes = JSON.parse(availableSizes);
    } catch {
      return res
        .status(400)
        .json({ message: "배열 필드(JSON) 형식이 올바르지 않습니다." });
    }

    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res
        .status(400)
        .json({ message: "가용사이즈를 1개 이상 선택하세요." });
    }

    const imagePaths = req.files.map((f) => `/img/${f.filename}`);
    const imagesValue = imagePaths.join(",");

    const created = await Product.create({
      name: name.trim(),
      shortDescription,
      images: imagePaths,
      categories: Array.isArray(cats) ? cats : [],
      materials: Array.isArray(mats) ? mats : [],
      basePrice: Number(basePrice),
      discountRate: Number(discountRate || 0),
      availableSizes: sizes.map(Number).sort((a, b) => a - b),
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("ADMIN CREATE PRODUCT ERROR:", err);
    return res.status(500).json({ message: err.message || "서버 오류" });
  }
});

/* (3) 가용사이즈 변경 */
router.patch("/products/:id/sizes", async (req, res) => {
  const { availableSizes } = req.body;

  if (!Array.isArray(availableSizes) || availableSizes.length === 0) {
    return res
      .status(400)
      .json({ message: "availableSizes는 1개 이상이어야 합니다." });
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { availableSizes: availableSizes.map(Number).sort((a, b) => a - b) },
    { new: true }
  );

  if (!updated)
    return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
  res.json(updated);
});

/* (4) 할인정책 변경 */
router.patch("/products/:id/discount", async (req, res) => {
  const { discountRate } = req.body;
  const rate = Number(discountRate);

  if (Number.isNaN(rate) || rate < 0 || rate > 100) {
    return res
      .status(400)
      .json({ message: "discountRate는 0~100 사이여야 합니다." });
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { discountRate: rate },
    { new: true }
  );

  if (!updated)
    return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
  res.json(updated);
});

/* (5) 판매현황 (기간 필터) */
router.get("/sales", async (req, res) => {
  const { start, end } = req.query;

  const match = {};
  if (start || end) {
    match.paidAt = {};
    if (start) match.paidAt.$gte = new Date(start);
    if (end) match.paidAt.$lte = new Date(end);
  }

  const rows = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        quantity: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.priceSnapshot", "$items.quantity"] },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        productId: "$_id",
        name: "$product.name",
        quantity: 1,
        revenue: 1,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.json(rows);
});

export default router;
