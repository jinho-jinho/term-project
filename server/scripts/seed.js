// server/scripts/seed.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import "../src/config/db.js"; // MongoDB 연결
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";

dotenv.config();

async function seed() {
  try {
    console.log("🌱 Seeding start...");

    // 1) 기존 데이터 제거 (원하면 주석 처리 가능)
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log("🧹 Old data cleared");

    // 2) 관리자 + 일반 유저 생성
    const adminPassword = await bcrypt.hash("admin1234", 10);
    const userPassword = await bcrypt.hash("user1234", 10);

    const admin = await User.create({
      email: "admin@test.com",
      passwordHash: adminPassword,
      name: "관리자",
      role: "admin",
    });

    const user1 = await User.create({
      email: "user1@test.com",
      passwordHash: userPassword,
      name: "홍길동",
      role: "customer",
    });

    const user2 = await User.create({
      email: "user2@test.com",
      passwordHash: userPassword,
      name: "김철수",
      role: "customer",
    });

    console.log("👤 Admin & users created");

    // 3) 제품 데이터 생성 (라이프스타일 10개 이상, 슬립온 10개 이상)

    const today = new Date();
    const daysAgo = (n) => new Date(today.getTime() - n * 24 * 60 * 60 * 1000);

    // 공통 helper
    const baseImagePath = "/img";

    // 슬립온 10개 이상
    const sliponProducts = [
      {
        name: "Tree Slip-on Basic",
        shortDescription: "데일리로 신기 좋은 트리 슬립온",
        images: [`${baseImagePath}/slipon_tree1.jpg`, `${baseImagePath}/slipon_tree2.jpg`],
        categories: ["slipon"],
        basePrice: 59000,
        discountRate: 10,
        availableSizes: [235, 240, 245, 250, 255, 260],
        materials: ["Tree"],
        createdAt: daysAgo(40), // 약간 예전 제품
      },
      {
        name: "Tree Slip-on Light",
        shortDescription: "가벼운 착화감의 라이트 버전",
        images: [`${baseImagePath}/slipon_tree_light1.jpg`, `${baseImagePath}/slipon_tree_light2.jpg`],
        categories: ["slipon"],
        basePrice: 62000,
        discountRate: 0,
        availableSizes: [240, 245, 250, 255],
        materials: ["Tree", "Mesh"],
        createdAt: daysAgo(20),
      },
      {
        name: "Wool Slip-on Warm",
        shortDescription: "겨울철 보온성 좋은 울 슬립온",
        images: [`${baseImagePath}/slipon_warm1.jpg`, `${baseImagePath}/slipon_warm2.jpg`],
        categories: ["slipon"],
        basePrice: 75000,
        discountRate: 20,
        availableSizes: [230, 235, 240, 245],
        materials: ["Wool"],
        createdAt: daysAgo(60),
      },
      {
        name: "Premium Leather Slip-on",
        shortDescription: "고급 가죽 소재 프리미엄 슬립온",
        images: [`${baseImagePath}/slipon_leather1.jpg`, `${baseImagePath}/slipon_leather2.jpg`],
        categories: ["slipon"],
        basePrice: 120000,
        discountRate: 15,
        availableSizes: [250, 255, 260, 265],
        materials: ["Leather"],
        createdAt: daysAgo(10), // 비교적 최근
      },
      {
        name: "Eco Slip-on Recycled",
        shortDescription: "재활용 소재를 활용한 친환경 슬립온",
        images: [`${baseImagePath}/slipon_eco1.jpg`, `${baseImagePath}/slipon_eco2.jpg`],
        categories: ["slipon"],
        basePrice: 68000,
        discountRate: 5,
        availableSizes: [240, 245, 250],
        materials: ["Recycled", "Canvas"],
        createdAt: daysAgo(5), // 최근 → 신제품 분류 용
      },
      {
        name: "Sporty Slip-on",
        shortDescription: "스포티한 디자인의 슬립온",
        images: [`${baseImagePath}/slipon_sport1.jpg`, `${baseImagePath}/slipon_sport2.jpg`],
        categories: ["slipon"],
        basePrice: 70000,
        discountRate: 0,
        availableSizes: [255, 260, 265, 270],
        materials: ["Mesh"],
        createdAt: daysAgo(25),
      },
      {
        name: "Minimal Slip-on",
        shortDescription: "심플한 디자인의 미니멀 슬립온",
        images: [`${baseImagePath}/slipon_minimal1.jpg`, `${baseImagePath}/slipon_minimal2.jpg`],
        categories: ["slipon"],
        basePrice: 65000,
        discountRate: 12,
        availableSizes: [245, 250, 255],
        materials: ["Canvas"],
        createdAt: daysAgo(15),
      },
      {
        name: "Outdoor Grip Slip-on",
        shortDescription: "접지력이 좋은 아웃도어용 슬립온",
        images: [`${baseImagePath}/slipon_outdoor1.jpg`, `${baseImagePath}/slipon_outdoor2.jpg`],
        categories: ["slipon"],
        basePrice: 89000,
        discountRate: 18,
        availableSizes: [250, 260, 270],
        materials: ["Rubber", "Mesh"],
        createdAt: daysAgo(35),
      },
      {
        name: "Office Casual Slip-on",
        shortDescription: "오피스룩에도 어울리는 캐주얼 슬립온",
        images: [`${baseImagePath}/slipon_office1.jpg`, `${baseImagePath}/slipon_office2.jpg`],
        categories: ["slipon"],
        basePrice: 78000,
        discountRate: 8,
        availableSizes: [240, 245, 250, 255],
        materials: ["Leather", "Canvas"],
        createdAt: daysAgo(12),
      },
      {
        name: "Travel Easy Slip-on",
        shortDescription: "여행용으로 편한 경량 슬립온",
        images: [`${baseImagePath}/slipon_travel1.jpg`, `${baseImagePath}/slipon_travel2.jpg`],
        categories: ["slipon"],
        basePrice: 71000,
        discountRate: 0,
        availableSizes: [235, 240, 245, 250],
        materials: ["Mesh", "Foam"],
        createdAt: daysAgo(3), // 완전 최근 → 신제품 느낌
      },
    ];

    // 라이프스타일 10개 이상
    const lifestyleProducts = [
      {
        name: "Lifestyle Daily Sneaker",
        shortDescription: "데일리로 신기 좋은 기본 스니커즈",
        images: [`${baseImagePath}/life_daily1.jpg`, `${baseImagePath}/life_daily2.jpg`],
        categories: ["lifestyle"],
        basePrice: 82000,
        discountRate: 0,
        availableSizes: [250, 260, 270],
        materials: ["Canvas"],
        createdAt: daysAgo(50),
      },
      {
        name: "Lifestyle Chunky Sneaker",
        shortDescription: "트렌디한 청키 스니커즈",
        images: [`${baseImagePath}/life_chunky1.jpg`, `${baseImagePath}/life_chunky2.jpg`],
        categories: ["lifestyle"],
        basePrice: 95000,
        discountRate: 10,
        availableSizes: [240, 245, 250, 255, 260],
        materials: ["Leather", "Rubber"],
        createdAt: daysAgo(30),
      },
      {
        name: "Lifestyle Running Shoe",
        shortDescription: "가벼운 조깅용 러닝화",
        images: [`${baseImagePath}/life_run1.jpg`, `${baseImagePath}/life_run2.jpg`],
        categories: ["lifestyle"],
        basePrice: 91000,
        discountRate: 5,
        availableSizes: [250, 255, 260, 265],
        materials: ["Mesh"],
        createdAt: daysAgo(20),
      },
      {
        name: "Lifestyle Retro Sneaker",
        shortDescription: "복고풍 디자인의 레트로 스니커즈",
        images: [`${baseImagePath}/life_retro1.jpg`, `${baseImagePath}/life_retro2.jpg`],
        categories: ["lifestyle"],
        basePrice: 88000,
        discountRate: 15,
        availableSizes: [235, 240, 245, 250],
        materials: ["Suede"],
        createdAt: daysAgo(15),
      },
      {
        name: "Lifestyle Canvas Low",
        shortDescription: "클래식 로우컷 캔버스 스니커즈",
        images: [`${baseImagePath}/life_canvas1.jpg`, `${baseImagePath}/life_canvas2.jpg`],
        categories: ["lifestyle"],
        basePrice: 63000,
        discountRate: 0,
        availableSizes: [230, 235, 240, 245, 250],
        materials: ["Canvas"],
        createdAt: daysAgo(5),
      },
      {
        name: "Lifestyle High-top Sneaker",
        shortDescription: "발목까지 감싸주는 하이탑 스니커즈",
        images: [`${baseImagePath}/life_hightop1.jpg`, `${baseImagePath}/life_hightop2.jpg`],
        categories: ["lifestyle"],
        basePrice: 99000,
        discountRate: 12,
        availableSizes: [250, 255, 260],
        materials: ["Leather", "Canvas"],
        createdAt: daysAgo(25),
      },
      {
        name: "Lifestyle Slip-on Hybrid",
        shortDescription: "슬립온과 스니커즈의 하이브리드",
        images: [`${baseImagePath}/life_hybrid1.jpg`, `${baseImagePath}/life_hybrid2.jpg`],
        categories: ["lifestyle", "slipon"], // 둘 다 걸치게
        basePrice: 87000,
        discountRate: 7,
        availableSizes: [240, 245, 250, 255],
        materials: ["Mesh", "Foam"],
        createdAt: daysAgo(8),
      },
      {
        name: "Lifestyle Outdoor Walker",
        shortDescription: "야외 활동용 워킹 슈즈",
        images: [`${baseImagePath}/life_outdoor1.jpg`, `${baseImagePath}/life_outdoor2.jpg`],
        categories: ["lifestyle"],
        basePrice: 93000,
        discountRate: 18,
        availableSizes: [255, 260, 265, 270],
        materials: ["Rubber", "Mesh"],
        createdAt: daysAgo(35),
      },
      {
        name: "Lifestyle Office Minimal",
        shortDescription: "오피스룩에 어울리는 미니멀 스니커즈",
        images: [`${baseImagePath}/life_office1.jpg`, `${baseImagePath}/life_office2.jpg`],
        categories: ["lifestyle"],
        basePrice: 90000,
        discountRate: 0,
        availableSizes: [240, 245, 250],
        materials: ["Leather"],
        createdAt: daysAgo(2),
      },
      {
        name: "Lifestyle Travel Walker",
        shortDescription: "여행용으로 적합한 편안한 워킹 슈즈",
        images: [`${baseImagePath}/life_travel1.jpg`, `${baseImagePath}/life_travel2.jpg`],
        categories: ["lifestyle"],
        basePrice: 88000,
        discountRate: 6,
        availableSizes: [235, 240, 245, 250, 255],
        materials: ["Mesh", "Canvas"],
        createdAt: daysAgo(12),
      },
    ];

    const products = await Product.insertMany([
      ...sliponProducts,
      ...lifestyleProducts,
    ]);

    console.log(`🥿 Products inserted: ${products.length}`);

    // 4) 판매 수량 / 매출용 주문 데이터 생성
    //    - 관리자 페이지에서 집계할 수 있도록 미리 몇 개의 주문 생성

    // 편의를 위해 제품 몇 개 골라 map
    const p = {};
    for (const prod of products) {
      p[prod.name] = prod;
    }

    const ordersData = [
      {
        user: user1,
        items: [
          { prod: p["Tree Slip-on Basic"], size: 250, qty: 2 },
          { prod: p["Lifestyle Daily Sneaker"], size: 260, qty: 1 },
        ],
        daysAgo: 5,
      },
      {
        user: user1,
        items: [
          { prod: p["Premium Leather Slip-on"], size: 260, qty: 1 },
          { prod: p["Lifestyle Chunky Sneaker"], size: 245, qty: 1 },
        ],
        daysAgo: 15,
      },
      {
        user: user2,
        items: [
          { prod: p["Wool Slip-on Warm"], size: 235, qty: 3 },
          { prod: p["Lifestyle Retro Sneaker"], size: 240, qty: 1 },
        ],
        daysAgo: 25,
      },
      {
        user: user2,
        items: [
          { prod: p["Eco Slip-on Recycled"], size: 245, qty: 1 },
          { prod: p["Lifestyle Travel Walker"], size: 245, qty: 2 },
        ],
        daysAgo: 2,
      },
    ];

    for (const orderInfo of ordersData) {
      const { user, items, daysAgo: d } = orderInfo;
      const paidAt = daysAgo(d);

      const orderItems = items.map(({ prod, size, qty }) => {
        const finalPrice = Math.round(
          prod.basePrice * (1 - (prod.discountRate || 0) / 100)
        );
        return {
          productId: prod._id,
          nameSnapshot: prod.name,
          priceSnapshot: finalPrice,
          size,
          quantity: qty,
        };
      });

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.priceSnapshot * item.quantity,
        0
      );

      await Order.create({
        userId: user._id,
        items: orderItems,
        totalAmount,
        paidAt,
      });
    }

    console.log("📦 Sample orders created for sales stats");

    console.log("✅ Seeding completed!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

seed();
