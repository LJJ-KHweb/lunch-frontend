import { useEffect, useState } from "react";
import * as menuApi from "../api/menuApi";
import * as classCodeApi from "../api/classCodeApi";
import AdminNav from "../components/AdminNav";
import CodeDropdown from "../components/CodeDropdown";

const todayStr = () => new Date().toISOString().slice(0, 10);

const STATUS_LABEL = {
  PENDING_REVIEW: "검토중",
  OPEN: "투표 가능",
  CLOSED: "마감",
};

export default function AdminMenuPage() {
  const [date, setDate] = useState(todayStr());
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [codes, setCodes] = useState([]);

  const [createForm, setCreateForm] = useState({ menuName: "", className: "" });
  const [aiClassName, setAiClassName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ menuName: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await menuApi.getAdminMenus(date);
      setMenus(res.data.data);
    } catch (err) {
      setError(err.response?.data?.msg || "메뉴 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadCodes = async () => {
    try {
      const res = await classCodeApi.getAdminCodes();
      setCodes(res.data.data);
    } catch {
      // 코드 목록 조회는 실패해도 메뉴 관리 화면 자체는 계속 쓸 수 있어야 하므로 무시
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    loadCodes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await menuApi.createMenu({ ...createForm, voteDate: date });
      setCreateForm({ menuName: "", className: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "메뉴 등록에 실패했습니다.");
    }
  };

  const handleGenerateAi = async () => {
    if (!aiClassName) return;
    setAiLoading(true);
    setError("");
    try {
      await menuApi.generateAiMenu(aiClassName, date);
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "AI 메뉴 생성에 실패했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatus = async (menuId, status) => {
    setError("");
    try {
      await menuApi.updateMenuStatus(menuId, status);
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "상태 변경에 실패했습니다.");
    }
  };

  const startEdit = (menu) => {
    setEditingId(menu.menuId);
    setEditForm({ menuName: menu.menuName });
  };

  const submitEdit = async (menuId) => {
    setError("");
    try {
      await menuApi.updateMenu(menuId, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "메뉴 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm("이 메뉴를 삭제할까요?")) return;
    setError("");
    try {
      await menuApi.deleteMenu(menuId);
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "메뉴 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="page">
      <AdminNav title="메뉴 관리" />

      <div className="date-picker">
        <span>날짜</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-panel">
        <h2>AI 메뉴 생성</h2>
        <div className="ai-generate-row">
          <CodeDropdown codes={codes} value={aiClassName} onChange={setAiClassName} />
          <button
            type="button"
            className="primary-button"
            disabled={!aiClassName || aiLoading}
            onClick={handleGenerateAi}
          >
            {aiLoading ? "생성 중..." : "AI로 생성"}
          </button>
        </div>
      </div>

      <div className="admin-panel">
        <h2>수동 메뉴 등록</h2>
        <form className="manual-register-row" onSubmit={handleCreate}>
          <input
            placeholder="메뉴명"
            value={createForm.menuName}
            onChange={(e) => setCreateForm({ ...createForm, menuName: e.target.value })}
            required
          />
          <CodeDropdown
            codes={codes}
            value={createForm.className}
            onChange={(code) => setCreateForm({ ...createForm, className: code })}
          />
          <button type="submit" disabled={!createForm.menuName || !createForm.className}>
            등록
          </button>
        </form>
      </div>

      {loading && <p>불러오는 중...</p>}

      {!loading && menus.length === 0 && <p className="empty">{date}에 등록된 메뉴가 없습니다.</p>}

      <ul className="menu-list">
        {menus.map((menu) => (
          <li key={menu.menuId} className="menu-card admin-card">
            {editingId === menu.menuId ? (
              <div className="inline-form">
                <input
                  value={editForm.menuName}
                  onChange={(e) => setEditForm({ ...editForm, menuName: e.target.value })}
                />
                <button type="button" onClick={() => submitEdit(menu.menuId)}>
                  저장
                </button>
                <button type="button" className="link-button" onClick={() => setEditingId(null)}>
                  취소
                </button>
              </div>
            ) : (
              <>
                {menu.imageUrl && (
                  <img className="menu-thumb" src={menu.imageUrl} alt={menu.menuName} />
                )}
                <div>
                  <div className="menu-name">{menu.menuName}</div>
                  <div className="menu-sub">
                    {menu.className} · {menu.sourceType}
                  </div>
                </div>
                <span className={`badge status-${menu.status}`}>
                  {STATUS_LABEL[menu.status] || menu.status}
                </span>
                <div className="admin-actions">
                  {menu.status === "PENDING_REVIEW" && (
                    <button type="button" onClick={() => handleStatus(menu.menuId, "OPEN")}>
                      오픈
                    </button>
                  )}
                  {menu.status !== "CLOSED" && (
                    <button type="button" onClick={() => handleStatus(menu.menuId, "CLOSED")}>
                      마감
                    </button>
                  )}
                  {menu.status !== "CLOSED" && (
                    <button type="button" onClick={() => startEdit(menu)}>
                      수정
                    </button>
                  )}
                  <button type="button" className="danger" onClick={() => handleDelete(menu.menuId)}>
                    삭제
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
