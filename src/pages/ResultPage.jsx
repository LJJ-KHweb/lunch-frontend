import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as voteApi from "../api/voteApi";

const SPECIAL_ICON = {
  ANY_MENU: "🤷",
  NO_PREFERENCE: "🚫",
};

const isMyVote = (item, result) => {
  if (item.menuId) return result.myVoteMenuIds?.includes(item.menuId);
  if (item.specialOption === "ANY_MENU") return result.myAnyMenu;
  if (item.specialOption === "NO_PREFERENCE") return result.myNoPreference;
  return false;
};

export default function ResultPage() {
  const { code } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    voteApi
      .getResult(code)
      .then((res) => setResult(res.data.data))
      .catch((err) => setError(err.response?.data?.msg || "결과를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [code]);

  const maxCount = result ? Math.max(1, ...result.items.map((i) => i.voteCount)) : 1;
  const hasMenus = result ? result.items.some((i) => i.menuId) : false;

  return (
    <div className="page">
      <div className="page-header">
        <h1>투표 결과</h1>
        <Link to={`/board/${encodeURIComponent(code)}`} className="nav-pill">
          돌아가기
        </Link>
      </div>

      {loading && <p>불러오는 중...</p>}
      {!loading && error && <p className="form-error">{error}</p>}

      {!loading && result && (
        <>
          <p className="sub">
            {result.className} · {result.voteDate} · 총 {result.totalVotes}표
          </p>

          {!hasMenus && <p className="empty">오늘은 등록된 메뉴가 없습니다.</p>}

          <ul className="result-list">
            {result.items.map((item) => {
              const key = item.menuId ?? item.specialOption;
              const mine = isMyVote(item, result);
              return (
                <li key={key} className={`result-item${mine ? " voted" : ""}`}>
                  <div className="result-row">
                    {item.imageUrl ? (
                      <img className="menu-thumb" src={item.imageUrl} alt={item.menuName} />
                    ) : (
                      <div className="menu-thumb-placeholder" aria-hidden="true">
                        {SPECIAL_ICON[item.specialOption] ?? "🍴"}
                      </div>
                    )}
                    <div className="result-body">
                      <div className="result-label">
                        <span>
                          {item.menuName}
                          {mine && <span className="badge voted-badge">내 선택</span>}
                        </span>
                        <span>{item.voteCount}표</span>
                      </div>
                      <div className="result-bar-track">
                        <div
                          className="result-bar-fill"
                          style={{ width: `${(item.voteCount / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
