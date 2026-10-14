export function validateStats(data){if(!data||!Number.isInteger(data.throughRound)||data.throughRound<1||!Array.isArray(data.counts)||data.counts.length!==45||!data.counts.every(n=>Number.isInteger(n)&&n>=0)||data.counts.reduce((a,b)=>a+b,0)!==data.throughRound*6)throw Error('통계 검증 실패');return data}
export function rankNumbers(counts){const values=counts.map((count,index)=>({number:index+1,count}));const descending=[...values].sort((a,b)=>b.count-a.count||a.number-b.number);const ascending=[...values].sort((a,b)=>a.count-b.count||a.number-b.number);return {values,descending,hot:descending.slice(0,15).map(x=>x.number),cold:ascending.slice(0,15).map(x=>x.number)}}
export function randomInt(max){if(!Number.isInteger(max)||max<=0)throw Error('invalid max');if(globalThis.crypto?.getRandomValues){const limit=Math.floor(4294967296/max)*max;const a=new Uint32Array(1);do{globalThis.crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%max}return Math.floor(Math.random()*max)}
export function sampleSix(input,rand=randomInt){if(input.length<6||new Set(input).size!==input.length)throw Error('번호 후보 오류');const values=[...input];for(let i=values.length-1;i>0;i--){const j=rand(i+1);[values[i],values[j]]=[values[j],values[i]]}return values.slice(0,6).sort((a,b)=>a-b)}
export function generateGames(counts,rand=randomInt){const rank=rankNumbers(counts);return {a:sampleSix(Array.from({length:45},(_,i)=>i+1),rand),b:sampleSix(rank.hot,rand),c:sampleSix(rank.cold,rand)}}
export function countsFromDraws(draws){let counts=Array(45).fill(0);let rounds=new Set();for(const row of draws){const round=Number(row.round);const nums=row.numbers.map(Number);if(!Number.isInteger(round)||round<1||rounds.has(round)||nums.length!==6||new Set(nums).size!==6||nums.some(n=>!Number.isInteger(n)||n<1||n>45))throw Error('잘못된 회차 데이터: '+round);rounds.add(round);nums.forEach(n=>counts[n-1]++)}const max=Math.max(...rounds);if(rounds.size!==max)throw Error('1회부터 '+max+'회까지 연속 회차가 필요합니다');return {throughRound:max,drawCount:rounds.size,counts}}
const ALL=Array.from({length:45},(_,i)=>i+1);
export function generateFiltered({pool=ALL,fixed=[],excluded=[],odd=null,rand=randomInt}){
 const unique=a=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(n=>Number.isInteger(n)&&n>=1&&n<=45);
 if(!unique(pool)||!unique(fixed)||!unique(excluded)||fixed.length>6)throw Error('번호 설정을 확인해 주세요.');
 if(fixed.some(n=>excluded.includes(n)))throw Error('고정 번호와 제외 번호가 겹칩니다.');
 if(fixed.some(n=>!pool.includes(n)))throw Error('고정 번호가 선택한 생성 방식의 후보에 없습니다.');
 const candidates=pool.filter(n=>!fixed.includes(n)&&!excluded.includes(n));const need=6-fixed.length;
 if(candidates.length<need)throw Error('제외 번호가 너무 많아 6개를 만들 수 없습니다.');
 if(odd!==null){if(!Number.isInteger(odd)||odd<0||odd>6)throw Error('홀짝 설정 오류');const mustOdd=odd-fixed.filter(n=>n%2).length;const mustEven=need-mustOdd;if(mustOdd<0||mustEven<0||candidates.filter(n=>n%2).length<mustOdd||candidates.filter(n=>n%2===0).length<mustEven)throw Error('현재 고정·제외 번호로는 선택한 홀짝 비율을 만들 수 없습니다.');return [...fixed,...shuffle(candidates.filter(n=>n%2),rand).slice(0,mustOdd),...shuffle(candidates.filter(n=>n%2===0),rand).slice(0,mustEven)].sort((a,b)=>a-b)}
 return [...fixed,...shuffle(candidates,rand).slice(0,need)].sort((a,b)=>a-b)
}
export function shuffle(input,rand=randomInt){const a=[...input];for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function generateBatch({counts,mode='mixed',gameCount=3,fixed=[],excluded=[],odd=null,rand=randomInt}){
 if(![1,3,5].includes(gameCount)||!['mixed','random','semi'].includes(mode))throw Error('생성 옵션 오류');
 const rank=rankNumbers(counts);const pools=mode==='mixed'?[ALL,rank.descending.map(x=>x.number),[...rank.values].sort((a,b)=>a.count-b.count||a.number-b.number).map(x=>x.number)]:Array(gameCount).fill(ALL);
 const labels=mode==='mixed'?['완전 랜덤','HOT 번호','COLD 번호']:Array.from({length:gameCount},()=>mode==='semi'?'반자동':'완전 랜덤');
 const count=mode==='mixed'?3:gameCount;
 return Array.from({length:count},(_,i)=>{
  if(mode!=='mixed'||i===0)return {label:labels[i],numbers:generateFiltered({pool:pools[i],fixed,excluded,odd,rand})};
  // HOT/COLD: 15개 후보부터 시작하되 고정·제외·홀짝 제약으로 부족하면 다음 순위까지 확장.
  // 고정 번호는 랭킹 밖이어도 반드시 포함하며, 전체 45개에서도 불가능한 설정만 거절.
  for(let size=15;size<=45;size++){
   const pool=[...new Set([...pools[i].slice(0,size),...fixed])];
   try{return {label:labels[i],numbers:generateFiltered({pool,fixed,excluded,odd,rand})}}
   catch(e){if(size===45)throw e}
  }
 });
}
