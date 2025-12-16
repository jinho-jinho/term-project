import { useMemo, useState } from "react";
import styled from "styled-components";
import AdminProductsPage from "./AdminProductsPage";
import { useNavigate } from "react-router-dom";

const Wrap = styled.main`
  padding: 28px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TabBtn = styled.button`
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$on ? "#111" : "#ddd")};
  background: ${(p) => (p.$on ? "#111" : "#fff")};
  color: ${(p) => (p.$on ? "#fff" : "#111")};
  cursor: pointer;
  font-weight: 650;
  font-size: 13px;
`;

const Card = styled.section`
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 8px;
  padding: 16px;
`;

const BottomBar = styled.div`
  margin-top: 32px;
  text-align: right;
`;

const LogoutButton = styled.button`
  font-size: 12px;
  color: #777;
  background: transparent;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  padding: 4px 6px;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export default function AdminDashboard() {
  const tabs = useMemo(
    () => [
      { key: "products", label: "상품관리(등록/사이즈)" },
      { key: "discount", label: "할인정책 변경" },
      { key: "sales", label: "판매현황" },
    ],
    []
  );

  const [tab, setTab] = useState("products");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "로그아웃에 실패했습니다.");
      }
      navigate("/login");
    } catch (err) {
      console.error("Admin logout failed:", err);
      alert(err.message || "로그아웃에 실패했습니다.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Wrap>
      <TitleRow>
        <Title>관리자 통합 페이지</Title>
        <Tabs>
          {tabs.map((t) => (
            <TabBtn
              key={t.key}
              $on={tab === t.key}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </TabBtn>
          ))}
        </Tabs>
      </TitleRow>

      {tab === "products" && <AdminProductsPage />}

      {tab === "discount" && (
        <Card>
          <div style={{ fontWeight: 650, marginBottom: 8 }}>할인정책 변경</div>
          <div style={{ color: "#666", fontSize: 13 }}>
            여기에 “상품별 discountRate 변경 UI”를 붙이면 됨. (서버: PATCH
            /api/admin/products/:id/discount)
          </div>
        </Card>
      )}

      {tab === "sales" && (
        <Card>
          <div style={{ fontWeight: 650, marginBottom: 8 }}>판매현황</div>
          <div style={{ color: "#666", fontSize: 13 }}>
            여기에 “기간(start/end) 필터 + 매출/판매량 테이블” 붙이면 됨. (서버:
            GET /api/admin/sales?start=...&end=...)
          </div>
        </Card>
      )}
      <BottomBar>
        <LogoutButton type="button" onClick={handleLogout} disabled={logoutLoading}>
          {logoutLoading ? "Logging out..." : "Logout"}
        </LogoutButton>
      </BottomBar>

    </Wrap>
  );
}
