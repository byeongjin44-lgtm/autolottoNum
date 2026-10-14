import {readFile,writeFile} from 'node:fs/promises';
import {validateStats} from '../logic.js';
const file=new URL('../public/data/stats.json',import.meta.url);
const data=JSON.parse(await readFile(file,'utf8'));
if(data.throughRound!==1225)throw Error('기존 데이터가 1225회 기준이 아닙니다');
const rounds=[
[1226,4,6,13,17,26,28],
[1227,1,14,16,34,41,44],
[1228,2,4,29,30,35,44],
[1229,12,13,29,34,37,42],
[1230,3,8,9,22,28,42],
[1231,4,13,14,18,31,38],
[1232,12,15,19,22,24,36],
[1233,2,7,20,25,37,40],
[1234,1,15,19,31,35,43],
[1235,6,7,11,15,39,43],
[1236,12,18,21,29,34,38],
[1237,10,20,23,34,37,40],
[1238,2,13,18,32,38,42],
[1239,11,13,22,32,33,36],
[1240,11,13,19,20,31,44],
[1241,7,13,16,23,24,43],
[1242,2,4,10,16,31,41],
[1243,9,18,24,38,43,44],
[1244,1,13,18,26,34,38]
];
rounds.forEach(([round,...nums],i)=>{if(round!==1226+i||nums.length!==6||new Set(nums).size!==6||nums.some(n=>n<1||n>45))throw Error('round data invalid');nums.forEach(n=>data.counts[n-1]++)});
data.throughRound=1244;data.drawCount=1244;data.source='https://lottox.kr/history/';data.description='1~1244회 1등 본번호 6개 기준 (보너스 제외). 1225회 원본 CSV에 1226~1244회 공개 결과를 추가 집계.';
validateStats(data);await writeFile(file,JSON.stringify(data,null,2)+'\n');console.log('Updated',data.throughRound,'sum',data.counts.reduce((a,b)=>a+b,0));
