import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as menuApi from "../api/menuApi";
import * as voteApi from "../api/voteApi";

const STATUS_LABEL = {
  PENDING_REVIEW: "검토중",
  OPEN: "투표 가능",
  CLOSED: "마감",
};

export default function BoardPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [myVoteMenuId, setMyVoteMenuId] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [reselecting, setReselecting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [menuRes, resultRes] = await Promise.all([
        menuApi.getBoardMenus(code),
        voteApi.getResult(code).catch(() => null),
      ]);
      setMenus(menuRes.data.data);
      setMyVoteMenuId(resultRes?.data?.data?.myVoteMenuId ?? null);
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

  const handleVote = async () => {
    if (!selectedMenuId) return;
    setVoting(true);
    setError("");
    try {
      await voteApi.vote(code, selectedMenuId);
      setMyVoteMenuId(selectedMenuId);
      setReselecting(false);
    } catch (err) {
      setError(err.response?.data?.msg || "투표에 실패했습니다.");
    } finally {
      setVoting(false);
    }
  };

  const handleReselect = () => {
    setSelectedMenuId(myVoteMenuId);
    setReselecting(true);
    setError("");
  };

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
          {myVoteMenuId && !reselecting && (
            <p className="notice">이미 오늘 투표를 완료했습니다. 아래에서 결과를 확인하세요.</p>
          )}

          <ul className="menu-list">
            {menus.map((menu) => {
              const isVoted = !reselecting && myVoteMenuId === menu.menuId;
              const isSelectable = (!myVoteMenuId || reselecting) && menu.status === "OPEN";
              return (
                <li
                  key={menu.menuId}
                  className={`menu-card${selectedMenuId === menu.menuId ? " selected" : ""}${
                    isVoted ? " voted" : ""
                  }`}
                >
                  <label>
                    <input
                      type="radio"
                      name="menu"
                      disabled={!isSelectable}
                      checked={selectedMenuId === menu.menuId}
                      onChange={() => setSelectedMenuId(menu.menuId)}
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
          </ul>

          {(!myVoteMenuId || reselecting) && (
            <button
              type="button"
              className="vote-button"
              disabled={!selectedMenuId || voting}
              onClick={handleVote}
            >
              {voting ? "투표하는 중..." : "투표하기"}
            </button>
          )}

          {myVoteMenuId && !reselecting && (
            <button type="button" className="secondary-button" onClick={handleReselect}>
              다시 선택하기
            </button>
          )}

          <Link to={`/board/${encodeURIComponent(code)}/result`} className="secondary-button">
            전체 결과 보기
          </Link>
        </>
      )}
    </div>
  );
}
