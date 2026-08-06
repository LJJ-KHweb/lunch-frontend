import { useEffect, useState } from "react";
import * as classCodeApi from "../api/classCodeApi";
import AdminNav from "../components/AdminNav";

export default function AdminCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await classCodeApi.getAdminCodes();
      setCodes(res.data.data);
    } catch (err) {
      setError(err.response?.data?.msg || "코드 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCode) return;
    setCreating(true);
    setError("");
    try {
      await classCodeApi.createCode(newCode);
      setNewCode("");
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "코드 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 코드를 삭제할까요? 학생들이 더 이상 이 코드로 입장할 수 없습니다.")) return;
    setError("");
    try {
      await classCodeApi.deleteCode(id);
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "코드 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="page">
      <AdminNav title="코드 관리" />

      {error && <p className="form-error">{error}</p>}

      <div className="admin-panel">
        <h2>새 코드 발급</h2>
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="코드 (예: kh501)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
          <button type="submit" disabled={!newCode || creating}>
            {creating ? "생성 중..." : "발급"}
          </button>
        </form>
      </div>

      {loading && <p>불러오는 중...</p>}
      {!loading && codes.length === 0 && <p className="empty">발급된 코드가 없습니다.</p>}

      <ul className="menu-list">
        {codes.map((c) => (
          <li key={c.id} className="menu-card admin-card">
            <div>
              <div className="menu-name">{c.code}</div>
              <div className="menu-sub">{c.createdAt?.slice(0, 10)} 발급</div>
            </div>
            <div className="admin-actions">
              <button type="button" className="danger" onClick={() => handleDelete(c.id)}>
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
