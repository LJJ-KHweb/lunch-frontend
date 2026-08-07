import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as menuApi from "../api/menuApi";
import * as voteApi from "../api/voteApi";
import anyMenuIcon from "../assets/any-menu.png";
import noPreferenceIcon from "../assets/no-preference.png";

const STATUS_LABEL = {
  PENDING_REVIEW: "검토중",
  OPEN: "투표 가능",
  CLOSED: "마감",
};

export default function BoardPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [myVoteMenuIds, setMyVoteMenuIds] = useState([]);
  const [myAnyMenu, setMyAnyMenu] = useState(false);
  const [myNoPreference, setMyNoPreference] = useState(false);
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [selectedAnyMenu, setSelectedAnyMenu] = useState(false);
  const [selectedNoPreference, setSelectedNoPreference] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [reselecting, setReselecting] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const hasVoted = myVoteMenuIds.length > 0 || myAnyMenu || myNoPreference;
  const hasSelection = selectedMenuIds.length > 0 || selectedAnyMenu || selectedNoPreference;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [menuRes, resultRes] = await Promise.all([
        menuApi.getBoardMenus(code),
        voteApi.getResult(code).catch(() => null),
      ]);
      setMenus(menuRes.data.data);
      const result = resultRes?.data?.data;
      setMyVoteMenuIds(result?.myVoteMenuIds ?? []);
      setMyAnyMenu(result?.myAnyMenu ?? false);
      setMyNoPreference(result?.myNoPreference ?? false);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("존재하지 않는 코드입니다.");
      } else {
        setError("메뉴를 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const toggleMenu = (menuId) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
    setSelectedAnyMenu(false);
    setSelectedNoPreference(false);
  };

  const handleAnyMenuChange = (checked) => {
    setSelectedAnyMenu(checked);
    if (checked) {
      setSelectedMenuIds([]);
      setSelectedNoPreference(false);
    }
  };

  const handleNoPreferenceChange = (checked) => {
    setSelectedNoPreference(checked);
    if (checked) {
      setSelectedMenuIds([]);
      setSelectedAnyMenu(false);
    }
  };

  const handleVote = async () => {
    if (!hasSelection) return;
    setVoting(true);
    setError("");
    try {
      await voteApi.vote(code, {
        menuIds: selectedMenuIds,
        anyMenu: selectedAnyMenu,
        noPreference: selectedNoPreference,
      });
      setMyVoteMenuIds(selectedMenuIds);
      setMyAnyMenu(selectedAnyMenu);
      setMyNoPreference(selectedNoPreference);
      setReselecting(false);
    } catch (err) {
      setError(err.response?.data?.msg || "투표에 실패했습니다.");
    } finally {
      setVoting(false);
    }
  };

  const handleReselect = () => {
    setSelectedMenuIds(myVoteMenuIds);
    setSelectedAnyMenu(myAnyMenu);
    setSelectedNoPreference(myNoPreference);
    setReselecting(true);
    setError("");
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    const menuName = newMenuName.trim();
    if (!menuName) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await menuApi.submitMenu(code, menuName);
      setNewMenuName("");
      setSubmitSuccess("등록되었습니다. 관리자 검수 후 11시에 오픈됩니다.");
      await load();
    } catch (err) {
      setSubmitError(err.response?.data?.msg || "메뉴 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const locked = hasVoted && !reselecting;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>오늘뭐</h1>
          <p className="sub">{code}</p>
        </div>
        <button type="button" className="nav-pill" onClick={() => navigate("/")}>
          코드 다시 입력
        </button>
      </div>

      {loading && <p>불러오는 중...</p>}
      {!loading && error && <p className="form-error">{error}</p>}

      {!loading && !error && menus.length === 0 && (
        <p className="empty">오늘은 아직 등록된 메뉴가 없습니다.</p>
      )}

      {!loading && !error && menus.length > 0 && (
        <>
          {locked && (
            <p className="notice">
              이미 오늘 투표를 완료했습니다. 여러 메뉴를 함께 선택했다면 모두 표시됩니다.
            </p>
          )}

          <ul className="menu-list">
            {menus.map((menu) => {
              const isVoted = locked && myVoteMenuIds.includes(menu.menuId);
              const isSelectable = !locked && menu.status === "OPEN";
              return (
                <li
                  key={menu.menuId}
                  className={`menu-card${selectedMenuIds.includes(menu.menuId) ? " selected" : ""}${
                    isVoted ? " voted" : ""
                  }`}
                >
                  <label>
                    <input
                      type="checkbox"
                      disabled={!isSelectable}
                      checked={selectedMenuIds.includes(menu.menuId)}
                      onChange={() => toggleMenu(menu.menuId)}
                    />
                    {menu.imageUrl && (
                      <img className="menu-thumb" src={menu.imageUrl} alt={menu.menuName} />
                    )}
                    <div>
                      <div className="menu-name">
                        {menu.menuName}
                        {isVoted && <span className="badge voted-badge">내 선택</span>}
                      </div>
                    </div>
                    <span className={`badge status-${menu.status}`}>
                      {STATUS_LABEL[menu.status] || menu.status}
                    </span>
                  </label>
                </li>
              );
            })}

            <li
              className={`menu-card${selectedAnyMenu ? " selected" : ""}${
                locked && myAnyMenu ? " voted" : ""
              }`}
            >
              <label>
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={selectedAnyMenu}
                  onChange={(e) => handleAnyMenuChange(e.target.checked)}
                />
                <img className="menu-thumb-icon" src={anyMenuIcon} alt="" aria-hidden="true" />
                <div>
                  <div className="menu-name">
                    무슨 메뉴든 좋다
                    {locked && myAnyMenu && <span className="badge voted-badge">내 선택</span>}
                  </div>
                </div>
              </label>
            </li>
            <li
              className={`menu-card${selectedNoPreference ? " selected" : ""}${
                locked && myNoPreference ? " voted" : ""
              }`}
            >
              <label>
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={selectedNoPreference}
                  onChange={(e) => handleNoPreferenceChange(e.target.checked)}
                />
                <img className="menu-thumb-icon" src={noPreferenceIcon} alt="" aria-hidden="true" />
                <div>
                  <div className="menu-name">
                    원하는 메뉴가 없다
                    {locked && myNoPreference && <span className="badge voted-badge">내 선택</span>}
                  </div>
                </div>
              </label>
            </li>
          </ul>

          {!locked && (
            <button
              type="button"
              className="vote-button"
              disabled={!hasSelection || voting}
              onClick={handleVote}
            >
              {voting ? "투표하는 중..." : "투표하기"}
            </button>
          )}

          {locked && (
            <button type="button" className="secondary-button" onClick={handleReselect}>
              다시 선택하기
            </button>
          )}

          <Link to={`/board/${encodeURIComponent(code)}/result`} className="secondary-button">
            전체 결과 보기
          </Link>
        </>
      )}

      {!loading && !error && (
        <div className="menu-submit-section">
          <h2 className="section-title">메뉴 추가하기</h2>
          <p className="notice">
            등록한 메뉴는 관리자 검수 후 오전 11시에 일괄 오픈돼요. 오전 11시 이후에는 오늘 메뉴를 등록할 수 없어요.
          </p>
          <form className="inline-form" onSubmit={handleSubmitMenu}>
            <input
              type="text"
              placeholder="메뉴 이름 (예: 김치찌개)"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" disabled={submitting || !newMenuName.trim()}>
              {submitting ? "등록하는 중..." : "메뉴 등록"}
            </button>
          </form>
          {submitError && <p className="form-error">{submitError}</p>}
          {submitSuccess && <p className="form-success">{submitSuccess}</p>}
        </div>
      )}
    </div>
  );
}
