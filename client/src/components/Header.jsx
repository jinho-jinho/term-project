import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const SiteHeader = styled.header`
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

const LogoButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  border: none;
  background: none;
  padding: 0;
`;

const LogoCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #111111, #434343);
`;

const BrandText = styled.span`
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const HeaderNav = styled.nav`
  display: flex;
  justify-content: center;
  gap: 18px;
`;

const NavAnchor = styled(Link)`
  border: none;
  background: none;
  font-size: 15px;
  color: #333333;
  cursor: pointer;
  padding: 8px 10px;
  text-decoration: none;

  &:hover {
    color: #000000;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 860px) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const GhostButton = styled.button`
  border-radius: 8px;
  border: 1px solid #d6d6d6;
  background: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #000;
  }
`;

const SolidButton = styled.button`
  border-radius: 8px;
  border: 1px solid #111111;
  background: #111111;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  color: #ffffff;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

function Header() {
  const navigate = useNavigate();

  return (
    <SiteHeader>
      <HeaderInner>
        <LogoButton onClick={() => navigate("/")}>
          <LogoCircle />
          <BrandText>BRAND</BrandText>
        </LogoButton>

        <HeaderNav>
          <NavAnchor to="/">메뉴</NavAnchor>
          <NavAnchor to="/">메뉴</NavAnchor>
          <NavAnchor to="/">메뉴</NavAnchor>
        </HeaderNav>

        <HeaderActions>
          <GhostButton onClick={() => navigate("/")}>버튼</GhostButton>
          <GhostButton onClick={() => navigate("/")}>버튼</GhostButton>
          <SolidButton onClick={() => navigate("/login")}>로그인</SolidButton>
        </HeaderActions>
      </HeaderInner>
    </SiteHeader>
  );
}

export default Header;
