import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as voteApi from "../api/voteApi";

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

          {result.items.length === 0 && <p className="empty">오늘은 등록된 메뉴가 없습니다.</p>}

          <ul className="result-list">
            {result.items.map((item) => (
              <li
                key={item.menuId}
                className={`result-item${item.menuId === result.myVoteMenuId ? " voted" : ""}`}
              >
                <div className="result-row">
                  {item.imageUrl && (
                    <img className="menu-thumb" src={item.imageUrl} alt={item.menuName} />
                  )}
                  <div className="result-body">
                    <div className="result-label">
                      <span>
                        {item.menuName}
                        {item.menuId === result.myVoteMenuId && (
                          <span className="badge voted-badge">내 선택</span>
                        )}
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
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
