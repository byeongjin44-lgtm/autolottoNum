import {readFile,writeFile} from 'node:fs/promises';
import {countsFromDraws} from '../logic.js';
// 사용법: npm run update:data -- 경로/전체회차.csv
// CSV 필수 컬럼: 회차,번호1,번호2,번호3,번호4,번호5,번호6
// 중간 회차가 누락되면 업데이트 중단 (임의 통계 금지)
const file=process.argv[2];if(!file){console.error('사용법: npm run update:data -- ./all-rounds.csv');process.exit(1)}
const csv=await readFile(file,'utf8');const lines=csv.replace(/^\uFEFF/,'').trim().split(/\r?\n/);const head=lines.shift().split(',').map(s=>s.trim());const names=['회차','번호1','번호2','번호3','번호4','번호5','번호6'];const cols=names.map(n=>head.indexOf(n));if(cols.some(i=>i<0))throw Error('필수 컬럼 누락: '+names.join(', '));const draws=lines.filter(Boolean).map(line=>{const cells=line.split(',').map(s=>s.trim());return {round:cells[cols[0]],numbers:cols.slice(1).map(i=>cells[i])}});const result=countsFromDraws(draws);const data={...result,source:'사용자가 검증해 입력한 전체 회차 CSV',description:'보너스 제외. 전체 당첨번호 원본 CSV에서 재집계.'};await writeFile(new URL('../public/data/stats.json',import.meta.url),JSON.stringify(data,null,2)+'\n');console.log('업데이트 완료:',result.throughRound+'회, 합계 '+result.counts.reduce((a,b)=>a+b,0)+'개');
