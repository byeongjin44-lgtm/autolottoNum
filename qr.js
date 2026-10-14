const HOSTS=new Set(['qr.dhlottery.co.kr','m.dhlottery.co.kr','www.dhlottery.co.kr']);
export function parseLottoQR(raw){
 let url;try{url=new URL(raw.trim())}catch{throw Error('올바른 QR 주소를 입력해 주세요.')}
 if(url.protocol!=='https:'||!HOSTS.has(url.hostname))throw Error('동행복권 QR 주소만 확인할 수 있습니다.');
 const v=url.searchParams.get('v');if(!v)throw Error('로또 6/45 QR 데이터가 없습니다.');
 const match=v.match(/^(\d{1,5})([qm])((?:\d{12}[qm]){0,4}\d{12})(\d{10})(?:.*)?$/i);
 // The encoded ticket contains one letter per game, each followed by 12 digits (6 x 2-digit numbers).
 if(!match)throw Error('지원하지 않는 QR 데이터 형식입니다. 공식 페이지에서 확인해 주세요.');
 const round=Number(match[1]),type=match[2];
 const games=[];const body=type+match[3];const re=/([qm])(\d{12})/gi;let m;
 while((m=re.exec(body))!==null){const numbers=m[2].match(/\d{2}/g).map(Number);if(numbers.some(n=>n<1||n>45)||new Set(numbers).size!==6)throw Error('복권 번호가 올바르지 않습니다.');games.push({type:m[1].toLowerCase(),numbers:numbers.sort((a,b)=>a-b)})}
 if(!Number.isInteger(round)||round<1||games.length<1||games.length>5||games.length*13!==body.length)throw Error('QR 게임 정보를 인식할 수 없습니다.');
 return {round,games,officialUrl:url.toString()};
}
export function rankPrize(numbers,draw){if(!draw)return null;const matches=numbers.filter(n=>draw.numbers.includes(n)).length;const bonus=numbers.includes(draw.bonus);return {matches,bonus,rank:matches===6?1:matches===5&&bonus?2:matches===5?3:matches===4?4:matches===3?5:0}}
