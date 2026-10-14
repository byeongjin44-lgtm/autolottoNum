import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
export const DATA_DIR = new URL('../public/data/',import.meta.url);
export const BASE_URL='https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
export function normalize(item){
 const raw=String(item.ltRflYmd||'').replace(/\D/g,'');
 const date=raw.length===8?`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6)}`:'';
 return {round:Number(item.ltEpsd),date,numbers:[1,2,3,4,5,6].map(i=>Number(item[`tm${i}WnNo`])),bonus:Number(item.bnsWnNo),firstPrize:Number(item.rnk1SumWnAmt),firstWinners:Number(item.rnk1WnNope)};
}
export function validateDraw(d){
 if(!d||!Number.isInteger(d.round)||d.round<1||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(d.date+'T00:00:00Z'))||!Array.isArray(d.numbers)||d.numbers.length!==6||d.numbers.some(n=>!Number.isInteger(n)||n<1||n>45)||new Set(d.numbers).size!==6||!Number.isInteger(d.bonus)||d.bonus<1||d.bonus>45||d.numbers.includes(d.bonus)||!Number.isSafeInteger(d.firstPrize)||d.firstPrize<0||!Number.isInteger(d.firstWinners)||d.firstWinners<0)throw Error('유효하지 않은 회차: '+(d?.round??'?'));
 return d;
}
export function buildFiles(draws){
 const sorted=[...draws].sort((a,b)=>a.round-b.round);
 if(!sorted.length)throw Error('회차 없음');
 const counts=Array(45).fill(0);
 sorted.forEach((d,i)=>{validateDraw(d);if(d.round!==i+1)throw Error(`회차 누락·중복: 예상 ${i+1}, 실제 ${d.round}`);d.numbers.forEach(n=>counts[n-1]++)});
 const latest=sorted.at(-1);
 return {history:sorted.map(d=>({round:d.round,date:d.date,numbers:d.numbers,bonus:d.bonus})),stats:{throughRound:latest.round,drawCount:sorted.length,counts,source:'https://www.dhlottery.co.kr/lt645/intro',description:`1~${latest.round}회 당첨번호 6개 기준, 보너스 제외`},latest:{...latest,source:'https://www.dhlottery.co.kr/lt645/intro'}};
}
export async function fetchBatch(start,fetchImpl=fetch){
 const url=new URL(BASE_URL);url.searchParams.set('srchDir','center');url.searchParams.set('srchLtEpsd',String(start));
 let lastError;
 for(let tries=0;tries<3;tries++){
  try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),16000);
   let response;try{response=await fetchImpl(url.toString(),{headers:{accept:'application/json','user-agent':'Mozilla/5.0 (compatible; LottoHistorySync/1.0)'},signal:ctrl.signal})}finally{clearTimeout(timer)}
   if(!response.ok)throw Error('HTTP '+response.status);const body=await response.json();if(!Array.isArray(body?.data?.list))throw Error('응답 형식 변경');return body.data.list.map(normalize).map(validateDraw);
  }catch(e){lastError=e;if(tries<2)await pause(900*(tries+1))}
 }throw Error(`${start}회 구간 다운로드 실패: ${lastError?.message}`);
}
export async function fetchHistory(fetcher=fetchBatch,{pace=250}={}){
 const map=new Map();
 // 먼저 앞쪽 10회와 최신 추정 회차를 확인한다. API 반환은 기준 회차부터 10회 범위다.
 const first=await fetcher(1);first.forEach(d=>map.set(d.round,d));
 if(!map.has(1))throw Error('1회차 조회 실패');
 const today=new Date();const est=Math.floor((today.getTime()-Date.UTC(2002,11,7))/604800000)+1;
 let latest=0;
 for(let probe=est;probe>=Math.max(1,est-150);probe-=10){const data=await fetcher(probe);if(data.length){latest=Math.max(...data.map(d=>d.round));break}}
 if(latest<1)throw Error('최신 회차를 확인할 수 없음');
 for(let start=11;start<=latest;start+=10){if(pace)await pause(pace);const group=await fetcher(start);group.forEach(d=>{if(d.round<=latest)map.set(d.round,d)})}
 // API가 경계 기준으로 겹치더라도 전 회차가 빠짐없이 있어야 한다.
 const draws=[...map.values()].filter(x=>x.round<=latest);
 const files=buildFiles(draws);
 if(files.latest.round!==latest)throw Error('마지막 회차 불일치');
 return files;
}
export async function publish(files,dir=DATA_DIR){
 await mkdir(dir,{recursive:true});
 for(const name of ['history','stats','latest']){const path=new URL(name+'.json',dir);await writeFile(path,JSON.stringify(files[name],null,2)+'\n')}
}
