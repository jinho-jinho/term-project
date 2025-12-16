import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";

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

// GET /api/products (전체)
router.get("/", async (req, res) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "상품 조회 실패" });
  }
});

// GET /api/products/:id (단일)
router.get("/:id", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "상품 없음" });
    return res.json(item);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "상품 조회 실패" });
  }
});

// POST /api/products (상품 등록 - 관리자, 사진 필수)
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

    // 과제 Product 스키마가 images 2개 이상일 수 있어 1개만 올린 경우 2개로 맞춤(동일 이미지 재사용)
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

// PATCH /api/products/:id/sizes (가용사이즈 변경 - 관리자)
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

// PATCH /api/products/:id/discount (할인율 변경 - 관리자)
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
