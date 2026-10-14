import test from 'node:test';import assert from 'node:assert/strict';import {parseLottoQR,rankPrize} from '../qr.js';
test('reads official sample with five groups',()=>{const r=parseLottoQR('https://qr.dhlottery.co.kr/?v=1242q081518273342q151722243139q161822253140q020410163141q121619214144117305268814190159');assert.equal(r.round,1242);assert.equal(r.games.length,5);assert.deepEqual(r.games[3].numbers,[2,4,10,16,31,41])});
test('detects first and fifth prize',()=>{const d={numbers:[2,4,10,16,31,41],bonus:9};assert.equal(rankPrize([2,4,10,16,31,41],d).rank,1);assert.equal(rankPrize([2,4,10,18,25,30],d).rank,5)});
test('rejects foreign links',()=>assert.throws(()=>parseLottoQR('https://fake.example/?v=1242q0815182733420000000000')));
