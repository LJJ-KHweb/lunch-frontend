import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: "",
    userPwd: "",
    userName: "",
    email: "",
  });
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
      await authApi.signup(form);
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/admin/login");
    } catch (err) {
      setError(err.response?.data?.msg || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h1>관리자 회원가입</h1>
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
        <input
          name="userName"
          placeholder="이름"
          value={form.userName}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </form>
      <p className="form-footer">
        이미 계정이 있으신가요? <Link to="/admin/login">로그인</Link>
      </p>
      <p className="form-footer">
        <Link to="/">코드로 입장하기</Link>
      </p>
    </div>
  );
}
