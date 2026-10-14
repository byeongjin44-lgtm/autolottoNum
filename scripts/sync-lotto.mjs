import {readFile} from 'node:fs/promises';
import {fetchHistory,publish,DATA_DIR} from './draw-data.mjs';
async function main(){
 const old=JSON.parse(await readFile(new URL('latest.json',DATA_DIR),'utf8'));
 const files=await fetchHistory();
 if(files.latest.round<old.round)throw Error('이전 회차보다 오래된 데이터는 반영하지 않습니다');
 if(files.latest.round===old.round&&files.latest.firstPrize===old.firstPrize&&files.latest.firstWinners===old.firstWinners&&process.env.FORCE_SYNC!=='1'){
   console.log(`최신 ${old.round}회 동일, 변경 없음`);return;
 }
 await publish(files);
 console.log(`동기화 성공: 1~${files.latest.round}회 / ${files.history.length}개 / ${files.latest.date}`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
