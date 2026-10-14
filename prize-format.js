/** firstPrize is the precise prize PER WINNING GAME, not the combined pool. */
export function formatFirstPrize(draw) {
  const prize = Number(draw?.firstPrize);
  const winners = Number(draw?.firstWinners);
  if (!Number.isSafeInteger(prize) || prize < 0 || !Number.isInteger(winners) || winners < 0) {
    return '1등 당첨금 정보를 확인할 수 없습니다.';
  }
  return `1등 당첨 ${prize.toLocaleString('ko-KR')}원 (당첨게임 수 ${winners.toLocaleString('ko-KR')})`;
}
