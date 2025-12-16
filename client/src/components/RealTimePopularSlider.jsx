import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";

const Wrap = styled.section`
  background: #f6f5f3;
  padding: 48px 0 36px;
`;

const Inner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 28px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -1px;
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 18px;
  font-size: 14px;
  opacity: 0.75;
  user-select: none;
`;

const Cat = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  color: #111;
  opacity: ${(p) => (p.$active ? 1 : 0.75)};
  text-decoration: ${(p) => (p.$active ? "underline" : "none")};
`;

const SliderBox = styled.div`
  position: relative;
  overflow: visible;
`;

const Viewport = styled.div`
  width: calc(248px * 5 + 20px * 4); /* 1320px */
  margin: 0 auto; /* 가운데 정렬 */
  overflow: hidden; /* 6번째 가리기 */
`;

const Track = styled.div`
  display: flex;
  gap: 20px;
  transform: translateX(${(p) => `${p.$x}px`});
  transition: transform 360ms ease;
  will-change: transform;
`;

const Card = styled.div`
  width: 248px;
  flex: 0 0 248px;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
`;

const Img = styled.div`
  height: 210px;
  background: #eeeeee;
  position: relative;
  display: grid;
  place-items: center;

  img {
    width: 88%;
    height: auto;
    display: block;
  }
`;

const NumBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background: #111;
  color: #fff;
  font-size: 12px;
  display: grid;
  place-items: center;
`;

const Body = styled.div`
  padding: 14px 14px 16px;
  background: #fff;
`;

const Name = styled.div`
  font-size: 12px;
  font-weight: 650;
  letter-spacing: -0.2px;
  line-height: 1.45;
`;

const SubName = styled.div`
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.72;
  line-height: 1.45;
`;

const PriceRow = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const Price = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

const Old = styled.div`
  font-size: 12px;
  opacity: 0.45;
  text-decoration: line-through;
`;

const SizeLabel = styled.div`
  margin-top: 10px;
  font-size: 11px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Check = styled.span`
  font-size: 11px;
  opacity: 0.8;
`;

const SizeRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Size = styled.div`
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 2px;
  background: #f6f5f3;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
`;

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  z-index: 1;

  opacity: ${(p) => (p.$disabled ? 0.35 : 1)};
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
`;

const Left = styled(Arrow)`
  left: -18px;
`;

const Right = styled(Arrow)`
  right: -18px;
`;

function Chevron({ dir = "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      {dir === "left" ? (
        <path
          d="M14.5 5.5L8.5 12l6 6.5"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 5.5L15.5 12l-6 6.5"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

const formatKRW = (n) =>
  new Intl.NumberFormat("ko-KR").format(
    Math.max(0, Math.round(Number(n) || 0))
  );

const normCat = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "-");

function pickCategoryKey(categories = []) {
  const cats = (Array.isArray(categories) ? categories : [categories]).map(
    normCat
  );

  // lifestyle
  if (cats.some((c) => c.includes("lifestyle") || c === "life")) return "life";

  // slip-on / slipon / slip
  if (
    cats.some(
      (c) => c.includes("slip-on") || c.includes("slipon") || c === "slip"
    )
  )
    return "slip";

  return "life"; // 디폴트(원하면 변경 가능)
}

function mapProductToCard(p) {
  const base = Number(p?.basePrice ?? 0);
  const rate = Number(p?.discountRate ?? 0);
  const discounted = rate > 0 ? Math.round(base * (1 - rate / 100)) : base;

  const cats = Array.isArray(p?.categories) ? p.categories : [];
  const catText = cats.length ? cats.join(", ") : "";

  return {
    id: String(p?._id ?? p?.id ?? Math.random()),
    img: p?.images?.[0] || "", // DB의 첫 번째 이미지 사용
    name: p?.name || "",
    sub: p?.shortDescription
      ? catText
        ? `${catText}, ${p.shortDescription}`
        : p.shortDescription
      : catText,
    price: `₩${formatKRW(discounted)}`,
    old: `₩${formatKRW(base)}`,
    sizes: (p?.availableSizes || []).map((s) => String(s)),
  };
}

// “한 번만” 랜덤 셔플 (새로고침 전까진 고정)
function shuffleOnce(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RealTimePopularSlider() {
  const [category, setCategory] = useState("life");
  const [start, setStart] = useState(0);

  // DB에서 받은 데이터를 카테고리별로 저장
  const [lifeItems, setLifeItems] = useState([]);
  const [slipItems, setSlipItems] = useState([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/products", { credentials: "include" });
        if (!res.ok) throw new Error(`products fetch failed: ${res.status}`);

        const products = await res.json();
        const mapped = (Array.isArray(products) ? products : []).map(
          mapProductToCard
        );

        const life = [];
        const slip = [];

        for (const raw of Array.isArray(products) ? products : []) {
          const key = pickCategoryKey(raw?.categories);
          const card = mapProductToCard(raw);
          if (key === "slip") slip.push(card);
          else life.push(card);
        }

        if (!alive) return;

        // 랜덤 고정 (한 번 섞고 state에 넣어서 유지)
        setLifeItems(shuffleOnce(life));
        setSlipItems(shuffleOnce(slip));
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setLifeItems([]);
        setSlipItems([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    return category === "life" ? lifeItems : slipItems;
  }, [category, lifeItems, slipItems]);

  const VISIBLE = 5;
  const GAP = 20;
  const CARD_W = 248;

  const maxStart = Math.max(0, items.length - VISIBLE);
  const canPrev = start > 0;
  const canNext = start < maxStart;

  const x = -(start * (CARD_W + GAP));

  const slideByOne = (dir) => {
    setStart((s) => {
      const next = s + (dir === "next" ? 1 : -1);
      return Math.min(maxStart, Math.max(0, next));
    });
  };

  const onImgError = (e) => {
    e.currentTarget.src = "/products/placeholder.jpg";
  };

  return (
    <Wrap>
      <Inner>
        <TitleRow>
          <Title>실시간 인기</Title>
          <CategoryRow>
            <Cat
              type="button"
              $active={category === "life"}
              onClick={() => {
                setCategory("life");
                setStart(0);
              }}
            >
              라이프 스타일
            </Cat>

            <Cat
              type="button"
              $active={category === "slip"}
              onClick={() => {
                setCategory("slip");
                setStart(0);
              }}
            >
              슬립온
            </Cat>
          </CategoryRow>
        </TitleRow>

        <SliderBox>
          <Left
            type="button"
            $disabled={!canPrev}
            onClick={() => {
              if (!canPrev) return;
              slideByOne("prev");
            }}
          >
            <Chevron dir="left" />
          </Left>

          <Right
            type="button"
            $disabled={!canNext}
            onClick={() => {
              if (!canNext) return;
              slideByOne("next");
            }}
          >
            <Chevron dir="right" />
          </Right>

          <Viewport>
            <Track $x={x}>
              {items.map((p, idx) => {
                const rank = idx + 1;
                const showNum = idx >= start && idx < start + VISIBLE;

                return (
                  <Card key={p.id}>
                    <Img>
                      {showNum && <NumBadge>{rank}</NumBadge>}
                      <img
                        src={p.img || "/products/placeholder.jpg"}
                        alt={p.name}
                        onError={onImgError}
                      />
                    </Img>

                    <Body>
                      <Name>{p.name}</Name>
                      <SubName>{p.sub}</SubName>

                      <PriceRow>
                        <Price>{p.price}</Price>
                        <Old>{p.old}</Old>
                      </PriceRow>

                      <SizeLabel>
                        <Check>✓</Check> 주문 가능 사이즈
                      </SizeLabel>

                      <SizeRow>
                        {p.sizes.map((s) => (
                          <Size key={`${p.id}-${s}`}>{s}</Size>
                        ))}
                      </SizeRow>
                    </Body>
                  </Card>
                );
              })}
            </Track>
          </Viewport>
        </SliderBox>
      </Inner>
    </Wrap>
  );
}
// import { useMemo, useState } from "react";
// import styled from "styled-components";

// /**
//  * ✅ 요구사항
//  * - 카드 5개 고정 노출 (6번째 절대 안 보임)
//  * - 한 칸씩 슬라이드: 1..5 → 2..6 → 3..7 ...
//  * - 뱃지 숫자도 그대로 1..5 → 2..6 → 3..7 ...
//  * - 더 이상 이동 불가 시 화살표 비활성화(보이되 클릭 불가)
//  * - trending1 ~ trending10 이미지 사용
//  */

// const Wrap = styled.section`
//   background: #f6f5f3;
//   padding: 48px 0 36px;
// `;

// const Inner = styled.div`
//   max-width: 1400px;
//   margin: 0 auto;
//   padding: 0 28px;
// `;

// const TitleRow = styled.div`
//   display: flex;
//   align-items: flex-end;
//   justify-content: space-between;
//   margin-bottom: 18px;
// `;

// const Title = styled.h2`
//   margin: 0;
//   font-size: 34px;
//   font-weight: 600;
//   letter-spacing: -1px;
// `;

// const CategoryRow = styled.div`
//   display: flex;
//   gap: 18px;
//   font-size: 14px;
//   opacity: 0.75;
//   user-select: none;
// `;

// const Cat = styled.button`
//   border: 0;
//   background: transparent;
//   padding: 0;
//   font-size: 14px;
//   cursor: pointer;
//   color: #111;
//   opacity: ${(p) => (p.$active ? 1 : 0.75)};
//   text-decoration: ${(p) => (p.$active ? "underline" : "none")};
// `;

// const SliderBox = styled.div`
//   position: relative;
//   overflow: visible;
// `;

// const Viewport = styled.div`
//   width: calc(248px * 5 + 20px * 4); /* 1320px */
//   margin: 0 auto; /* 가운데 정렬 */
//   overflow: hidden; /* 6번째 가리기 */
// `;

// const Track = styled.div`
//   display: flex;
//   gap: 20px;
//   transform: translateX(${(p) => `${p.$x}px`});
//   transition: transform 360ms ease;
//   will-change: transform;
// `;

// const Card = styled.div`
//   width: 248px;
//   flex: 0 0 248px;
//   background: #fff;
//   box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
//   box-sizing: border-box;
// `;

// const Img = styled.div`
//   height: 210px;
//   background: #eeeeee;
//   position: relative;
//   display: grid;
//   place-items: center;

//   img {
//     width: 88%;
//     height: auto;
//     display: block;
//   }
// `;

// const NumBadge = styled.div`
//   position: absolute;
//   top: 10px;
//   left: 10px;
//   width: 28px;
//   height: 28px;
//   border-radius: 2px;
//   background: #111;
//   color: #fff;
//   font-size: 12px;
//   display: grid;
//   place-items: center;
// `;

// const Body = styled.div`
//   padding: 14px 14px 16px;
//   background: #f7f7f7;
// `;

// const Name = styled.div`
//   font-size: 12px;
//   font-weight: 650;
//   letter-spacing: -0.2px;
//   line-height: 1.45;
// `;

// const SubName = styled.div`
//   margin-top: 4px;
//   font-size: 11px;
//   opacity: 0.72;
//   line-height: 1.45;
// `;

// const PriceRow = styled.div`
//   margin-top: 10px;
//   display: flex;
//   align-items: baseline;
//   gap: 8px;
// `;

// const Price = styled.div`
//   font-size: 13px;
//   font-weight: 700;
// `;

// const Old = styled.div`
//   font-size: 12px;
//   opacity: 0.45;
//   text-decoration: line-through;
// `;

// const SizeLabel = styled.div`
//   margin-top: 10px;
//   font-size: 11px;
//   opacity: 0.7;
//   display: flex;
//   align-items: center;
//   gap: 6px;
// `;

// const Check = styled.span`
//   font-size: 11px;
//   opacity: 0.8;
// `;

// const SizeRow = styled.div`
//   margin-top: 10px;
//   display: flex;
//   gap: 10px;
//   flex-wrap: wrap;
// `;

// const Size = styled.div`
//   font-size: 11px;
//   padding: 6px 8px;
//   border-radius: 2px;
//   background: #fff;
//   box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
// `;

// const Arrow = styled.button`
//   position: absolute;
//   top: 50%;
//   transform: translateY(-50%);
//   width: 36px;
//   height: 36px;
//   border-radius: 999px;
//   border: 1px solid rgba(0, 0, 0, 0.18);
//   background: #fff;
//   display: grid;
//   place-items: center;
//   box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
//   z-index: 1;

//   opacity: ${(p) => (p.$disabled ? 0.35 : 1)};
//   cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
// `;

// const Left = styled(Arrow)`
//   left: -18px;
// `;

// const Right = styled(Arrow)`
//   right: -18px;
// `;

// function Chevron({ dir = "right" }) {
//   return (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
//       {dir === "left" ? (
//         <path
//           d="M14.5 5.5L8.5 12l6 6.5"
//           stroke="#111"
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       ) : (
//         <path
//           d="M9.5 5.5L15.5 12l-6 6.5"
//           stroke="#111"
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       )}
//     </svg>
//   );
// }

// export default function RealTimePopularSlider() {
//   const [category, setCategory] = useState("life");
//   const [start, setStart] = useState(0);

//   const lifeItems = useMemo(
//     () => [
//       {
//         id: 1,
//         imgBase: "trending1",
//         name: "여성 울 크루저",
//         sub: "라이프스타일, 캐주얼",
//         price: "₩98,000",
//         old: "₩200,000",
//         sizes: ["240", "245"],
//       },
//       {
//         id: 2,
//         imgBase: "trending2",
//         name: "여성 울 러너 NZ",
//         sub: "캐주얼, 비즈니스, 클래식 스니커즈",
//         price: "₩98,000",
//         old: "₩200,000",
//         sizes: ["260", "265", "270"],
//       },
//       {
//         id: 3,
//         imgBase: "trending3",
//         name: "여성 트리 러너",
//         sub: "캐주얼, 비즈니스",
//         price: "₩78,000",
//         old: "₩180,000",
//         sizes: ["235", "240", "245"],
//       },
//       {
//         id: 4,
//         imgBase: "trending4",
//         name: "여성 울 크루저 워터프루프",
//         sub: "서브 4",
//         price: "₩78,000",
//         old: "₩150,000",
//         sizes: ["260", "270", "280"],
//       },
//       {
//         id: 5,
//         imgBase: "trending5",
//         name: "남성 울 크루저",
//         sub: "캐주얼, 가벼운 산책, 클래식 스니커즈",
//         price: "₩119,000",
//         old: "₩170,000",
//         sizes: ["260", "265", "270"],
//       },
//       {
//         id: 6,
//         imgBase: "trending6",
//         name: "남성 트리 러너",
//         sub: "캐주얼, 비즈니스, 클래식 스니커즈",
//         price: "₩89,000",
//         old: "₩160,000",
//         sizes: ["230", "235", "240"],
//       },
//       {
//         id: 7,
//         imgBase: "trending7",
//         name: "울버즈 슬리퍼 플러프",
//         sub: "남여공용, 라운지웨어",
//         price: "₩109,000",
//         old: "₩190,000",
//         sizes: ["255", "260", "265"],
//       },
//       {
//         id: 8,
//         imgBase: "trending8",
//         name: "남성 울 대셔 미즐",
//         sub: "러닝, 발수, 애슬레저",
//         price: "₩69,000",
//         old: "₩140,000",
//         sizes: ["270", "275", "280"],
//       },
//       {
//         id: 9,
//         imgBase: "trending9",
//         name: "남성 트리 글라이더",
//         sub: "러닝, 라이프스타일",
//         price: "₩129,000",
//         old: "₩210,000",
//         sizes: ["240", "245", "250"],
//       },
//       {
//         id: 10,
//         imgBase: "trending10",
//         name: "남성 스트라이더",
//         sub: "러닝, 라이프스타일, 애슬레저",
//         price: "₩99,000",
//         old: "₩180,000",
//         sizes: ["265", "270", "275"],
//       },
//     ],
//     []
//   );

//   const slipItems = useMemo(
//     () => [
//       {
//         id: 1,
//         imgBase: "trending11",
//         name: "남성 울 크루저 슬립온",
//         sub: "슬립온, 캐주얼",
//         price: "₩98,000",
//         old: "₩200,000",
//         sizes: ["240", "245"],
//       },
//       {
//         id: 2,
//         imgBase: "trending12",
//         name: "남성 크루저 슬립온 코듀로이",
//         sub: "슬립온, 캐주얼",
//         price: "₩98,000",
//         old: "₩200,000",
//         sizes: ["260", "265", "270"],
//       },
//       {
//         id: 3,
//         imgBase: "trending13",
//         name: "남성 트리 라운저 슬립온",
//         sub: "슬립온, 캐주얼",
//         price: "₩78,000",
//         old: "₩180,000",
//         sizes: ["235", "240", "245"],
//       },
//       {
//         id: 4,
//         imgBase: "trending14",
//         name: "남성 울 라운저 플러프",
//         sub: "슬립온, 라이프스타일, 캐주얼",
//         price: "₩78,000",
//         old: "₩150,000",
//         sizes: ["260", "270", "280"],
//       },
//       {
//         id: 5,
//         imgBase: "trending15",
//         name: "여성 울 크루저 슬립온",
//         sub: "슬립온, 캐주얼",
//         price: "₩119,000",
//         old: "₩170,000",
//         sizes: ["260", "265", "270"],
//       },
//       {
//         id: 6,
//         imgBase: "trending16",
//         name: "여성 크루저 슬립온 코듀로이",
//         sub: "슬립온, 캐주얼",
//         price: "₩89,000",
//         old: "₩160,000",
//         sizes: ["230", "235", "240"],
//       },
//       // {
//       //   id: 7,
//       //   imgBase: "trending7",
//       //   name: "아이템 7",
//       //   sub: "서브 7",
//       //   price: "₩109,000",
//       //   old: "₩190,000",
//       //   sizes: ["255", "260", "265"],
//       // },
//       // {
//       //   id: 8,
//       //   imgBase: "trending8",
//       //   name: "아이템 8",
//       //   sub: "서브 8",
//       //   price: "₩69,000",
//       //   old: "₩140,000",
//       //   sizes: ["270", "275", "280"],
//       // },
//       // {
//       //   id: 9,
//       //   imgBase: "trending9",
//       //   name: "아이템 9",
//       //   sub: "서브 9",
//       //   price: "₩129,000",
//       //   old: "₩210,000",
//       //   sizes: ["240", "245", "250"],
//       // },
//       // {
//       //   id: 10,
//       //   imgBase: "trending10",
//       //   name: "아이템 10",
//       //   sub: "서브 10",
//       //   price: "₩99,000",
//       //   old: "₩180,000",
//       //   sizes: ["265", "270", "275"],
//       // },
//     ],
//     []
//   );

//   const items = useMemo(() => {
//     return category === "life" ? lifeItems : slipItems;
//   }, [category, lifeItems, slipItems]);

//   const VISIBLE = 5;
//   const GAP = 20;
//   const CARD_W = 248;

//   const maxStart = Math.max(0, items.length - VISIBLE);
//   const canPrev = start > 0;
//   const canNext = start < maxStart;

//   const x = -(start * (CARD_W + GAP));

//   const slideByOne = (dir) => {
//     setStart((s) => {
//       const next = s + (dir === "next" ? 1 : -1);
//       return Math.min(maxStart, Math.max(0, next));
//     });
//   };

//   const onImgError = (e) => {
//     e.currentTarget.src = "/products/placeholder.jpg";
//   };

//   return (
//     <Wrap>
//       <Inner>
//         <TitleRow>
//           <Title>실시간 인기</Title>
//           <CategoryRow>
//             <Cat
//               type="button"
//               $active={category === "life"}
//               onClick={() => {
//                 setCategory("life");
//                 setStart(0);
//               }}
//             >
//               라이프 스타일
//             </Cat>

//             <Cat
//               type="button"
//               $active={category === "slip"}
//               onClick={() => {
//                 setCategory("slip");
//                 setStart(0);
//               }}
//             >
//               슬립온
//             </Cat>
//           </CategoryRow>
//         </TitleRow>

//         <SliderBox>
//           <Left
//             type="button"
//             $disabled={!canPrev}
//             onClick={() => {
//               if (!canPrev) return;
//               slideByOne("prev");
//             }}
//           >
//             <Chevron dir="left" />
//           </Left>

//           <Right
//             type="button"
//             $disabled={!canNext}
//             onClick={() => {
//               if (!canNext) return;
//               slideByOne("next");
//             }}
//           >
//             <Chevron dir="right" />
//           </Right>

//           <Viewport>
//             <Track $x={x}>
//               {items.map((p, idx) => {
//                 const rank = idx + 1; // ✅ 1..10 고정 순위
//                 const showNum = idx >= start && idx < start + VISIBLE; // ✅ 보이는 5개만 뱃지

//                 return (
//                   <Card key={p.id}>
//                     <Img>
//                       {showNum && <NumBadge>{rank}</NumBadge>}
//                       <img
//                         src={`/assets/${p.imgBase}.jpg`}
//                         alt={p.name}
//                         onError={onImgError}
//                       />
//                     </Img>

//                     <Body>
//                       <Name>{p.name}</Name>
//                       <SubName>{p.sub}</SubName>

//                       <PriceRow>
//                         <Price>{p.price}</Price>
//                         <Old>{p.old}</Old>
//                       </PriceRow>

//                       <SizeLabel>
//                         <Check>✓</Check> 주문 가능 사이즈
//                       </SizeLabel>

//                       <SizeRow>
//                         {p.sizes.map((s) => (
//                           <Size key={`${p.id}-${s}`}>{s}</Size>
//                         ))}
//                       </SizeRow>
//                     </Body>
//                   </Card>
//                 );
//               })}
//             </Track>
//           </Viewport>
//         </SliderBox>
//       </Inner>
//     </Wrap>
//   );
// }
