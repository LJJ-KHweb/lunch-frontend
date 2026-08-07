import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="form-page">
      <h1>오늘뭐먹지?</h1>
      <p className="form-intro">존재하지 않는 페이지예요.</p>
      <p className="form-footer">
        <Link to="/">코드 입력 화면으로 돌아가기</Link>
      </p>
    </div>
  );
}
