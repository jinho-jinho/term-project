import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* 관리자만 */
router.use(requireAdmin);

/* (A) 관리자 상품 목록 조회 (12번 화면에 필요) */
router.get("/products", async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "상품 목록 조회 실패" });
  }
});

/* (B) 할인정책 변경 (12번) - 할인율 + 세일기간 */
router.patch("/products/:id/discount", async (req, res) => {
  try {
    const { discountRate, saleStart, saleEnd } = req.body;

    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "product not found" });

    if (discountRate !== undefined) {
      const r = Number(discountRate);
      if (Number.isNaN(r) || r < 0 || r > 100) {
        return res.status(400).json({ message: "discountRate는 0~100 사이" });
      }
      p.discountRate = r;
    }

    // 기간은 비워두면 null 처리
    if (saleStart !== undefined)
      p.saleStart = saleStart ? new Date(saleStart) : null;
    if (saleEnd !== undefined) p.saleEnd = saleEnd ? new Date(saleEnd) : null;

    await p.save();
    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "할인정책 변경 실패" });
  }
});

/* (C) 판매현황 (14번) - 기간필터 + 매출(할인적용 단가 priceSnapshot * qty) */
router.get("/sales", async (req, res) => {
  try {
    const { start, end } = req.query;

    const match = {};
    if (start || end) {
      match.paidAt = {};
      if (start) match.paidAt.$gte = new Date(start);
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        match.paidAt.$lte = endDate;
      }
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
          name: { $first: "$items.nameSnapshot" },
        },
      },
      {
        $project: {
          productId: "$_id",
          name: 1,
          quantity: 1,
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "판매현황 조회 실패" });
  }
});

/* (B-2) 가용사이즈 변경 (12번) */
router.patch("/products/:id/sizes", async (req, res) => {
  try {
    const { availableSizes } = req.body;

    if (!Array.isArray(availableSizes) || availableSizes.length === 0) {
      return res
        .status(400)
        .json({ message: "availableSizes는 1개 이상이어야 합니다." });
    }

    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "product not found" });

    p.availableSizes = availableSizes.map(Number).sort((a, b) => a - b);
    await p.save();

    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "가용사이즈 변경 실패" });
  }
});

export default router;
