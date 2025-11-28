import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "테스트 상품 1" },
    { id: 2, name: "테스트 상품 2" },
  ]);
});

export default router;
