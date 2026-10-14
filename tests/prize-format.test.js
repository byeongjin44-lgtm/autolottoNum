import test from 'node:test';
import assert from 'node:assert/strict';
import {formatFirstPrize} from '../prize-format.js';
import {normalize} from '../scripts/draw-data.mjs';
test('1게임 당첨금 정확한 금액 표시, 근삿값/전체 지급액 배제', () => {
  assert.equal(formatFirstPrize({firstPrize:3006515775,firstWinners:10}), '1등 당첨 3,006,515,775원 (당첨게임 수 10)');
});
test('공식 총액 수집 → 나누기 → 화면 표시 완결 검증', () => {
  const draw=normalize({ltEpsd:'1245',ltRflYmd:'20261010',tm1WnNo:4,tm2WnNo:5,tm3WnNo:25,tm4WnNo:28,tm5WnNo:32,tm6WnNo:42,bnsWnNo:12,rnk1SumWnAmt:30065157750,rnk1WnNope:10});
  assert.equal(formatFirstPrize(draw),'1등 당첨 3,006,515,775원 (당첨게임 수 10)');
});
test('잘못된 데이터는 잘못된 금액 대신 안내 표시',()=>{
  assert.match(formatFirstPrize({firstPrize:NaN,firstWinners:10}),/확인할 수 없습니다/);
});
