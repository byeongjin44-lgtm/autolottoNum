import {readFile,writeFile} from 'node:fs/promises';
import {validateStats} from '../logic.js';
// Input: [{round,date,numbers:[6],bonus,firstPrize,firstWinners}, ...] in increasing round order
const input=process.argv[2];if(!input)throw Error('사용법: node scripts/update-draws.mjs ./verified-draws.json');
const fresh=JSON.parse(await readFile(input,'utf8'));if(!Array.isArray(fresh)||!fresh.length)throw Error('배열 데이터가 필요합니다');
const folder=new URL('../public/data/',import.meta.url);const stats=validateStats(JSON.parse(await readFile(new URL('stats.json',folder),'utf8')));const history=JSON.parse(await readFile(new URL('history.json',folder),'utf8'));let latest=JSON.parse(await readFile(new URL('latest.json',folder),'utf8'));
for(const row of fresh){const nums=row.numbers;if(row.round!==stats.throughRound+1||!Array.isArray(nums)||nums.length!==6||new Set(nums).size!==6||nums.some(n=>!Number.isInteger(n)||n<1||n>45)||!Number.isInteger(row.bonus)||row.bonus<1||row.bonus>45||nums.includes(row.bonus)||!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||!Number.isSafeInteger(row.firstPrize)||row.firstPrize<0||!Number.isInteger(row.firstWinners)||row.firstWinners<1)throw Error(`잘못됐거나 누락된 회차 ${row.round}`);nums.forEach(n=>stats.counts[n-1]++);stats.throughRound++;stats.drawCount=stats.throughRound;history.push({round:row.round,numbers:nums,bonus:row.bonus});latest={...row,source:'https://www.dhlottery.co.kr/lt645/result'}}
validateStats(stats);
await Promise.all([writeFile(new URL('stats.json',folder),JSON.stringify(stats,null,2)+'\n'),writeFile(new URL('history.json',folder),JSON.stringify(history,null,2)+'\n'),writeFile(new URL('latest.json',folder),JSON.stringify(latest,null,2)+'\n')]);console.log('업데이트 완료: '+stats.throughRound+'회 / '+fresh.length+'회 추가');
