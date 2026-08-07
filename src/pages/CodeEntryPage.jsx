import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as classCodeApi from "../api/classCodeApi";

export default function CodeEntryPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return;
    setError("");
    setLoading(true);
    try {
      await classCodeApi.validateCode(code);
      navigate(`/board/${encodeURIComponent(code)}`);
    } catch (err) {
      setError(err.response?.data?.msg || "존재하지 않는 코드입니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h1>오늘뭐</h1>
      <p className="form-intro">
        오늘의 점심 메뉴를 투표로 정하는 서비스예요. 관리자에게 받은 코드를 입력해주세요.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="코드 입력 (예: kh501)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={!code || loading}>
          {loading ? "확인 중..." : "입장"}
        </button>
      </form>
      <p className="form-footer">
        관리자이신가요? <Link to="/admin/login">관리자 로그인</Link>
      </p>
    </div>
  );
}
