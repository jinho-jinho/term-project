import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { ensureAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../public/uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// 상품 목록
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ message: "상품 목록을 불러오지 못했습니다." });
  }
});

// 상품 상세 (+ finalPrice)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const productObj = product.toObject();
    const finalPrice = Math.round(
      product.basePrice * (1 - (product.discountRate || 0) / 100)
    );

    return res.json({ ...productObj, finalPrice });
  } catch (err) {
    console.error("Get product detail error:", err);
    return res.status(500).json({ message: "상품 정보를 불러오지 못했습니다." });
  }
});

/* =========================
   Reviews
========================= */

// 상품 리뷰 목록
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.json(
      reviews.map((r) => ({
        id: r._id,
        title: r.title,
        rating: r.rating,
        content: r.content,
        size: r.size,
        user: r.userId
          ? { id: r.userId._id, name: r.userId.name, email: r.userId.email }
          : null,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    console.error("Get reviews error:", err);
    return res.status(500).json({ message: "리뷰를 불러오지 못했습니다." });
  }
});

// 상품 리뷰 작성
router.post("/:productId/reviews", ensureAuth, async (req, res) => {
  try {
    const { rating, content, title, size } = req.body;
    const { productId } = req.params;

    const parsedRating = Number(rating);
    const parsedSize = Number(size);
    const sizeProvided = Number.isFinite(parsedSize) && !Number.isNaN(parsedSize);

    if (!parsedRating || !content || !title) {
      return res.status(400).json({ message: "평점, 제목, 내용을 모두 입력해주세요." });
    }
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "평점은 1~5 사이여야 합니다." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const existing = await Review.findOne({
      productId,
      userId: req.userId,
      ...(sizeProvided ? { size: parsedSize } : {}),
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "이미 해당 상품(해당 사이즈)에 리뷰를 작성하셨습니다." });
    }

    const review = await Review.create({
      productId,
      userId: req.userId,
      rating: parsedRating,
      content,
      title,
      size: sizeProvided ? parsedSize : undefined,
    });

    return res.status(201).json({
      id: review._id,
      title: review.title,
      rating: review.rating,
      content: review.content,
      size: review.size,
      createdAt: review.createdAt,
    });
  } catch (err) {
    console.error("Create review error:", err);
    return res.status(500).json({ message: "리뷰 작성에 실패했습니다." });
  }
});

/* =========================
   Admin
========================= */

// 상품 등록 - 관리자, 사진 필수
router.post("/", requireAdmin, upload.array("images", 8), async (req, res) => {
  try {
    const { name, shortDescription, availableSizes, discountRate } = req.body;

    if (!name) return res.status(400).json({ message: "상품명은 필수입니다." });
    if (!req.files?.length) {
      return res.status(400).json({ message: "이미지는 필수입니다." });
    }

    const sizes =
      typeof availableSizes === "string"
        ? availableSizes
            .split(",")
            .map((x) => parseInt(x.trim(), 10))
            .filter((n) => Number.isFinite(n))
        : [];

    const images = req.files.map((f) => `/uploads/${f.filename}`);

    // Product 스키마가 images 2개 이상 요구하면 1개 업로드 시 2개로 맞춤(동일 이미지 재사용)
    const images2 = images.length === 1 ? [images[0], images[0]] : images;

    const created = await Product.create({
      name,
      shortDescription: shortDescription || "",
      images: images2,
      availableSizes: sizes,
      discountRate: Number(discountRate || 0),
    });

    return res.status(201).json(created);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e?.message || "상품 등록 실패" });
  }
});

// 가용사이즈 변경 - 관리자
router.patch("/:id/sizes", requireAdmin, async (req, res) => {
  try {
    const { availableSizes } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { availableSizes: Array.isArray(availableSizes) ? availableSizes : [] } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "상품 없음" });
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "사이즈 수정 실패" });
  }
});

// 할인율 변경 - 관리자
router.patch("/:id/discount", requireAdmin, async (req, res) => {
  try {
    const { discountRate } = req.body;
    const dr = Math.max(0, Math.min(100, Number(discountRate || 0)));
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { discountRate: dr } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "상품 없음" });
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "할인 수정 실패" });
  }
});

export default router;
