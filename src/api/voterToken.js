const STORAGE_KEY = "oneulmwo_voter_token";

// 브라우저(localStorage)에 저장된 투표자 식별 토큰을 가져오거나, 없으면 새로 발급해서 저장한다.
// 기존에는 서버가 요청자의 공인 IP로 투표자를 구분했지만, 같은 와이파이를 쓰는 교실 환경에서는
// 여러 학생이 하나의 IP로 묶여버려 "반 전체가 1표"가 되는 문제가 있었다. 이를 브라우저(기기)
// 단위로 구분되는 토큰 방식으로 대체했다. (localStorage를 지우거나 다른 브라우저/시크릿창을
// 쓰면 새 사람으로 인식되는 한계는 있음 - 점심 메뉴 투표 수준의 낮은 위험도를 감안한 트레이드오프)
export const getVoterToken = () => {
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
};
