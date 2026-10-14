import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,validateDraw,buildFiles} from '../scripts/draw-data.mjs';
const make=(round,nums,bonus=45)=>({round,date:'2026-10-10',numbers:nums,bonus,firstPrize:100000,firstWinners:1});
test('공식 응답 필드 정규화',()=>{
 const v=normalize({ltEpsd:'1245',ltRflYmd:'20261010',tm1WnNo:4,tm2WnNo:5,tm3WnNo:25,tm4WnNo:28,tm5WnNo:32,tm6WnNo:42,bnsWnNo:12,rnk1SumWnAmt:'30065157750',rnk1WnNope:10});
 assert.equal(v.round,1245);assert.deepEqual(v.numbers,[4,5,25,28,32,42]);assert.equal(v.bonus,12);assert.equal(v.firstPrize,3006515775);validateDraw(v);
});
test('연속 회차 검증 후 동일 원본에서 통계와 최신번호 생성',()=>{
 const f=buildFiles([make(1,[1,2,3,4,5,6]),make(2,[7,8,9,10,11,12])]);
 assert.equal(f.stats.throughRound,2);assert.equal(f.stats.counts.reduce((a,b)=>a+b,0),12);assert.equal(f.latest.round,2);assert.equal(f.history.length,2);
});
test('결측 회차, 중복, 부정확한 보너스 거부',()=>{
 assert.throws(()=>buildFiles([make(1,[1,2,3,4,5,6]),make(3,[7,8,9,10,11,12])]),/누락/);
 assert.throws(()=>buildFiles([make(1,[1,2,3,4,5,6],6)]),/유효하지/);
 assert.throws(()=>buildFiles([make(1,[1,2,3,4,5,6]),make(1,[1,2,3,4,5,6])]),/누락/);
});
