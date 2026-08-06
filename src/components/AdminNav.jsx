import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminNav({ title }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p className="sub">{user?.userName} (관리자)</p>
      </div>
      <div className="admin-nav">
        <Link
          to="/admin/menus"
          className={`nav-pill${pathname === "/admin/menus" ? " active" : ""}`}
        >
          메뉴 관리
        </Link>
        <Link
          to="/admin/codes"
          className={`nav-pill${pathname === "/admin/codes" ? " active" : ""}`}
        >
          코드 관리
        </Link>
        <button type="button" className="nav-logout" onClick={logout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
