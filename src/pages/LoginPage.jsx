import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ userId: "", userPwd: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      login(data.data);
      navigate("/admin/menus");
    } catch (err) {
      setError(err.response?.data?.msg || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h1>관리자 로그인</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="userId"
          placeholder="아이디"
          value={form.userId}
          onChange={handleChange}
          required
        />
        <input
          name="userPwd"
          type="password"
          placeholder="비밀번호"
          value={form.userPwd}
          onChange={handleChange}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="form-footer">
        계정이 없으신가요? <Link to="/admin/signup">회원가입</Link>
      </p>
      <p className="form-footer">
        <Link to="/">코드로 입장하기</Link>
      </p>
    </div>
  );
}
