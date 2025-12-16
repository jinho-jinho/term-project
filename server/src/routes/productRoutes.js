import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "상품 조회 실패" });
  }
});

// router.patch("/products/:id/discount", async (req, res) => {
//   try {
//     const { discountRate, saleStart, saleEnd } = req.body;

//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: "product not found" });

//     if (discountRate !== undefined) {
//       const r = Number(discountRate);
//       if (Number.isNaN(r) || r < 0 || r > 100) {
//         return res
//           .status(400)
//           .json({ message: "invalid discountRate (0~100)" });
//       }
//       p.discountRate = r;
//     }

//     if (saleStart !== undefined)
//       p.saleStart = saleStart ? new Date(saleStart) : null;
//     if (saleEnd !== undefined) p.saleEnd = saleEnd ? new Date(saleEnd) : null;

//     await p.save();
//     res.json(p);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "server error" });
//   }
// });

export default router;
