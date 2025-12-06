import { Router } from "express";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { ensureAuth } from "../middleware/auth.js";

const router = Router();

// 상품 목록
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "상품 목록을 불러오지 못했습니다." });
  }
});

// 상품 상세
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
    res.status(500).json({ message: "상품 정보를 불러오지 못했습니다." });
  }
});

// 상품 리뷰 목록
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(
      reviews.map((r) => ({
        id: r._id,
        title: r.title,
        rating: r.rating,
        content: r.content,
        user: r.userId
          ? { id: r.userId._id, name: r.userId.name, email: r.userId.email }
          : null,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ message: "리뷰를 불러오지 못했습니다." });
  }
});

// 상품 리뷰 작성
router.post("/:productId/reviews", ensureAuth, async (req, res) => {
  try {
    const { rating, content, title } = req.body;
    const { productId } = req.params;

    const parsedRating = Number(rating);

    if (!parsedRating || !content || !title) {
      return res.status(400).json({ message: "평점, 제목, 내용을 입력해 주세요." });
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
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "이미 이 상품에 리뷰를 작성했습니다." });
    }

    const review = await Review.create({
      productId,
      userId: req.userId,
      rating: parsedRating,
      content,
      title,
    });

    return res.status(201).json({
      id: review._id,
      title: review.title,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
    });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ message: "리뷰 작성에 실패했습니다." });
  }
});

export default router;
