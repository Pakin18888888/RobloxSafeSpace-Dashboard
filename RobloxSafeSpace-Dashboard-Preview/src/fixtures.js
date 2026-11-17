/* Synthetic fixtures only. No records from the supplied video/PDF are reproduced. */
(function(root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const permissions = {
    overview: ['overview.read'], alerts: ['alerts.read','alerts.write'],
    journeys: ['journeys.read','journeys.write','journeys.export'], codes: ['codes.read','codes.write'],
    players: ['players.read','players.write'], config: ['config.read','config.write'],
    users: ['users.read','users.write'], logs: ['logs.read']
  };
  const rolePresets = [
    {id:'admin',name:'Admin',description:'ผู้ดูแลทุกเมนู · บทบาทจำลอง',permissions:Object.values(permissions).flat()},
    {id:'observer',name:'Observer',description:'อ่านภาพรวมและกิจกรรม · บทบาทเสนอ',permissions:['overview.read','journeys.read','players.read']},
    {id:'support',name:'Support',description:'ดูแลคำขอ · บทบาทเสนอ',permissions:['alerts.read','alerts.write','players.read']},
    {id:'editor',name:'Content editor',description:'จัดการเนื้อหาและรหัส · บทบาทเสนอ',permissions:['journeys.read','journeys.write','journeys.export','codes.read','codes.write']},
    {id:'none',name:'No access',description:'ไม่มีสิทธิ์ · สำหรับทดสอบ',permissions:[]}
  ];
  function fixtures(){
    const journeys = [
      {id:'j1',title:'พื้นที่ของเรา',description:'สำรวจพื้นที่และทำความรู้จักตัวละคร ผ่านบทสนทนาและการทบทวนทางเลือก',status:'review',version:2,updated:'2026-11-15T09:20:00Z',outOfOrder:'ลองคุยกับตัวละครก่อนหน้าก่อนนะ',revisited:'คุณผ่านขั้นตอนนี้แล้ว',completed:'ขอบคุณที่ร่วมกิจกรรมจนจบ',showTotals:false,labels:[{key:'reflection',label:'การทบทวน'}],csvColumns:'playerId,journeyId,progress,updated',steps:[
        {id:'s1',npc:'guide',name:'เริ่มต้นที่พื้นที่ปลอดภัย',dialog:'ยินดีต้อนรับ ลองสำรวจพื้นที่ในจังหวะของตัวเองได้เลย',quiz:{title:'คุณอยากเริ่มจากตรงไหน?',mode:'survey',choices:['รู้จักตัวละคร','สำรวจพื้นที่'],answer:0}},
        {id:'s2',npc:'nurse',name:'สำรวจทางเลือก',dialog:'ถ้าเจอสถานการณ์ที่ไม่สบายใจ คุณสามารถหยุดพักได้',quiz:{title:'ทางเลือกไหนช่วยให้พักได้?',mode:'graded',choices:['หยุดพักสักครู่','ฝืนเล่นต่อ'],answer:0}},
        {id:'s3',npc:'captain',name:'ทบทวนสิ่งที่ได้เรียนรู้',dialog:'ขอบคุณที่แบ่งปันมุมมองของคุณ',quiz:{title:'คุณอยากลองอะไรต่อ?',mode:'survey',choices:['ทบทวนกิจกรรม','กลับพื้นที่หลัก'],answer:0}}
      ]},
      {id:'j2',title:'เข้าใจมุมมองของกันและกัน',description:'กิจกรรมตัวอย่างเพื่อสำรวจมุมมองในสถานการณ์ร่วมกัน',status:'draft',version:1,updated:'2026-11-14T04:15:00Z',outOfOrder:'เริ่มจากขั้นก่อนหน้าก่อนนะ',revisited:'ผ่านขั้นตอนนี้แล้ว',completed:'คุณทำกิจกรรมครบแล้ว',showTotals:false,labels:[],csvColumns:'playerId,journeyId,progress',steps:[{id:'s4',npc:'friend',name:'ฟังมุมมอง',dialog:'แต่ละคนอาจมองสถานการณ์ต่างกัน',quiz:{title:'อยากฟังมุมมองไหน?',mode:'survey',choices:['มุมมองเพื่อน','มุมมองตัวละคร'],answer:0}},{id:'s5',npc:'guide',name:'ลองเลือกอีกทาง',dialog:'ลองคิดถึงทางเลือกที่เป็นไปได้',quiz:{title:'เลือกกิจกรรมถัดไป',mode:'survey',choices:['ทบทวน','พัก'],answer:0}}]},
      {id:'j3',title:'รู้จักการขอความช่วยเหลือ',description:'บทสนทนาฝึกในสถานการณ์สมมติ แยกจากคำขอช่วยเหลือจริง',status:'draft',version:1,updated:'2026-11-13T08:00:00Z',outOfOrder:'ไปหาตัวละครก่อนหน้า',revisited:'ขั้นตอนนี้เสร็จแล้ว',completed:'จบกิจกรรมตัวอย่าง',showTotals:false,labels:[],csvColumns:'playerId,progress',steps:[{id:'s6',npc:'helper',name:'รู้จักช่องทาง',dialog:'ในกิจกรรมนี้ เราจะลองสำรวจช่องทางขอความช่วยเหลือ',quiz:{title:'เลือกทางไปต่อ',mode:'survey',choices:['ดูตัวอย่าง','ทบทวน'],answer:0}}]}
    ];
    const players=Array.from({length:12},(_,i)=>({id:`p_demo_${String(i+1).padStart(3,'0')}`,firstSeen:`2026-11-${String(3+i%5).padStart(2,'0')}T03:00:00Z`,lastSeen:`2026-11-${String(10+i%7).padStart(2,'0')}T${String(3+i%6).padStart(2,'0')}:20:00Z`,region:'ไม่แสดง',progress:[{journeyId:'j1',step:i%4,done:i%4===3,updated:'2026-11-16T03:20:00Z'},{journeyId:'j2',step:i%3,done:i%3===2,updated:'2026-11-15T06:30:00Z'}]}));
    const submissions=Array.from({length:36},(_,i)=>({id:`q${i+1}`,playerId:players[i%12].id,journeyId:i%3===0?'j2':'j1',quiz:i%2?'สำรวจทางเลือก':'ทบทวนกิจกรรม',result:i%2?'1/2':'answered',at:`2026-11-${String(10+i%7).padStart(2,'0')}T${String(3+i%8).padStart(2,'0')}:${String(i%60).padStart(2,'0')}:00Z`})).sort((a,b)=>b.at.localeCompare(a.at));
    return {journeys,players,submissions,
      alerts:[
        {id:'a1',playerId:'p_demo_003',message:'ข้อความตัวอย่าง: อยากทราบวิธีกลับไปยังกิจกรรมก่อนหน้า',status:'open',unread:true,at:'2026-11-16T04:25:00Z',note:'',replies:[]},
        {id:'a2',playerId:'p_demo_007',message:'ข้อความตัวอย่าง: ต้องการพักและกลับมาเล่นภายหลัง',status:'open',unread:true,at:'2026-11-16T03:10:00Z',note:'รอผู้รับเรื่องตรวจรายละเอียดตัวอย่าง',replies:[]},
        {id:'a3',playerId:'p_demo_002',message:'ข้อความตัวอย่าง: ปุ่มกิจกรรมไม่แสดงในหน้าจอ',status:'handled',unread:false,at:'2026-11-15T08:20:00Z',note:'ตรวจหน้าจอตัวอย่างแล้ว',replies:[]}
      ],
      codes:[{id:'c1',code:'SPACE26',journeyId:'j1',status:'live',uses:4,maxUses:30,expires:'2026-12-01T00:00:00Z'},{id:'c2',code:'LEARN26',journeyId:'j2',status:'live',uses:2,maxUses:null,expires:null},{id:'c3',code:'TRYOUT',journeyId:'j1',status:'disabled',uses:8,maxUses:20,expires:null},{id:'c4',code:'PAST26',journeyId:'j3',status:'expired',uses:2,maxUses:10,expires:'2026-11-01T00:00:00Z'}],
      config:[{key:'alertCooldownSeconds',value:30,type:'number',updated:'2026-11-15T08:00:00Z',description:'ตัวอย่าง key ที่เห็นในคลิป · ชนิดและช่วงค่าจริงรอ Backend'}],
      users:[{id:'u1',username:'demo',role:'admin',active:true,temporary:false,lastSignIn:'2026-11-16T03:30:00Z'},{id:'u2',username:'content.demo',role:'editor',active:true,temporary:true,lastSignIn:null},{id:'u3',username:'support.demo',role:'support',active:true,temporary:false,lastSignIn:'2026-11-15T06:10:00Z'}],
      roles:clone(rolePresets),
      logs:[{id:'l1',at:'2026-11-16T04:30:00Z',kind:'request',action:'GET /dashboard/stats',status:200,duration:42},{id:'l2',at:'2026-11-16T04:28:00Z',kind:'request',action:'GET /dashboard/journeys',status:200,duration:65},{id:'l3',at:'2026-11-16T04:25:00Z',kind:'request',action:'GET /dashboard/players',status:503,duration:1500},{id:'l4',at:'2026-11-16T04:20:00Z',kind:'event',action:'journey.step',status:200,duration:18},{id:'l5',at:'2026-11-16T04:10:00Z',kind:'audit',action:'content.draft.updated',status:200,duration:24}],
      events:submissions.slice(0,8).map((s,i)=>({id:`e${i}`,at:s.at,playerId:s.playerId,action:i%2?'quiz.submitted':'journey.step'}))
    };
  }
  const exports={fixtures,permissions,rolePresets,clone};
  root.SafeSpaceData=exports;
  if(typeof module!=='undefined')module.exports=exports;
})(typeof globalThis!=='undefined'?globalThis:window);
