
(function(){
'use strict';

const {useState,useCallback,createElement:h,Fragment} = React;

function s(str){
  if(!str) return {};
  const r={};
  str.split(';').forEach(rule=>{
    const idx=rule.indexOf(':');
    if(idx<0) return;
    const prop=rule.slice(0,idx).trim();
    const val=rule.slice(idx+1).trim();
    if(!prop||!val) return;
    const camel=prop.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
    r[camel]=val;
  });
  return r;
}

function ic(d,o){
  o=o||{};
  const arr=Array.isArray(d)?d:[d];
  return h('svg',{width:o.s||18,height:o.s||18,viewBox:'0 0 24 24',fill:'none',stroke:o.c||'currentColor',strokeWidth:o.w||2,strokeLinecap:'round',strokeLinejoin:'round'},
    arr.map((item,i)=>{
      if(typeof item==='string') return h('path',{key:i,d:item});
      const {el,...rest}=item; return h(el,{key:i,...rest});
    }));
}
function lockEl(c){
  return h('svg',{width:16,height:16,viewBox:'0 0 24 24',fill:'none',stroke:c||'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
    h('rect',{x:4,y:11,width:16,height:10,rx:2}),h('path',{d:'M8 11V7a4 4 0 0 1 8 0v4'}));
}
function markEl(owned){
  if(owned) return ic('M20 6 9 17l-5-5',{s:13,c:'#357E3C',w:2.6});
  return ic('M5 12h14',{s:13,c:'#C8C8C8',w:2.4});
}

function SortHdr({label,col,sort,setSort,style}){
  const active=sort.col===col;
  const dir=active?sort.dir:0;
  function toggle(){setSort(s=>s.col===col?{col,dir:s.dir*-1}:{col,dir:1});}
  return h('div',{onClick:toggle,style:{display:'inline-flex',alignItems:'center',gap:'4px',cursor:'pointer',userSelect:'none',...style}},
    label,
    h('span',{style:{display:'flex',flexDirection:'column',gap:'1px',marginLeft:'3px',opacity:active?1:0.3}},
      h('svg',{width:8,height:5,viewBox:'0 0 8 5',fill:active&&dir===-1?'#5514B4':'#808080'},h('path',{d:'M4 0L8 5H0Z'})),
      h('svg',{width:8,height:5,viewBox:'0 0 8 5',fill:active&&dir===1?'#5514B4':'#808080'},h('path',{d:'M4 5L0 0H8Z'}))));
}


const ENT=[
  {key:'broadband',label:'Broadband',kind:'product'},
  {key:'digitalVoice',label:'Digital Voice for Business',kind:'product'},
  {key:'strategicBroadband',label:'Strategic Broadband',kind:'product'},
  {key:'ukFabric',label:'UK Fabric (Ethernet)',kind:'product'},
  {key:'hardware',label:'Hardware ordering',kind:'service'},
  {key:'kci',label:'Customer KCIs',kind:'service'},
  {key:'businessZone',label:'Business Zone',kind:'service'},
  {key:'fmsEmpirix',label:'FMS / Empirix',kind:'service'},
  {key:'support',label:'Support tickets',kind:'service'},
  {key:'branding',label:'Custom branding',kind:'service'},
];
const PRODUCT_KEYS=['broadband','digitalVoice','strategicBroadband','ukFabric'];
const TYPE_LABELS={root:'BT Wholesale',reseller:'Reseller',subReseller:'Sub-Reseller',childReseller:'Child Reseller',dealer:'Dealer'};
const TYPE_DESC={
  reseller:'Direct contract with BT Wholesale. Full downstream control.',
  subReseller:'No direct BT contract. Sells your services under your relationship.',
  childReseller:'A reseller with selected restrictions — the broadest downstream role.',
  dealer:'Most restricted. Inherits specific services and your branding only.',
};
const PERMISSION_SETS=[
  {key:'order.view',label:'Order View',group:'Orders',desc:'View orders, track status, and see order history.'},
  {key:'order.create',label:'Order Create',group:'Orders',desc:'Place new product orders on behalf of the organisation.'},
  {key:'order.modify',label:'Order Modify',group:'Orders',desc:'Amend or update existing in-flight orders.'},
  {key:'order.cancel',label:'Order Cancel',group:'Orders',desc:'Cancel orders that have not yet been fulfilled.'},
  {key:'fault.view',label:'Fault View',group:'Faults',desc:'View raised faults and track resolution status.'},
  {key:'fault.raise',label:'Fault Raise',group:'Faults',desc:'Raise new fault tickets against active services.'},
  {key:'fault.escalate',label:'Fault Escalate',group:'Faults',desc:'Escalate unresolved faults to BT support tiers.'},
  {key:'billing.view',label:'Billing View',group:'Billing',desc:'View billing summaries, charges, and account balances.'},
  {key:'billing.download',label:'Invoice Download',group:'Billing',desc:'Download invoices and billing documents.'},
  {key:'billing.query',label:'Billing Query',group:'Billing',desc:'Raise and manage billing disputes through the portal.'},
  {key:'users.invite',label:'User Invite',group:'Users & Orgs',desc:'Invite new users to the organisation by email.'},
  {key:'users.manage',label:'User Manage',group:'Users & Orgs',desc:'Edit, deactivate, or remove existing users.'},
  {key:'users.roles',label:'Role Assign',group:'Users & Orgs',desc:'Assign or change the role of any user in the org.'},
  {key:'orgs.manage',label:'Org Manage',group:'Users & Orgs',desc:'Create and manage downstream organisations.'},
  {key:'reporting.view',label:'Dashboard View',group:'Reporting',desc:'Access operational dashboards and summary metrics.'},
  {key:'reporting.export',label:'Report Export',group:'Reporting',desc:'Export reports and data for external use.'},
  {key:'api.access',label:'API Access',group:'API',desc:'Authenticate and make calls to the Nexus APIs.'},
  {key:'api.keys',label:'API Key Manage',group:'API',desc:'Create, rotate, and revoke API keys for the org.'},
  {key:'support.raise',label:'Support Ticket Raise',group:'Support',desc:'Raise support tickets with BT Wholesale.'},
  {key:'support.view',label:'Support Ticket View',group:'Support',desc:'View open and historical support tickets.'},
];
const PSET_GROUPS=['Orders','Faults','Billing','Users & Orgs','Reporting','API','Support'];
const ROLES=[
  {key:'admin',label:'Administrator',desc:'Full control of the organisation, its users and entitlements.',grants:['Manage organisation settings','Create, edit & remove users','Assign & change roles','Manage product entitlements','Billing, invoices & reporting','Support & API key management'],permSets:['order.view','order.create','order.modify','order.cancel','fault.view','fault.raise','fault.escalate','billing.view','billing.download','billing.query','users.invite','users.manage','users.roles','orgs.manage','reporting.view','reporting.export','api.access','api.keys','support.raise','support.view']},
  {key:'orderManager',label:'Order Manager',desc:'Places and manages product orders and faults.',grants:['View & place product orders','Modify & track orders','Raise & manage faults','Dashboard access'],permSets:['order.view','order.create','order.modify','order.cancel','fault.view','fault.raise','reporting.view','support.view']},
  {key:'billingManager',label:'Billing Manager',desc:'Manages invoices and billing reports.',grants:['View & download invoices','Run billing reports','Reporting & exports','View orders (read-only)'],permSets:['billing.view','billing.download','billing.query','reporting.view','reporting.export','order.view']},
  {key:'support',label:'Support Agent',desc:'Handles faults and support tickets.',grants:['Raise, track & escalate tickets','Full fault management','View orders & products'],permSets:['fault.view','fault.raise','fault.escalate','support.raise','support.view','order.view']},
  {key:'reporting',label:'Reporting Analyst',desc:'Read-only access to dashboards and reports.',grants:['Dashboard access','Export reports','View billing reports'],permSets:['reporting.view','reporting.export','billing.view','order.view','fault.view']},
  {key:'readonly',label:'Read-only User',desc:'Can view but never change anything.',grants:['View orders, products & invoices','View reports','No create, edit or delete'],permSets:['order.view','fault.view','billing.view','reporting.view']},
  {key:'apiDev',label:'API Developer',desc:'Integrates via API and manages keys.',grants:['API & sandbox access','Manage API keys','View products & orders'],permSets:['api.access','api.keys','order.view','reporting.view']},
];
const ROLE_COL_MAP={admin:0,orderManager:1,billingManager:2,support:3,reporting:4,readonly:5,apiDev:6};
const BT_ROLES=[
  {key:'btAdmin',label:'Platform Administrator',desc:'Full control of platform configuration, reseller setup, and network-wide access rules.',users:3},
  {key:'btAccountMgr',label:'Account Manager',desc:'Manages reseller relationships, product entitlements, and downstream organisation setup.',users:6},
  {key:'btBilling',label:'Billing Administrator',desc:'Oversees wholesale invoicing, billing reports, and financial reconciliation across the network.',users:2},
  {key:'btSupport',label:'Network Support',desc:'Handles fault escalations and technical support requests from reseller organisations.',users:5},
  {key:'btAnalyst',label:'Reporting Analyst',desc:'Read-only access to platform-wide performance data, usage reports, and network dashboards.',users:4},
];
const PERSONAS={
  bt:{key:'bt',name:'BT Wholesale Administrator',signedInAs:'BT Wholesale Administrator',org:'BT Wholesale',orgInitials:'BT',crumb:'BT Wholesale · Platform administration',title:'Dashboard',
    person:{name:'Alex Morgan',meta:'BT Wholesale',avatar:'AM',photo:'https://randomuser.me/api/portraits/men/32.jpg'},accent:'#2A1C4A',
    desc:'You set up and govern the reseller network. Everything your resellers and their downstream organisations can do on the platform is based on what you define and grant here.',
    can:['Create and manage reseller organisations','Assign products and entitlements to resellers','Set up reseller administrators','Define platform-wide access rules for the whole network'],
    cannot:["Carry out a reseller's day-to-day order management"]},
  btAccountMgr:{key:'btAccountMgr',name:'BT Account Manager',signedInAs:'BT Account Manager',org:'BT Wholesale',orgInitials:'BT',crumb:'BT Wholesale · Account management',title:'Dashboard',
    person:{name:'Claire Ashton',meta:'BT Wholesale · Account Manager',avatar:'CA'},accent:'#2A1C4A',
    desc:'You manage BT Wholesale\'s relationships with reseller partners. You view their entitlements, support their onboarding, and ensure their accounts are configured correctly — but platform-wide settings are handled by the Platform Administrator.',
    can:['View and manage reseller organisation profiles','Support reseller onboarding and account setup','Review entitlements across the reseller network','Assist resellers with user and role queries'],
    cannot:['Create new reseller organisations','Change platform-wide access rules','Modify BT Wholesale-level entitlement definitions']},
  reseller:{key:'reseller',name:'Reseller Administrator',signedInAs:'Northgate Telecom Administrator',org:'Northgate Telecom',orgInitials:'NT',crumb:'Northgate Telecom · Reseller administration',title:'Dashboard',
    person:{name:'Sarah Whitfield',meta:'Northgate Telecom · Admin',avatar:'SW',photo:'https://randomuser.me/api/portraits/women/44.jpg'},accent:'#5514B4',
    desc:'You run the Northgate Telecom account. You manage your team, invite users, assign their roles, and build out your downstream network of sub-resellers, child resellers and dealers.',
    can:['Create sub-reseller, child reseller & dealer organisations','Invite team members and assign them roles','Control what downstream organisations can access','Set permissions for your downstream network'],
    cannot:["Access products Northgate Telecom hasn't been granted","Change BT platform-level settings"]},
  subReseller:{key:'subReseller',name:'Sub-Reseller Administrator',signedInAs:'Metro Connect Administrator',org:'Metro Connect',orgInitials:'MC',crumb:'Metro Connect · Sub-Reseller administration',title:'Dashboard',
    person:{name:'Marcus Webb',meta:'Metro Connect · Admin',avatar:'MW',photo:'https://randomuser.me/api/portraits/men/41.jpg'},accent:'#5514B4',
    desc:'You run the Metro Connect account under Northgate Telecom. You manage your team, invite users, assign roles, and place orders on behalf of your customers.',
    can:['Invite team members and assign them roles','Place and manage orders','Choose which services to expose to your users','Receive customer KCIs'],
    cannot:['Create child organisations of any type','Manage entitlements or billing','Access Business Zone, hardware ordering, or FMS tools','Raise support tickets with BT']},
  childReseller:{key:'childReseller',name:'Child Reseller Administrator',signedInAs:'Halo Networks Administrator',org:'Halo Networks',orgInitials:'HN',crumb:'Halo Networks · Child Reseller administration',title:'Dashboard',
    person:{name:'Joanna Park',meta:'Halo Networks · Admin',avatar:'JP'},accent:'#5514B4',
    desc:'You run the Halo Networks account under Northgate Telecom. You manage your team, invite users, assign roles, and control what your downstream network can access.',
    can:['Invite team members and assign them roles','Create dealer organisations','Control what downstream organisations can access','Manage entitlements for your organisation'],
    cannot:['Raise support tickets directly to BT','Access Business Zone or FMS tools','Change Northgate Telecom platform settings']},
  user:{key:'user',name:'Standard User',signedInAs:'Northgate Telecom Order Manager',org:'Northgate Telecom',orgInitials:'NT',crumb:'Northgate Telecom · Standard user',title:'Dashboard',
    person:{name:'James Okafor',meta:'Northgate Telecom · Order Manager',avatar:'JO'},accent:'#357E3C',
    desc:'You work within the platform as an end user. Everything you can see and do is determined by the role your administrator has assigned to you.',
    can:['Access the portal and your assigned tools','Place and manage orders where your role allows','View reports and billing information where permitted'],
    cannot:['Create or manage organisations','Invite or manage other users','Change your own role or anyone else\'s']},
};
const PROFILE_HEADERS=['Reseller','Sub-Reseller','Child Reseller','Dealer'];
const PROFILE_ROWS=[
  ['Portal access','y','y','y','y'],
  ['Place & manage orders','y','y','y','p'],
  ['Manage own users','y','p','y','n'],
  ['Create child organisations','y','n','y','n'],
  ['Choose exposed services','y','y','y','p'],
  ['Custom branding','y','y','y','y'],
  ['Receive customer KCIs','y','y','y','n'],
  ['Business Zone access','y','n','y','n'],
  ['Hardware ordering','y','n','y','n'],
  ['FMS / Empirix access','y','n','y','n'],
  ['Raise support tickets','y','n','p','n'],
  ['View BT billing','y','n','p','n'],
  ['Manage entitlements','y','n','p','n'],
];
const ROLE_HEADERS=['Admin','Order Mgr','Billing Mgr','Support','Reporting','Read-only','API Dev'];
const ROLE_ROWS=[
  ['Organisation management','y','n','n','n','n','n','n'],
  ['User administration','y','n','n','n','n','n','n'],
  ['Product management','y','p','p','p','p','p','p'],
  ['Ordering','y','y','p','p','p','p','p'],
  ['Raising faults','y','p','n','y','n','p','n'],
  ['Billing','y','n','y','n','p','p','n'],
  ['Reporting','y','p','y','p','y','p','n'],
  ['Support tickets','y','p','n','y','n','p','n'],
  ['API access','y','n','n','n','n','n','y'],
];
const INIT_ORGS=[
  {id:'btw',name:'BT Wholesale',typeKey:'root',parentId:null,contact:'platform@btwholesale.com',primaryName:'Claire Ashton',primaryEmail:'claire.ashton@btwholesale.com',primaryPhone:'+44 800 345 6789',billingName:'Richard Fenn',billingEmail:'richard.fenn@btwholesale.com',billingPhone:'+44 800 345 6790',address:'81 Newgate Street, London, EC1A 7AJ',website:'www.btwholesale.com',entitlements:['broadband','digitalVoice','strategicBroadband','ukFabric','hardware','kci','businessZone','fmsEmpirix','support','branding']},
  {id:'northgate',name:'Northgate Telecom',typeKey:'reseller',status:'Active',parentId:'btw',contact:'partners@northgate.co.uk',primaryName:'Sarah Whitfield',primaryEmail:'sarah.whitfield@northgate.co.uk',primaryPhone:'+44 1234 567 890',billingName:'Priya Nair',billingEmail:'priya.nair@northgate.co.uk',billingPhone:'+44 1234 567 891',address:'14 Commerce Park, Milton Keynes, MK9 2EA',website:'www.northgatetelecom.co.uk',entitlements:['broadband','digitalVoice','strategicBroadband','hardware','kci','businessZone','fmsEmpirix','support','branding']},
  {id:'beacon',name:'Beacon Wholesale Ltd',typeKey:'reseller',parentId:'btw',contact:'admin@beaconwholesale.co.uk',primaryName:'Tom Elsworth',primaryEmail:'tom.elsworth@beaconwholesale.co.uk',primaryPhone:'+44 208 900 1122',billingName:'Anna Kovacs',billingEmail:'anna.kovacs@beaconwholesale.co.uk',billingPhone:'+44 208 900 1123',address:'6 Beacon House, Bristol, BS1 4RN',website:'www.beaconwholesale.co.uk',entitlements:['broadband','digitalVoice','hardware','kci','support','branding']},
  {id:'metro',name:'Metro Connect',typeKey:'subReseller',status:'Active',parentId:'northgate',contact:'ops@metroconnect.co.uk',primaryName:'Marcus Webb',primaryEmail:'marcus.webb@metroconnect.co.uk',primaryPhone:'+44 161 234 5678',billingName:'Marcus Webb',billingEmail:'billing@metroconnect.co.uk',billingPhone:'+44 161 234 5679',address:'22 Northern Quarter, Manchester, M4 1HQ',website:'www.metroconnect.co.uk',entitlements:['broadband','digitalVoice','kci','branding']},
  {id:'halo',name:'Halo Networks',typeKey:'childReseller',status:'Active',parentId:'northgate',contact:'support@halonetworks.co.uk',primaryName:'Joanna Park',primaryEmail:'joanna.park@halonetworks.co.uk',primaryPhone:'+44 113 456 7890',billingName:'Finance Team',billingEmail:'finance@halonetworks.co.uk',billingPhone:'+44 113 456 7891',address:'Halo House, 5 Innovation Drive, Leeds, LS1 5AE',website:'www.halonetworks.co.uk',entitlements:['broadband','digitalVoice','strategicBroadband','hardware','kci','businessZone','fmsEmpirix','branding']},
  {id:'riverside',name:'Riverside Comms',typeKey:'subReseller',status:'Inactive',parentId:'northgate',contact:'hello@riverside-comms.co.uk',primaryName:'Dan Osei',primaryEmail:'dan.osei@riverside-comms.co.uk',primaryPhone:'+44 117 890 1234',billingName:'Dan Osei',billingEmail:'billing@riverside-comms.co.uk',billingPhone:'+44 117 890 1235',address:'Unit 3, Riverside Business Park, Bath, BA1 1RW',website:'www.riverside-comms.co.uk',entitlements:['broadband','digitalVoice','kci','support','branding']},
  {id:'apex',name:'Apex Telecom',typeKey:'dealer',status:'Inactive',parentId:'northgate',contact:'sales@apextelecom.co.uk',primaryName:'Fatima Al-Rashid',primaryEmail:'fatima.alrashid@apextelecom.co.uk',primaryPhone:'+44 1908 123 456',billingName:'Accounts Dept',billingEmail:'accounts@apextelecom.co.uk',billingPhone:'+44 1908 123 457',address:'12 Apex Way, Northampton, NN1 2BP',website:'www.apextelecom.co.uk',entitlements:['broadband','digitalVoice','kci','branding']},
];
const INIT_USERS=[
  {id:'u1',name:'Sarah Whitfield',email:'sarah.whitfield@northgate.co.uk',roleKey:'admin',orgId:'northgate',status:'Active',roleDate:'Jan 2024',photo:'https://randomuser.me/api/portraits/women/44.jpg',isPrimary:true},
  {id:'u2',name:'James Okafor',email:'james.okafor@northgate.co.uk',roleKey:'orderManager',orgId:'northgate',status:'Active',roleDate:'Mar 2024',photo:'https://randomuser.me/api/portraits/men/75.jpg'},
  {id:'u3',name:'Priya Nair',email:'priya.nair@northgate.co.uk',roleKey:'billingManager',orgId:'northgate',status:'Active',roleDate:'Mar 2024'},
  {id:'u4',name:'Tom Reeves',email:'tom.reeves@metroconnect.co.uk',roleKey:'support',orgId:'metro',status:'Active',roleDate:'Jun 2024',photo:'https://randomuser.me/api/portraits/men/41.jpg'},
  {id:'u5',name:'Lucy Chen',email:'lucy.chen@northgate.co.uk',roleKey:'reporting',orgId:'northgate',status:'Invited',roleDate:'May 2025',photo:'https://randomuser.me/api/portraits/women/63.jpg'},
  {id:'u6',name:'Daniel Frost',email:'daniel.frost@northgate.co.uk',roleKey:'apiDev',orgId:'northgate',status:'Active',roleDate:'Sep 2024'},
  {id:'u7',name:'Aisha Bello',email:'aisha.bello@apextelecom.co.uk',roleKey:'readonly',orgId:'apex',status:'Inactive',roleDate:'Nov 2023',photo:'https://randomuser.me/api/portraits/women/26.jpg'},
  {id:'u8',name:'Robert Haines',email:'robert.haines@beaconwholesale.co.uk',roleKey:'admin',orgId:'beacon',status:'Active',roleDate:'Feb 2024'},
];
const ROLE_CAPS={
  admin:['Billing','Ordering','Raising faults','Support tickets','Platform settings'],
  orderManager:['Ordering','Raising faults'],
  billingManager:['Billing','Ordering (view only)'],
  support:['Raising faults','Support tickets'],
  reporting:['Reporting & exports'],
  readonly:['Read-only access'],
  apiDev:['API access'],
};
const CAP_COLORS={'Billing':['#036C01','#E6F4E5'],'Ordering':['#3F187F','#F3EBFE'],'Raising faults':['#2A2A2A','#FDF0C4'],'Support tickets':['#1A4070','#E8F1FB'],'Platform settings':['#2A1C4A','#EBE6F4'],'Ordering (view only)':['#3F187F','#F3EBFE'],'Reporting & exports':['#4A4A00','#FAFAE0'],'Read-only access':['#505050','#F7F7F7'],'API access':['#1A4A3A','#E6F5F0']};

function initials(n){ return (n||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?'; }
function badgeSt(typeKey){
  const base='font-size:11px;font-weight:700;padding:2px 8px;border-radius:1000px;white-space:nowrap;';
  const m={root:'background:#5514B4;color:#fff',reseller:'background:#F3EBFE;color:#3F187F',childReseller:'background:rgba(46,66,127,0.12);color:#2E427F',subReseller:'background:#F7F7F7;color:#434343;border:1px solid #D9D9D9',dealer:'background:#fff;color:#6B6B6B;border:1px solid #E3E3E3'};
  return base+(m[typeKey]||m.subReseller);
}
function dotSt(typeKey){
  const c={root:'#2A2A2A',reseller:'#5514B4',childReseller:'#2E427F',subReseller:'#AAAAAA',dealer:'#C8C8C8'}[typeKey]||'#AAAAAA';
  return {width:'8px',height:'8px',borderRadius:'999px',flexShrink:0,background:c,display:'inline-block'};
}
function CellMark({v}){
  if(v==='y') return h('span',{style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'24px',height:'24px',borderRadius:'999px',background:'#E6F4E5'}},
    h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'#357E3C',strokeWidth:2.6,strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M20 6 9 17l-5-5'})));
  if(v==='p') return h('span',{style:{display:'inline-block',width:'9px',height:'9px',borderRadius:'999px',background:'#D88C00'}});
  return h('span',{style:{display:'inline-block',width:'14px',height:'2px',borderRadius:'2px',background:'#D9D9D9'}});
}

const AUDIT_LOG=[
  {id:'a1',who:'Sarah Whitfield',whoRole:'Administrator',org:'Northgate Telecom',action:'Changed role',detail:'James Okafor: Order Manager → Billing Manager',category:'User administration',ts:'23 Jul 2026, 09:14',actorType:'reseller'},
  {id:'a2',who:'Alex Morgan',whoRole:'Platform Administrator',org:'BT Wholesale',action:'Granted entitlement',detail:'Metro Connect: Broadband added',category:'Organisation management',ts:'23 Jul 2026, 08:55',actorType:'bt'},
  {id:'a3',who:'Sarah Whitfield',whoRole:'Administrator',org:'Northgate Telecom',action:'Invited user',detail:'Lucy Chen as Reporting Analyst',category:'User administration',ts:'22 Jul 2026, 16:32',actorType:'reseller'},
  {id:'a4',who:'Alex Morgan',whoRole:'Platform Administrator',org:'BT Wholesale',action:'Created organisation',detail:'Metro Connect (Sub-Reseller) under Northgate Telecom',category:'Organisation management',ts:'22 Jul 2026, 14:10',actorType:'bt'},
  {id:'a5',who:'Sarah Whitfield',whoRole:'Administrator',org:'Northgate Telecom',action:'Deactivated user',detail:'Aisha Bello (Read-only User)',category:'User administration',ts:'21 Jul 2026, 11:20',actorType:'reseller'},
  {id:'a6',who:'Marcus Webb',whoRole:'Administrator',org:'Metro Connect',action:'Changed role',detail:'Tom Reeves: Support Agent → Order Manager',category:'User administration',ts:'20 Jul 2026, 10:05',actorType:'reseller'},
  {id:'a7',who:'Alex Morgan',whoRole:'Platform Administrator',org:'BT Wholesale',action:'Updated entitlements',detail:'Northgate Telecom: UK Fabric removed',category:'Organisation management',ts:'18 Jul 2026, 15:45',actorType:'bt'},
  {id:'a8',who:'Sarah Whitfield',whoRole:'Administrator',org:'Northgate Telecom',action:'Created organisation',detail:'Apex Telecom (Dealer) under Northgate Telecom',category:'Organisation management',ts:'15 Jul 2026, 09:30',actorType:'reseller'},
  {id:'a9',who:'Claire Ashton',whoRole:'Account Manager',org:'BT Wholesale',action:'Updated contact',detail:'Northgate Telecom primary contact changed',category:'Organisation management',ts:'14 Jul 2026, 13:22',actorType:'bt'},
  {id:'a10',who:'Sarah Whitfield',whoRole:'Administrator',org:'Northgate Telecom',action:'Removed user',detail:'Former contractor removed from platform',category:'User administration',ts:'12 Jul 2026, 09:00',actorType:'reseller'},
];
const AUDIT_CATEGORIES=['All categories','User administration','Organisation management','Product management','Billing','API access'];

const BT_LOGO = h('svg',{width:40,height:40,viewBox:'0 0 40 40',fill:'none'},
  h('circle',{cx:20,cy:20,r:18,stroke:'#5514B4',strokeWidth:2.5,fill:'none'}),
  h('text',{x:20,y:25,textAnchor:'middle',fill:'#5514B4',fontFamily:"'BT Curve',Arial,sans-serif",fontWeight:700,fontSize:14,letterSpacing:0.5},'BT'));

function NavBtn({id,icon,label,screen,setScreen,collapsed}){
  const active=screen===id;
  return h('button',{onClick:()=>setScreen(id),title:collapsed?label:undefined,
    style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:collapsed?'11px 0':'11px 12px',justifyContent:collapsed?'center':'flex-start',border:0,borderRadius:'11px',cursor:'pointer',fontSize:'14px',fontWeight:700,marginBottom:'3px',background:active?'rgba(255,255,255,0.18)':'transparent',color:'#fff',fontFamily:"inherit"}},
    icon,!collapsed&&h('span',{style:{flex:1,textAlign:'left'}},label));
}

function App(){
  const [persona,setPersonaState]=useState('reseller');
  const [screen,setScreen]=useState('overview');
  const [selOrgId,setSelOrgId]=useState('northgate');
  const [seq,setSeq]=useState(1);
  const [orgs,setOrgs]=useState(INIT_ORGS);
  const [users,setUsers]=useState(INIT_USERS);
  const [orgWiz,setOrgWiz]=useState(null);
  const [userWiz,setUserWiz]=useState(null);
  const [toast,setToast]=useState(null);
  const [selRole,setSelRole]=useState(null);
  const [rolesTab,setRolesTab]=useState('roleDirectory');
  const [selPermSet,setSelPermSet]=useState(null);
  const [userDrawer,setUserDrawer]=useState(null);
  const [auditCat,setAuditCat]=useState('Organisation management');
  const [menuOpen,setMenuOpen]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [bannerOpen,setBannerOpen]=useState(false);
  const [personaCardOpen,setPersonaCardOpen]=useState(false);
  const [overviewTab,setOverviewTab]=useState('network');
  const [usersTab,setUsersTab]=useState('users');
  const [userSearch,setUserSearch]=useState('');
  const [filterRole,setFilterRole]=useState('');
  const [filterOrg,setFilterOrg]=useState('');
  const [filterStatus,setFilterStatus]=useState('');
  const [orgSearch,setOrgSearch]=useState('');
  const [drawerPendingRole,setDrawerPendingRole]=useState(null);
  const [editingContact,setEditingContact]=useState(false);
  const [settingsTab,setSettingsTab]=useState('profile');
  const [avatarMenuOpen,setAvatarMenuOpen]=useState(false);
  const [switchViewOpen,setSwitchViewOpen]=useState(false);
  const [contactDraft,setContactDraft]=useState(null);
  const [orgTypeFilter,setOrgTypeFilter]=useState('');
  const [orgStatusFilter,setOrgStatusFilter]=useState('');
  const [orgSort,setOrgSort]=useState({col:'',dir:1});
  const [userSort,setUserSort]=useState({col:'',dir:1});
  const [deactivateConfirm,setDeactivateConfirm]=useState(null);
  const [removeConfirm,setRemoveConfirm]=useState(null);
  const [btOrgContext,setBtOrgContext]=useState(null);
  const [roleWiz,setRoleWiz]=useState(null);
  const [customRoles,setCustomRoles]=useState([]);
  const [auditFilter,setAuditFilter]=useState('');

  function openUserDrawer(id){setUserDrawer(id);setDrawerPendingRole(null);}
  function closeUserDrawer(){setUserDrawer(null);setDrawerPendingRole(null);}
  const isBt=persona==='bt'||persona==='btAccountMgr';
  const canAdmin=persona!=='user';
  const canCreateOrg=persona==='bt'||persona==='reseller'||persona==='childReseller';
  const home=isBt?'btw':persona==='subReseller'?'metro':persona==='childReseller'?'halo':'northgate';
  const P=PERSONAS[persona];

  const orgById=id=>orgs.find(o=>o.id===id);
  const roleLabel=k=>{const r=ROLES.find(r=>r.key===k);return r?r.label:k;};
  const childrenOf=id=>orgs.filter(o=>o.parentId===id);
  const userCountFor=id=>users.filter(u=>u.orgId===id).length;
  const wizParent=()=>isBt?orgById('btw'):orgById(home);
  const childTypes=()=>isBt?['reseller']:persona==='childReseller'?['dealer']:['subReseller','childReseller','dealer'];
  const typeAllows=(tk,key)=>{
    if(tk==='reseller') return true;
    if(tk==='subReseller') return PRODUCT_KEYS.includes(key)||key==='kci'||key==='branding';
    if(tk==='childReseller') return key!=='support';
    if(tk==='dealer') return PRODUCT_KEYS.includes(key)||key==='branding';
    return true;
  };
  const defEnt=type=>{const p=wizParent(),e={};ENT.forEach(x=>{if(p.entitlements.includes(x.key)&&typeAllows(type,x.key))e[x.key]=true;});return e;};

  function setPsn(p){setPersonaState(p);setOrgWiz(null);setUserWiz(null);setSelOrgId(null);setSelRole(null);setUserDrawer(null);setPersonaCardOpen(false);setOverviewTab('network');setUsersTab('users');}
  function showToast(kind,msg){setToast({kind,msg});}
  function deny(){showToast('error','That action needs an Administrator role.');}

  function flatten(rootId,depth=0,out=[]){
    const o=orgById(rootId);if(!o)return out;
    out.push({org:o,depth});
    childrenOf(rootId).forEach(c=>flatten(c.id,depth+1,out));
    return out;
  }

  const flat=flatten(home,0);
  const visibleUsers=isBt?users:users.filter(u=>{const o=orgById(u.orgId);return o&&(o.id===home||o.parentId===home);});
  const sel=orgById(selOrgId)||orgById(home);
  const selParent=sel.parentId?orgById(sel.parentId):null;
  const statusMap={Active:['#036C01','#E6F4E5','#036C01'],Invited:['#2A2A2A','#FDF0C4','#D97706'],Inactive:['#2A2A2A','#F0F0F0','#9CA3AF']};

  function mkActionBtn(kind){
    const isOrg=kind==='org';
    const label=isOrg?(isBt?'Create reseller':'Create organisation'):'Invite user';
    const hint=isOrg?(isBt?'Set up a new reseller organisation':'Delegate access to a downstream org'):(isBt?'Add a user & assign them a role':'Add a team member & assign a role');
    const onClick=isOrg
      ?()=>{if(!canAdmin)return deny();const t=childTypes()[0];setOrgWiz({step:1,name:'',email:'',type:t,ent:defEnt(t)});}
      :()=>{if(!canAdmin)return deny();setUserWiz({step:1,name:'',email:'',phone:'',orgId:home,profileType:'regular',role:'orderManager'});};
    return {label,hint,onClick,
      rowStyle:{display:'flex',alignItems:'center',gap:'12px',width:'100%',borderRadius:'12px',padding:'13px 14px',marginBottom:'12px',textAlign:'left',border:'1px solid #E3E3E3',background:canAdmin?'#fff':'#F7F7F7',cursor:canAdmin?'pointer':'not-allowed',fontFamily:'inherit'},
      ctaStyle:{display:'inline-flex',alignItems:'center',gap:'8px',border:0,borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',whiteSpace:'nowrap',background:canAdmin?'#5514B4':'#EDEDED',color:canAdmin?'#fff':'#AAAAAA',cursor:canAdmin?'pointer':'not-allowed',fontFamily:'inherit'},
      iconBg:canAdmin?'#F3EBFE':'#EDEDED',iconFg:canAdmin?'#5514B4':'#AAAAAA'};
  }
  const createOrg=mkActionBtn('org');
  const inviteUser=mkActionBtn('user');

  function OrgChip({entKey}){
    const owned=sel.entitlements.includes(entKey);
    const e=ENT.find(x=>x.key===entKey);
    const owned_st={display:'inline-flex',alignItems:'center',gap:'6px',background:'#E6F4E5',border:'1px solid #A3D9A1',color:'#036C01',borderRadius:'32px',padding:'6px 12px',fontSize:'14px',fontWeight:600};
    const off_st={display:'inline-flex',alignItems:'center',gap:'6px',background:'#F7F7F7',border:'1px solid #E3E3E3',color:'#AAAAAA',borderRadius:'32px',padding:'6px 12px',fontSize:'14px',fontWeight:500};
    return h('span',{style:owned?owned_st:off_st},markEl(owned),e.label);
  }

  // pre-compute role detail + drawer data
  const selRoleObj=selRole?ROLES.find(r=>r.key===selRole):null;
  const selRoleUsers=selRole?users.filter(u=>u.roleKey===selRole):[];
  const selRoleColIdx=selRole?(ROLE_COL_MAP[selRole]??-1):-1;
  const drawerUser=userDrawer?users.find(u=>u.id===userDrawer):null;
  const drawerRole=drawerUser?ROLES.find(r=>r.key===drawerUser.roleKey):null;
  const drawerOrg=drawerUser?orgById(drawerUser.orgId):null;

  const navItem=(label,active,onClick)=>h('button',{onClick,style:{height:'100%',padding:'0 16px',border:'none',borderBottom:active?'2px solid #5514B4':'2px solid transparent',background:'transparent',cursor:'pointer',fontSize:'14px',fontWeight:active?600:400,color:active?'#5514B4':'#1A1A1A',fontFamily:'inherit',whiteSpace:'nowrap',transition:'color 150ms'}},label);
  const Breadcrumb=({crumbs})=>h('nav',{style:{display:'flex',alignItems:'center',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}},
    crumbs.map((c,i)=>[
      i>0&&h('span',{key:'sep'+i,style:{color:'#808080',fontSize:'14px',userSelect:'none'}},'›'),
      i<crumbs.length-1
        ?h('button',{key:c.label,onClick:c.onClick,style:{background:'none',border:'none',cursor:'pointer',padding:0,color:'#5514B4',fontSize:'16px',fontWeight:400,fontFamily:'inherit',textDecoration:'underline',textUnderlineOffset:'2px'}},c.label)
        :h('span',{key:c.label,style:{color:'#2A2A2A',fontSize:'16px',fontWeight:400}},c.label)
    ]));
  const viewLabels={bt:'BT Wholesale Admin',btAccountMgr:'BT Account Manager',reseller:'Reseller Admin',subReseller:'Sub-Reseller Admin',childReseller:'Child Reseller Admin',user:'Standard User'};

  return h('div',{style:{display:'flex',flexDirection:'column',height:'100vh',width:'100%',overflow:'hidden',fontFamily:"'BT Curve',system-ui,sans-serif",color:'#2A2A2A',background:'#fff',fontSize:'16px',lineHeight:1.4,WebkitFontSmoothing:'antialiased'}},

    // Top nav
    h('header',{style:{height:'60px',flexShrink:0,background:'#fff',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',padding:'0 28px',gap:0,zIndex:10}},

      // BT logo
      h('div',{style:{display:'flex',alignItems:'center',marginRight:'32px',flexShrink:0}},
        h('span',{style:{display:'flex'}},BT_LOGO)),

      // Nav items
      h('nav',{style:{display:'flex',alignItems:'stretch',height:'100%',flex:1,gap:0}},
        navItem('Dashboard',screen==='overview',()=>setScreen('overview')),
        persona!=='user'&&navItem('Organisations',screen==='orgs'||screen==='orgDetail',()=>setScreen('orgs')),
        (persona==='bt'||persona==='reseller')&&navItem('Billing',screen==='billingSupport',()=>setScreen('billingSupport')),
        persona!=='user'&&navItem('Users',screen==='users',()=>setScreen('users')),
        persona!=='user'&&navItem('Audit log',screen==='users'&&usersTab==='auditLog',()=>{setScreen('users');setUsersTab('auditLog');}),
        navItem('Knowledge Hub',screen==='knowledgeHub',()=>setScreen('knowledgeHub')),
        (persona==='bt'||persona==='reseller')&&navItem('API Portal',screen==='apiPortal',()=>setScreen('apiPortal'))),

      // Right side
      h('div',{style:{display:'flex',alignItems:'center',gap:'12px',flexShrink:0}},

        // Switch view dropdown (click-toggle)
        h('div',{style:{position:'relative'}},
          h('button',{onClick:()=>setSwitchViewOpen(o=>!o),style:{display:'flex',alignItems:'center',gap:'8px',padding:'7px 14px',borderRadius:'8px',border:'1px solid #6B6B6B',background:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:600,color:'#2A2A2A',fontFamily:'inherit',lineHeight:'20px'}},
            viewLabels[persona]||'Switch view',ic('M6 9l6 6 6-6',{s:14,c:'#6B6B6B',w:2.5})),
          switchViewOpen&&h('div',{style:{position:'absolute',top:'44px',right:0,background:'#fff',border:'1px solid #E3E3E3',borderRadius:'12px',boxShadow:'rgba(0,0,0,0.2) 0 0 1px 0,rgba(0,0,0,0.1) 0 24px 32px 0',minWidth:'220px',zIndex:50,padding:'6px'}},
            Object.entries(viewLabels).map(([k,label])=>{
              const active=persona===k;
              return h('button',{key:k,onClick:()=>{setPsn(k);setScreen('overview');setSwitchViewOpen(false);},
                style:{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'8px 12px',border:0,borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:active?700:500,background:active?'#F3EBFE':'transparent',color:active?'#5514B4':'#2A2A2A',fontFamily:'inherit',marginBottom:'1px'}},
                h('span',null,label),
                active&&ic('M20 6L9 17l-5-5',{s:13,c:'#5514B4'}));
            }))),

        // Avatar + dropdown
        h('div',{style:{position:'relative',flexShrink:0},onMouseEnter:()=>setAvatarMenuOpen(true),onMouseLeave:()=>setAvatarMenuOpen(false)},
          h('button',{style:{width:'36px',height:'36px',borderRadius:'999px',border:'none',cursor:'pointer',padding:0,overflow:'hidden',background:'#F3EBFE',color:'#5514B4',fontWeight:700,fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},
            P.person.photo?h('img',{src:P.person.photo,alt:P.person.name,style:{width:'100%',height:'100%',objectFit:'cover',display:'block'}}):P.person.avatar),
          avatarMenuOpen&&h('div',{style:{position:'absolute',top:'46px',right:0,background:'#fff',border:'1px solid #E3E3E3',borderRadius:'12px',boxShadow:'rgba(0,0,0,0.2) 0 0 1px 0,rgba(0,0,0,0.1) 0 24px 32px 0',minWidth:'200px',zIndex:50,padding:'6px'}},
            h('div',{style:{padding:'12px 14px 10px',borderBottom:'1px solid #F0F0F0',marginBottom:'4px'}},
              h('div',{style:{fontWeight:700,fontSize:'14px',color:'#2A2A2A'}},P.person.name),
              h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},P.person.meta),
              h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#E6F4E5',border:'1px solid #A3D9A1',color:'#036C01',borderRadius:'1000px',padding:'3px 10px',fontSize:'12px',fontWeight:700,marginTop:'8px'}},
                h('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'#036C01',flexShrink:0}}),
                'Account active')),
            [{icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',label:'Profile & settings',screen:'accountSettings'},
             {icon:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',label:'Preferences',screen:'accountSettings'},
             {icon:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',label:'Help & support',screen:'helpSupport'},
            ].map(item=>h('button',{key:item.label,onClick:()=>{setAvatarMenuOpen(false);if(item.screen==='accountSettings'){setSettingsTab('profile');}setScreen(item.screen);},style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'8px 12px',border:0,borderRadius:'8px',background:'transparent',cursor:'pointer',fontFamily:'inherit',textAlign:'left',color:'#2A2A2A'}},
              ic(item.icon,{s:15,c:'#555555'}),
              h('span',{style:{fontSize:'14px',fontWeight:500}},item.label))),
            h('div',{style:{borderTop:'1px solid #F0F0F0',marginTop:'4px',padding:'6px 6px 2px'}},
              h('button',{onClick:()=>setAvatarMenuOpen(false),style:{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'8px 12px',border:'1.5px solid #5514B4',borderRadius:'32px',background:'transparent',cursor:'pointer',fontFamily:'inherit',color:'#5514B4',fontWeight:700,fontSize:'14px'}},
                'Log out'))))))

,

    // Main content
    h('main',{style:{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}},

      // Content
      h('div',{style:{flex:1,overflowY:'auto',padding:'30px 32px 48px'}},

          isBt&&(screen==='orgs'||screen==='users')&&h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',background:btOrgContext?'#F3EBFE':'#FAFAFA',border:'1px solid '+(btOrgContext?'#C4A0F0':'#E3E3E3'),borderRadius:'10px',padding:'10px 14px',flexWrap:'wrap'}},
            h('div',{style:{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}},
              ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:14,c:btOrgContext?'#5514B4':'#808080'}),
              h('span',{style:{fontSize:'13px',fontWeight:700,color:btOrgContext?'#5514B4':'#434343'}},btOrgContext?'Acting in context of:':'Organisation context')),
            btOrgContext
              ?h('div',{style:{display:'flex',alignItems:'center',gap:'10px',flex:1}},
                  h('span',{style:{fontSize:'13px',fontWeight:700,color:'#2A2A2A',background:'#fff',border:'1px solid #C4A0F0',borderRadius:'6px',padding:'3px 10px'}},orgById(btOrgContext)?orgById(btOrgContext).name:'—'),
                  h('span',{style:{fontSize:'13px',color:'#808080',flex:1}},'All actions you take here are logged with your identity and this org context.'),
                  h('button',{onClick:()=>setBtOrgContext(null),style:{fontSize:'12px',fontWeight:700,color:'#5514B4',background:'none',border:'1px solid #C4A0F0',borderRadius:'6px',padding:'4px 10px',cursor:'pointer',fontFamily:'inherit',flexShrink:0}},'Clear context'))
              :h('div',{style:{display:'flex',alignItems:'center',gap:'10px',flex:1}},
                  h('span',{style:{fontSize:'13px',color:'#808080',flex:1}},'Select an organisation to act in context of a specific reseller. Leave blank for platform-wide view.'),
                  h('select',{value:btOrgContext||'',onChange:e=>setBtOrgContext(e.target.value||null),style:{padding:'5px 28px 5px 10px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'13px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#2A2A2A',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center',flexShrink:0}},
                    h('option',{value:''},'Select reseller…'),
                    orgs.filter(o=>o.typeKey==='reseller').map(o=>h('option',{key:o.id,value:o.id},o.name))))),

          screen==='orgDetail'&&h(Breadcrumb,{crumbs:[
            {label:isBt?'Reseller organisations':'Organisations',onClick:()=>setScreen('orgs')},
            {label:(orgById(selOrgId)||{name:'Organisation'}).name},
          ]}),
          screen==='accountSettings'&&h(Breadcrumb,{crumbs:[
            {label:'Dashboard',onClick:()=>setScreen('overview')},
            {label:'Profile & settings'},
          ]}),
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}},
            h('div',{style:{fontSize:'28px',fontWeight:400,fontFamily:"'BT Curve Headline','BT Curve',system-ui,sans-serif",letterSpacing:'-0.01em'}},
              screen==='orgDetail'?(orgById(selOrgId)||{name:'Organisation'}).name:
              screen==='orgs'?(isBt?'Reseller organisations':'Organisations'):
              screen==='users'?(usersTab==='users'?'Users':usersTab==='auditLog'?'Audit log':'Roles & permissions'):
              screen==='helpSupport'?'Help & support':
              screen==='knowledgeHub'?'Knowledge Hub':
              screen==='billingSupport'?'Billing Support':
              screen==='apiPortal'?'API Portal':
              screen==='accountSettings'?'Profile & settings':
              screen==='overview'?('Welcome back, '+P.person.name.split(' ')[0]):P.title),
            (screen==='orgs'&&canCreateOrg||screen==='overview'&&persona==='bt')&&h('button',{onClick:createOrg.onClick,style:createOrg.ctaStyle},ic('M12 5v14M5 12h14',{s:16,c:'#fff'}),h('span',null,screen==='overview'?'Create reseller':createOrg.label)),
            screen==='overview'&&persona==='reseller'&&h('button',{onClick:inviteUser.onClick,style:inviteUser.ctaStyle},ic('M12 5v14M5 12h14',{s:16,c:'#fff'}),h('span',null,'Invite user')),
            screen==='users'&&usersTab==='users'&&h('button',{onClick:inviteUser.onClick,style:inviteUser.ctaStyle},canAdmin?ic('M12 5v14M5 12h14',{s:16,c:'#fff'}):lockEl('#AAAAAA'),h('span',null,inviteUser.label)),
            screen==='users'&&usersTab==='auditLog'&&h('div',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#F3EBFE',border:'1px solid #C4A0F0',color:'#5514B4',borderRadius:'999px',padding:'5px 12px',fontSize:'12px',fontWeight:700}},
              ic(['M9 12l2 2 4-4','M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'],{s:13,c:'#5514B4'}),'Immutable — read-only')),
          screen==='knowledgeHub'&&h('div',{style:{display:'flex',justifyContent:'center',paddingTop:'60px'}},
            h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',textAlign:'center',maxWidth:'440px',width:'100%'}},
              h('div',{style:{width:'56px',height:'56px',borderRadius:'20px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:'#5514B4'}},
                ic(['M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20'],{s:26})),
              h('div',{style:{fontWeight:700,fontSize:'20px',color:'#2A2A2A',marginBottom:'12px'}},'Coming soon'),
              h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.6,maxWidth:'340px'}},'The Knowledge Hub is on its way. You\'ll find guides, best practices and platform documentation here.'))),
          screen==='apiPortal'&&h('div',{style:{display:'flex',justifyContent:'center',paddingTop:'60px'}},
            h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',textAlign:'center',maxWidth:'440px',width:'100%'}},
              h('div',{style:{width:'56px',height:'56px',borderRadius:'20px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:'#5514B4'}},
                ic(['M10 20l4-16','M4 9l-3 3 3 3','M20 9l3 3-3 3'],{s:26})),
              h('div',{style:{fontWeight:700,fontSize:'20px',color:'#2A2A2A',marginBottom:'12px'}},'Coming soon'),
              h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.6,maxWidth:'340px'}},'The API Portal is on its way. You\'ll be able to manage API keys, explore documentation and test integrations here.'))),
          screen==='billingSupport'&&h('div',{style:{display:'flex',justifyContent:'center',paddingTop:'60px'}},
            h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',textAlign:'center',maxWidth:'440px',width:'100%'}},
              h('div',{style:{width:'56px',height:'56px',borderRadius:'20px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:'#5514B4'}},
                ic(['M12 2v20','M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],{s:26})),
              h('div',{style:{fontWeight:700,fontSize:'20px',color:'#2A2A2A',marginBottom:'12px'}},'Coming soon'),
              h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.6,maxWidth:'340px'}},'Billing Support is on its way. You\'ll be able to manage invoices, billing queries and financial support here.'))),

          screen==='overview'&&persona==='user'&&(()=>{
            const me=users.find(u=>u.id==='u2')||users[0];
            const myRole=ROLES.find(r=>r.key===me.roleKey)||ROLES[0];
            const myOrg=orgById(me.orgId)||orgById('northgate');
            const myColIdx=ROLE_COL_MAP[me.roleKey]??0;
            const sc=statusMap[me.status]||statusMap.Active;
            return h('div',{style:{maxWidth:'900px'}},
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'32px'}},
                h('div',{style:{background:'#fff',border:'2px solid #5514B4',borderRadius:'32px',padding:'24px'}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}},
                    h('span',{style:{width:'40px',height:'40px',borderRadius:'10px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                      ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:19})),
                    h('div',null,
                      h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'#808080',marginBottom:'2px'}},'Your role'),
                      h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A'}},myRole.label),
                      h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},'Since '+me.roleDate))),
                  h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                    myRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'center',fontSize:'14px',color:'#2A2A2A'}},
                      ic('M20 6 9 17l-5-5',{s:13,c:'#357E3C',w:2.4}),g)))),
                h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'24px'}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}},
                    h('span',{style:{width:'40px',height:'40px',borderRadius:'10px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                      ic('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2',{s:18,c:'#5514B4'})),
                    h('div',null,
                      h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'#808080',marginBottom:'2px'}},'Your organisation'),
                      h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A'}},myOrg.name),
                      h('div',{style:{display:'flex',alignItems:'center',gap:'5px',marginTop:'4px'}},
                        h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'3px 9px',fontSize:'12px',fontWeight:700,color:sc[0],background:sc[1]}},
                          h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),me.status)))),
                  h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Products available to you'),
                  h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                    PRODUCT_KEYS.filter(k=>myOrg.entitlements.includes(k)).map(k=>{
                      const e=ENT.find(x=>x.key===k);
                      return h('span',{key:k,style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#E6F4E5',border:'1px solid #A3D9A1',color:'#036C01',borderRadius:'32px',padding:'5px 12px',fontSize:'12px',fontWeight:600}},
                        ic('M20 6 9 17l-5-5',{s:11,c:'#357E3C',w:2.5}),e.label);
                    })))),
              h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'24px',marginBottom:'20px'}},
                h('div',{style:{fontWeight:700,fontSize:'16px',marginBottom:'16px'}},'Your permission scope'),
                h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}},
                  ROLE_ROWS.map((row,ri)=>{
                    const v=myColIdx>=0?row[myColIdx+1]:'n';
                    const clr={y:['#036C01','#E6F4E5','#A3D9A1'],p:['#2A2A2A','#FDF0C4','#E8D870'],n:['#2A2A2A','#F0F0F0','#D0D0D0']};
                    const [fg,bg,bd]=clr[v]||clr.n;
                    return h('div',{key:ri,style:{border:'1px solid '+bd,borderRadius:'10px',padding:'12px 14px',background:bg}},
                      h('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}},
                        h(CellMark,{v}),
                        h('span',{style:{fontWeight:700,fontSize:'14px',color:'#2A2A2A'}},row[0])),
                      h('div',{style:{fontSize:'12px',color:fg,fontWeight:600}},v==='y'?'Full access':v==='p'?'Partial access':'No access'));
                  }))),
              h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'24px'}},
                h('div',{style:{fontWeight:700,fontSize:'16px',marginBottom:'4px'}},'Your administrator'),
                h('div',{style:{fontSize:'14px',color:'#808080',marginBottom:'16px'}},'Contact this person if you need to change your role or access permissions.'),
                (()=>{
                  const admin=users.find(u=>u.orgId===myOrg.id&&u.roleKey==='admin');
                  if(!admin) return h('div',{style:{color:'#AAAAAA',fontSize:'14px'}},'No administrator found.');
                  const adminOrg=orgById(admin.orgId);
                  return h('div',{style:{display:'flex',gap:'16px',alignItems:'flex-start'}},
                    admin.photo
                      ?h('img',{src:admin.photo,alt:admin.name,style:{width:'52px',height:'52px',borderRadius:'999px',objectFit:'cover',flexShrink:0}})
                      :h('div',{style:{width:'52px',height:'52px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'16px',flexShrink:0}},initials(admin.name)),
                    h('div',{style:{flex:1}},
                      h('div',{style:{fontWeight:700,fontSize:'16px',color:'#2A2A2A',marginBottom:'2px'}},admin.name),
                      h('div',{style:{fontSize:'12px',color:'#808080',marginBottom:'12px'}},'Administrator · '+myOrg.name),
                      h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                        h('div',{style:{display:'flex',alignItems:'center',gap:'12px'}},
                          h('span',{style:{width:'28px',height:'28px',borderRadius:'7px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                            ic('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',{s:13,c:'#5514B4'})),
                          h('a',{href:'mailto:'+admin.email,style:{fontSize:'14px',color:'#5514B4',textDecoration:'none',fontWeight:500}},admin.email)),
                        (admin.phone||(adminOrg&&adminOrg.primaryPhone))&&h('div',{style:{display:'flex',alignItems:'center',gap:'12px'}},
                          h('span',{style:{width:'28px',height:'28px',borderRadius:'7px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                            ic('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6A16 16 0 0 0 12 12.69a16 16 0 0 0 4.07 2.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16.92z',{s:13,c:'#5514B4'})),
                          h('span',{style:{fontSize:'14px',color:'#434343',fontWeight:500}},admin.phone||(adminOrg&&adminOrg.primaryPhone))),
                        adminOrg&&adminOrg.address&&h('div',{style:{display:'flex',alignItems:'flex-start',gap:'12px'}},
                          h('span',{style:{width:'28px',height:'28px',borderRadius:'7px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px'}},
                            ic('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',{s:13,c:'#5514B4'})),
                          h('span',{style:{fontSize:'14px',color:'#434343',fontWeight:500,lineHeight:1.4}},adminOrg.address)))));
                })()));
          })(),

          screen==='overview'&&persona!=='user'&&h('div',{style:{maxWidth:'1120px'}},
            h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'32px',marginBottom:'32px'}},
              [
                {icon:ic(['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18','M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2','M10 6h4M10 10h4'],{s:16,c:'#5514B4'}),value:String(flat.length-1),label:isBt?'Partner orgs.':'Downstream orgs.',sub:isBt?'Resellers, sub-resellers & dealers':'Sub-resellers, child & dealers'},
                {icon:ic([{el:'circle',cx:9,cy:7,r:4},{el:'circle',cx:17,cy:9,r:3},'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M22 21v-2a4 4 0 0 0-3-3.87'],{s:16,c:'#5514B4'}),value:String(visibleUsers.length),label:'Users',sub:isBt?'Across all reseller orgs':'In your network'},
                {icon:ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:16,c:'#5514B4'}),value:String(isBt?ROLES.length+BT_ROLES.length:ROLES.length),label:isBt?'Role types':'Assignable roles',sub:isBt?'Reseller & BT-side roles':'Role-based access'},
                {icon:ic(['M12 2 2 7l10 5 10-5-10-5Z','M2 17l10 5 10-5','M2 12l10 5 10-5'],{s:16,c:'#5514B4'}),value:isBt?String(ENT.length):String((orgById(home)||{entitlements:[]}).entitlements.length),label:'Products',sub:isBt?'Available to resellers':'Enabled for your org'},
              ].map((k,i)=>h('div',{key:i,style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'14px',padding:'14px 16px',display:'flex',gap:'12px',alignItems:'flex-start'}},
                h('span',{style:{width:'34px',height:'34px',borderRadius:'9px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px'}},k.icon),
                h('div',null,
                  h('div',{style:{fontSize:'32px',fontWeight:400,letterSpacing:'-0.03em',lineHeight:1,color:'#5514B4'}},k.value),
                  h('div',{style:{fontSize:'14px',color:'#434343',fontWeight:600,marginTop:'3px'}},k.label),
                  h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},k.sub))))),


            isBt&&(()=>{
              const inactiveOrgs=flat.filter(r=>r.org.status==='Inactive').length;
              const pendingInvites=visibleUsers.filter(u=>u.status==='Invited').length;
              const inactiveUsers=visibleUsers.filter(u=>u.status==='Inactive').length;
              const emptyOrgs=flat.filter(r=>r.org.id!=='btw'&&visibleUsers.filter(u=>u.orgId===r.org.id).length===0).length;
              const items=[
                {label:'Inactive orgs',value:inactiveOrgs,warn:inactiveOrgs>0,icon:'M3 21h18M9 21V8l3-5 3 5v13M9 12h6',onClick:inactiveOrgs>0?()=>{setOrgStatusFilter('Inactive');setOrgTypeFilter('');setOrgSearch('');setScreen('orgs');}:null},
                {label:'Pending invites',value:pendingInvites,warn:pendingInvites>0,icon:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',onClick:pendingInvites>0?()=>{setFilterStatus('Invited');setFilterOrg('');setScreen('users');}:null},
                {label:'Inactive users',value:inactiveUsers,warn:inactiveUsers>0,icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',onClick:inactiveUsers>0?()=>{setFilterStatus('Inactive');setFilterOrg('');setScreen('users');}:null},
                {label:'Orgs with no users',value:emptyOrgs,warn:emptyOrgs>0,icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',onClick:emptyOrgs>0?()=>{setOrgStatusFilter('');setOrgTypeFilter('');setOrgSearch('');setScreen('orgs');}:null},
              ];
              const allClear=items.every(it=>!it.warn);
              const alertCount=items.filter(it=>it.warn).length;
              return h('div',{style:{background:allClear?'#F6FEF6':'#FFFDF0',border:'1px solid '+(allClear?'#C3E6C3':'#EDE0B0'),borderLeft:'4px solid '+(allClear?'#2D7A2D':'#C89600'),borderRadius:'8px',padding:'12px 16px',marginBottom:'32px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}},
                h('div',{style:{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}},
                  h('span',{style:{width:'8px',height:'8px',borderRadius:'50%',background:allClear?'#2D7A2D':'#C89600',flexShrink:0}}),
                  h('span',{style:{fontSize:'14px',fontWeight:700,color:'#2A2A2A'}},'Network alerts')),
                h('div',{style:{width:'1px',height:'16px',background:'#D9D9D9',flexShrink:0}}),
                h('div',{style:{display:'flex',gap:'20px',flex:1,flexWrap:'wrap'}},
                  items.map((it,i)=>
                    h('button',{key:i,onClick:it.onClick||null,style:{display:'flex',alignItems:'center',gap:'6px',background:'none',border:'none',padding:0,cursor:it.onClick?'pointer':'default',fontFamily:'inherit',textDecoration:'none'}},
                      ic(it.icon,{s:13,c:it.warn?'#C89600':'#C8C8C8'}),
                      h('span',{style:{fontSize:'14px',color:it.onClick&&it.warn?'#5514B4':it.warn?'#2A2A2A':'#AAAAAA',fontWeight:it.warn?600:400,textDecoration:it.onClick&&it.warn?'underline':'none',textUnderlineOffset:'2px'}},
                        String(it.value)+' '+it.label)))),
                !allClear&&h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:'#7A5A00',background:'#FEF3C7',border:'1px solid #F0D060',borderRadius:'1000px',padding:'3px 10px',flexShrink:0,whiteSpace:'nowrap'}},
                  h('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'#C89600',flexShrink:0}}),alertCount+' to review'));
            })(),

            persona==='reseller'&&(()=>{
              const pendingInvites=visibleUsers.filter(u=>u.status==='Invited').length;
              const inactiveUsers=visibleUsers.filter(u=>u.status==='Inactive').length;
              const inactiveOrgs=flat.filter(r=>r.org.id!==home&&r.org.status==='Inactive').length;
              const items=[
                {label:'Inactive downstream orgs',value:inactiveOrgs,warn:inactiveOrgs>0},
                {label:'Pending invites',value:pendingInvites,warn:pendingInvites>0},
                {label:'Inactive users',value:inactiveUsers,warn:inactiveUsers>0},
              ];
              const allClear=items.every(it=>!it.warn);
              const hasAlert=!allClear;
              return h('div',{style:{background:allClear?'#F9F5FF':'#F3EBFE',border:'1px solid '+(allClear?'#DDD0F8':'#C4A0F0'),borderLeft:'4px solid '+(allClear?'#7B3FD4':'#5514B4'),borderRadius:'8px',padding:'12px 16px',marginBottom:'32px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}},
                h('div',{style:{display:'flex',alignItems:'center',gap:'6px',flex:'0 0 auto'}},
                  ic(allClear?'M20 6 9 17l-5-5':'M12 9v4M12 17h.01',{s:14,c:allClear?'#7B3FD4':'#5514B4',w:2.5}),
                  h('span',{style:{fontWeight:700,fontSize:'14px',color:'#2A2A2A'}},allClear?'Network healthy':'Network alerts')),
                h('div',{style:{width:'1px',height:'16px',background:'#C4A0F0',flex:'0 0 auto'}}),
                h('div',{style:{display:'flex',gap:'20px',flex:1,flexWrap:'wrap'}},
                  items.map((it,i)=>h('div',{key:i,style:{display:'flex',alignItems:'center',gap:'6px'}},
                    ic(it.warn?'M12 9v4M12 17h.01':'M20 6 9 17l-5-5',{s:12,c:it.warn?'#5514B4':'#9B72D4',w:2.5}),
                    h('span',{style:{fontSize:'14px',fontWeight:it.warn?700:400,color:it.warn?'#5514B4':'#9B72D4'}},String(it.value)),
                    h('span',{style:{fontSize:'14px',color:it.warn?'#2A2A2A':'#9B72D4',fontWeight:it.warn?600:400}},it.label)))));
            })(),

            (persona==='subReseller'||persona==='childReseller')&&(()=>{
              const myOrg=orgById(home);
              const parentOrg=myOrg&&myOrg.parentId?orgById(myOrg.parentId):null;
              const myEnts=myOrg?myOrg.entitlements:[];
              const products=ENT.filter(e=>myEnts.includes(e.key)&&e.kind==='product');
              const services=ENT.filter(e=>myEnts.includes(e.key)&&e.kind==='service');
              return h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'32px'}},
                h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                  h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'16px'}},'Your enabled products & services'),
                  products.length>0&&h('div',{style:{marginBottom:'12px'}},
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',marginBottom:'8px'}},'Products'),
                    h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                      products.map(e=>h('span',{key:e.key,style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#E6F4E5',border:'1px solid #A3D9A1',color:'#036C01',borderRadius:'32px',padding:'5px 12px',fontSize:'12px',fontWeight:600}},
                        ic('M20 6 9 17l-5-5',{s:11,c:'#357E3C',w:2.5}),e.label)))),
                  services.length>0&&h('div',null,
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',marginBottom:'8px'}},'Services'),
                    h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                      services.map(e=>h('span',{key:e.key,style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#F3EBFE',border:'1px solid #C4A0F0',color:'#5514B4',borderRadius:'32px',padding:'5px 12px',fontSize:'12px',fontWeight:600}},
                        ic('M20 6 9 17l-5-5',{s:11,c:'#5514B4',w:2.5}),e.label)))),
                  (products.length===0&&services.length===0)&&h('div',{style:{color:'#AAAAAA',fontSize:'14px'}},'No entitlements configured')),
                h('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}},
                  parentOrg&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                    h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'16px'}},'Your parent organisation'),
                    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}},
                      h('div',{style:{width:'40px',height:'40px',borderRadius:'10px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'16px',flexShrink:0}},
                        (parentOrg.name||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()),
                      h('div',null,
                        h('div',{style:{fontWeight:700,fontSize:'16px',color:'#2A2A2A'}},parentOrg.name),
                        h('span',{style:{display:'inline-flex',alignItems:'center',gap:'4px',background:'#F3EBFE',border:'1px solid #C4A0F0',color:'#5514B4',borderRadius:'1000px',padding:'2px 8px',fontSize:'12px',fontWeight:600,marginTop:'4px'}},TYPE_LABELS[parentOrg.typeKey]||parentOrg.typeKey))),
                    h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#AAAAAA',marginBottom:'8px'}},'Primary contact'),
                    h('div',{style:{fontSize:'14px',fontWeight:600,color:'#2A2A2A',marginBottom:'3px'}},parentOrg.primaryName),
                    h('a',{href:'mailto:'+parentOrg.primaryEmail,style:{fontSize:'12px',color:'#5514B4',textDecoration:'none'}},parentOrg.primaryEmail)),
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                    h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'12px'}},'Quick actions'),
                    h('button',{onClick:inviteUser.onClick,style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'left',marginBottom:'8px'}},
                      h('span',{style:{width:'30px',height:'30px',borderRadius:'8px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M12 5v14M5 12h14',{s:14,c:'#5514B4'})),
                      h('div',null,
                        h('div',{style:{fontSize:'14px',fontWeight:700,color:'#2A2A2A'}},persona==='childReseller'?'Invite a team member':'Invite a team member'),
                        h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'1px'}},'Add a user and assign a role'))),
                    persona==='childReseller'&&h('button',{onClick:createOrg.onClick,style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}},
                      h('span',{style:{width:'30px',height:'30px',borderRadius:'8px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2',{s:14,c:'#5514B4'})),
                      h('div',null,
                        h('div',{style:{fontSize:'14px',fontWeight:700,color:'#2A2A2A'}},'Create a dealer org'),
                        h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'1px'}},'Set up a downstream dealer organisation'))))));
            })(),

            overviewTab==='network'&&isBt&&(()=>{
              // --- derived data for analytics panels ---
              const resellerOrgs=orgs.filter(o=>o.typeKey==='reseller');
              const downstreamOrgs=orgs.filter(o=>o.typeKey!=='root');
              const typeBreakdown=Object.entries(
                downstreamOrgs.reduce((acc,o)=>{acc[o.typeKey]=(acc[o.typeKey]||0)+1;return acc;},{})
              ).map(([k,count])=>({key:k,label:TYPE_LABELS[k]||k,count,color:{reseller:'#5514B4',subReseller:'#7A3DD6',childReseller:'#9B6FE8',dealer:'#C4A0F0'}[k]||'#C4A0F0'}));
              const totalDown=downstreamOrgs.length||1;

              const productAdoption=ENT.filter(e=>e.kind==='product').map(e=>{
                const adoptedBy=resellerOrgs.filter(o=>o.entitlements&&o.entitlements.includes(e.key)).length;
                return {label:e.label,key:e.key,count:adoptedBy,total:resellerOrgs.length,pct:resellerOrgs.length?Math.round(adoptedBy/resellerOrgs.length*100):0};
              });

              const statusCounts={Active:0,Invited:0,Inactive:0};
              users.forEach(u=>{if(statusCounts[u.status]!==undefined)statusCounts[u.status]++;});
              const totalUsers=users.length||1;
              const statusItems=[
                {label:'Active',count:statusCounts.Active,color:'#036C01',bg:'#E6F4E5',pct:Math.round(statusCounts.Active/totalUsers*100)},
                {label:'Invited',count:statusCounts.Invited,color:'#2A2A2A',bg:'#FDF0C4',pct:Math.round(statusCounts.Invited/totalUsers*100)},
                {label:'Inactive',count:statusCounts.Inactive,color:'#2A2A2A',bg:'#F0F0F0',pct:Math.round(statusCounts.Inactive/totalUsers*100)},
              ];

              const topResellers=resellerOrgs.map(o=>({
                org:o,
                userCount:userCountFor(o.id)+childrenOf(o.id).reduce((s,c)=>s+userCountFor(c.id),0),
                subOrgCount:childrenOf(o.id).length,
              })).sort((a,b)=>b.userCount-a.userCount);

              return h('div',{style:{marginBottom:'32px'}},
                // Row 1: three panels
                h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'32px',marginBottom:'32px'}},

                  // Network composition — donut chart
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                    h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'16px'}},'Network composition'),
                    h('div',{style:{display:'flex',alignItems:'center',gap:'16px'}},
                      (()=>{
                        const r=38,cx=50,cy=50,C=2*Math.PI*r;
                        let a=-90;
                        return h('svg',{width:100,height:100,viewBox:'0 0 100 100',style:{flexShrink:0}},
                          h('circle',{cx,cy,r,fill:'none',stroke:'#F0F0F0',strokeWidth:11}),
                          totalDown>0&&typeBreakdown.map(t=>{
                            const pct=t.count/totalDown;
                            const arc=typeBreakdown.length>1?Math.max(0,C*pct-2):C;
                            const start=a;
                            a+=pct*360;
                            return h('circle',{key:t.key,cx,cy,r,fill:'none',stroke:t.color,strokeWidth:11,
                              strokeDasharray:arc+' '+(C-arc),
                              transform:'rotate('+start+' '+cx+' '+cy+')'});
                          }),
                          h('text',{x:cx,y:cy-4,textAnchor:'middle',style:{fontSize:'16px',fontWeight:700,fill:'#2A2A2A'}},String(totalDown)),
                          h('text',{x:cx,y:cy+13,textAnchor:'middle',style:{fontSize:'12px',fill:'#AAAAAA',fontWeight:600,letterSpacing:'0.06em'}},'ORGS'));
                      })(),
                      h('div',{style:{display:'flex',flexDirection:'column',gap:'8px',flex:1}},
                        typeBreakdown.map(t=>
                          h('div',{key:t.key,style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px'}},
                            h('div',{style:{display:'flex',alignItems:'center',gap:'8px',minWidth:0}},
                              h('span',{style:{width:'8px',height:'8px',borderRadius:'999px',background:t.color,flexShrink:0}}),
                              h('span',{style:{fontSize:'12px',color:'#434343',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},t.label)),
                            h('span',{style:{fontSize:'12px',fontWeight:700,color:'#2A2A2A',flexShrink:0}},t.count)))))),

                  // Product adoption — bar chart
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                    h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'3px'}},'Product adoption'),
                    h('div',{style:{fontSize:'12px',color:'#AAAAAA',marginBottom:'16px'}},'Across '+resellerOrgs.length+' reseller'+(resellerOrgs.length===1?'':'s')),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}},
                      productAdoption.map(p=>
                        h('div',{key:p.key},
                          h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'5px'}},
                            h('span',{style:{fontSize:'12px',color:'#434343',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'68%'}},p.label),
                            h('span',{style:{fontSize:'12px',fontWeight:700,color:p.pct===100?'#036C01':p.pct>=50?'#5514B4':'#AAAAAA',flexShrink:0}},p.count+' / '+p.total)),
                          h('div',{style:{height:'7px',borderRadius:'999px',background:'#F0F0F0',overflow:'hidden'}},
                            h('div',{style:{height:'100%',borderRadius:'999px',background:p.pct===100?'#036C01':p.pct>=50?'#5514B4':'#C4A0F0',width:(p.pct||0)+'%'}})))))),

                  // User health — donut chart
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                    h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'16px'}},'User health'),
                    h('div',{style:{display:'flex',alignItems:'center',gap:'16px'}},
                      (()=>{
                        const r=38,cx=50,cy=50,C=2*Math.PI*r;
                        let a=-90;
                        const total=users.length||1;
                        const active=statusItems.filter(s=>s.count>0);
                        return h('svg',{width:100,height:100,viewBox:'0 0 100 100',style:{flexShrink:0}},
                          h('circle',{cx,cy,r,fill:'none',stroke:'#F0F0F0',strokeWidth:11}),
                          active.map(s=>{
                            const pct=s.count/total;
                            const arc=active.length>1?Math.max(0,C*pct-2):C;
                            const start=a;
                            a+=pct*360;
                            return h('circle',{key:s.label,cx,cy,r,fill:'none',stroke:s.color,strokeWidth:11,
                              strokeDasharray:arc+' '+(C-arc),
                              transform:'rotate('+start+' '+cx+' '+cy+')'});
                          }),
                          h('text',{x:cx,y:cy-4,textAnchor:'middle',style:{fontSize:'16px',fontWeight:700,fill:'#2A2A2A'}},String(users.length)),
                          h('text',{x:cx,y:cy+13,textAnchor:'middle',style:{fontSize:'12px',fill:'#AAAAAA',fontWeight:600,letterSpacing:'0.06em'}},'USERS'));
                      })(),
                      h('div',{style:{display:'flex',flexDirection:'column',gap:'8px',flex:1}},
                        statusItems.map(s=>
                          h('div',{key:s.label,style:{display:'flex',alignItems:'center',gap:'8px'}},
                            h('span',{style:{width:'8px',height:'8px',borderRadius:'999px',background:s.color,flexShrink:0}}),
                            h('span',{style:{fontSize:'12px',color:'#434343',flex:1}},s.label),
                            h('span',{style:{fontSize:'12px',fontWeight:700,color:'#2A2A2A'}},s.count),
                            h('span',{style:{fontSize:'12px',color:'#AAAAAA',minWidth:'26px',textAlign:'right'}},s.pct+'%'))))))),

                // Row 2: reseller snapshot + two coming-soon panels
                h('div',{style:{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr',gap:'32px'}},

                  // Top resellers
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px'}},
                    h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A',marginBottom:'16px'}},'Reseller snapshot'),
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 52px 52px',gap:'0',marginBottom:'8px'}},
                      h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',paddingBottom:'6px'}},'Reseller'),
                      h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',paddingBottom:'6px',textAlign:'right'}},'Users'),
                      h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',paddingBottom:'6px',textAlign:'right'}},'Sub-orgs')),
                    h('div',null,
                      topResellers.map(({org:o,userCount,subOrgCount},i)=>
                        h('div',{key:o.id,style:{display:'grid',gridTemplateColumns:'1fr 52px 52px',alignItems:'center',padding:'8px 0',borderTop:'1px solid #F0F0F0'}},
                          h('div',{style:{display:'flex',alignItems:'center',gap:'8px',minWidth:0}},
                            h('div',{style:{width:'28px',height:'28px',borderRadius:'8px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'12px',flexShrink:0}},
                              (o.name||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()),
                            h('div',{style:{fontWeight:600,fontSize:'14px',color:'#2A2A2A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},o.name)),
                          h('div',{style:{fontWeight:700,fontSize:'14px',color:'#5514B4',textAlign:'right'}},userCount),
                          h('div',{style:{fontSize:'14px',color:'#434343',textAlign:'right'}},subOrgCount))))),

                  // Billing overview — coming soon
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px',display:'flex',flexDirection:'column'}},
                    h('div',{style:{marginBottom:'16px'}},
                      h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A'}},'Billing overview'),
                      h('div',{style:{fontSize:'12px',color:'#C0C0C0',marginTop:'3px'}},'Coming soon')),
                    h('div',{style:{flex:1,display:'flex',flexDirection:'column',gap:'0'}},
                      [{label:'Resellers with billing set up',value:String(resellerOrgs.filter(o=>o.billingEmail).length)+' of '+resellerOrgs.length},
                       {label:'Invoicing contacts configured',value:String(resellerOrgs.filter(o=>o.billingName).length)+' of '+resellerOrgs.length},
                       {label:'Billing queries open',value:'—'},
                      ].map((row,i)=>
                        h('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<2?'1px solid #F0F0F0':'none'}},
                          h('span',{style:{fontSize:'12px',color:'#808080',flex:1,paddingRight:'12px'}},row.label),
                          h('span',{style:{fontSize:'14px',fontWeight:700,color:'#2A2A2A',flexShrink:0}},row.value))))),

                  // Knowledge Hub — coming soon
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px 24px',display:'flex',flexDirection:'column'}},
                    h('div',{style:{marginBottom:'16px'}},
                      h('div',{style:{fontSize:'16px',fontWeight:700,color:'#2A2A2A'}},'Knowledge Hub'),
                      h('div',{style:{fontSize:'12px',color:'#C0C0C0',marginTop:'3px'}},'Coming soon')),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                      [
                        {title:'Getting started with Nexus RBAC',tag:'Guide'},
                        {title:'Setting up your first reseller org',tag:'Tutorial'},
                        {title:'Entitlement inheritance explained',tag:'Reference'},
                      ].map((a,i)=>
                        h('div',{key:i,style:{display:'flex',alignItems:'flex-start',gap:'12px',padding:'8px 0',borderBottom:i<2?'1px solid #F0F0F0':'none',opacity:0.6}},
                          h('span',{style:{width:'28px',height:'28px',borderRadius:'7px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px'}},
                            ic('M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',{s:13,c:'#5514B4'})),
                          h('div',null,
                            h('div',{style:{fontSize:'12px',fontWeight:600,color:'#2A2A2A',lineHeight:1.3,marginBottom:'3px'}},a.title),
                            h('span',{style:{fontSize:'12px',fontWeight:500,color:'#434343'}},a.tag))))))))
            ;})(),

            overviewTab==='network'&&persona!=='subReseller'&&persona!=='childReseller'&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden'}},
              h('div',{style:{padding:'20px 24px',borderBottom:'1px solid #E3E3E3'}},
                h('div',{style:{fontWeight:700,fontSize:'16px'}},'Your organisation network')),
              h('div',{style:{display:'flex',gap:'12px',padding:'12px 22px',borderBottom:'1px solid #E3E3E3',alignItems:'center'}},
                h('div',{style:{position:'relative',flex:1}},
                  h('span',{style:{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',color:'#AAAAAA'}},ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:15})),
                  h('input',{value:orgSearch,onChange:e=>{setOrgSearch(e.target.value);},placeholder:'Search organisations…',style:{width:'100%',padding:'8px 14px 8px 36px',border:'1px solid #6B6B6B',borderRadius:'12px',fontSize:'14px',fontFamily:'inherit',outline:'none'}})),
                h('select',{value:orgTypeFilter,onChange:e=>setOrgTypeFilter(e.target.value),style:{padding:'8px 32px 8px 14px',border:'1px solid #6B6B6B',borderRadius:'12px',fontSize:'14px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#2A2A2A',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}},
                  h('option',{value:''},'All types'),
                  Object.entries(TYPE_LABELS).map(([k,v])=>h('option',{key:k,value:k},v))),
                (orgSearch||orgTypeFilter||orgStatusFilter)&&h('button',{onClick:()=>{setOrgSearch('');setOrgTypeFilter('');setOrgStatusFilter('');},style:{padding:'8px 14px',border:'1px solid #E3E3E3',borderRadius:'12px',fontSize:'14px',fontWeight:500,background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#808080',whiteSpace:'nowrap'}},'Clear')),
              h('div',{style:{display:'grid',gridTemplateColumns:'2.4fr 1.2fr 1.8fr 0.6fr 0.8fr 0.7fr',padding:'11px 22px',background:'#fff',borderBottom:'1px solid #E3E3E3',fontSize:'12px',fontWeight:400,color:'#434343'}},
                h('div',null,'Organisation'),
                h(SortHdr,{label:'Type',col:'type',sort:orgSort,setSort:setOrgSort}),
                h(SortHdr,{label:'Primary contact',col:'contact',sort:orgSort,setSort:setOrgSort}),
                h(SortHdr,{label:'Users',col:'users',sort:orgSort,setSort:setOrgSort}),
                h(SortHdr,{label:'Sub-orgs',col:'suborgs',sort:orgSort,setSort:setOrgSort}),
                h('div',null,'')),
              (()=>{
                const q=orgSearch.toLowerCase();
                let filteredFlat=flat.filter(row=>{
                  if(q&&!row.org.name.toLowerCase().includes(q)&&!row.org.contact.toLowerCase().includes(q)) return false;
                  if(orgTypeFilter&&row.org.typeKey!==orgTypeFilter) return false;
                  return true;
                });
                if(orgSort.col){
                  filteredFlat=[...filteredFlat].sort((a,b)=>{
                    const o1=a.org,o2=b.org;
                    let v1,v2;
                    if(orgSort.col==='type'){v1=TYPE_LABELS[o1.typeKey]||'';v2=TYPE_LABELS[o2.typeKey]||'';}
                    else if(orgSort.col==='contact'){v1=o1.contact||'';v2=o2.contact||'';}
                    else if(orgSort.col==='users'){v1=userCountFor(o1.id);v2=userCountFor(o2.id);return orgSort.dir*(v1-v2);}
                    else if(orgSort.col==='suborgs'){v1=childrenOf(o1.id).length;v2=childrenOf(o2.id).length;return orgSort.dir*(v1-v2);}
                    else{v1='';v2='';}
                    return orgSort.dir*v1.localeCompare(v2);
                  });
                }
                if(filteredFlat.length===0) return h('div',{style:{padding:'40px 22px',textAlign:'center',color:'#808080',fontSize:'14px'}},
                  ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:32,c:'#D0D0D0'}),
                  h('div',{style:{marginTop:'12px',fontWeight:700,color:'#434343'}},'No organisations match'),
                  h('div',{style:{fontSize:'14px',marginTop:'4px'}},'Try adjusting your filters'));
                return filteredFlat.map((row,i)=>{
                  const o=row.org;
                  const isSelected=o.id===selOrgId;
                  return h('div',{key:o.id,onClick:()=>setSelOrgId(isSelected?null:o.id),
                    style:{display:'grid',gridTemplateColumns:'2.4fr 1.2fr 1.8fr 0.6fr 0.8fr 0.7fr',padding:'12px 22px',borderBottom:'1px solid #F0F0F0',alignItems:'center',cursor:'pointer',background:isSelected?'#FAF6FF':'transparent'},
                    onMouseEnter:e=>{if(!isSelected)e.currentTarget.style.background='#FAF6FF';},
                    onMouseLeave:e=>{if(!isSelected)e.currentTarget.style.background='transparent';}},
                    h('div',{style:{display:'flex',alignItems:'center',gap:'6px',minWidth:0}},
                      h('div',{style:{width:(row.depth*20)+'px',flexShrink:0}}),
                      row.depth>0&&h('span',{style:{color:'#D0D0D0',fontSize:'14px',fontFamily:'monospace',flexShrink:0}},'└'),
                      h('span',{style:{...dotSt(o.typeKey),flexShrink:0,marginLeft:row.depth>0?'4px':'0'}}),
                      h('div',{style:{minWidth:0,marginLeft:'8px'}},
                        h('div',{style:{fontWeight:row.depth===0?700:600,fontSize:'14px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isSelected?'#5514B4':'#2A2A2A'}},o.name))),
                    h('div',{style:{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}},
                      h('span',{style:s(badgeSt(o.typeKey))},TYPE_LABELS[o.typeKey]),
                      o.id===home&&h('span',{style:{fontSize:'12px',fontWeight:700,color:'#5514B4',background:'#F3EBFE',padding:'2px 7px',borderRadius:'1000px'}},'You')),
                    h('div',{style:{fontSize:'14px',color:'#434343',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},o.primaryName||o.contact),
                    h('div',{style:{fontSize:'14px',fontWeight:700,color:'#5514B4'}},String(userCountFor(o.id))),
                    h('div',{style:{fontSize:'14px',color:'#434343'}},String(childrenOf(o.id).length)),
                    h('div',{style:{display:'flex',justifyContent:'flex-end'}},
                      h('span',{onClick:e=>{e.stopPropagation();setSelOrgId(o.id);setScreen('orgs');},style:{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:400,color:'#5514B4',cursor:'pointer',textDecoration:'underline',textUnderlineOffset:'2px'}},
                        'View',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))));
                });
              })(),
),


            overviewTab==='invite'&&userWiz&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden',maxWidth:'760px'}},
              h('div',{style:{padding:'24px 28px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                h('div',null,
                  h('div',{style:{fontSize:'20px',fontWeight:700}},'Invite a user'),
                  h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'2px'}},'Step '+userWiz.step+' of 3 · '+['Details','Access','Review'][userWiz.step-1])),
                h('button',{onClick:()=>{setUserWiz(null);setOverviewTab('network');},style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
              h('div',{style:{height:'4px',background:'#F0F0F0'}},h('div',{style:{height:'100%',background:'#5514B4',width:Math.round(userWiz.step/3*100)+'%',transition:'width 240ms ease'}})),
              h('div',{style:{padding:'24px'}},
                userWiz.step===1&&h('div',null,
                  h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Full name'),
                  h('input',{value:userWiz.name,onChange:e=>setUserWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Morgan Hale',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit',boxSizing:'border-box'}}),
                  h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Email address'),
                  h('input',{value:userWiz.email,onChange:e=>setUserWiz(w=>({...w,email:e.target.value})),placeholder:'morgan.hale@northgate.co.uk',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit',boxSizing:'border-box'}}),
                  h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},h('span',null,'Phone number '),h('span',{style:{fontWeight:400,color:'#808080'}},'(optional)')),
                  h('input',{value:userWiz.phone,onChange:e=>setUserWiz(w=>({...w,phone:e.target.value})),placeholder:'+44 7700 900000',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit',boxSizing:'border-box'}}),
                  h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Organisation'),
                  h('select',{value:userWiz.orgId,onChange:e=>setUserWiz(w=>({...w,orgId:e.target.value})),style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',background:'#fff',cursor:'pointer',fontFamily:'inherit'}},
                    [orgById(home),...childrenOf(home)].map(o=>h('option',{key:o.id,value:o.id},o.name+' · '+TYPE_LABELS[o.typeKey])))),
                userWiz.step===2&&h('div',null,
                  h('div',{style:{marginBottom:'20px'}},
                    h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Profile type'),
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
                      [['admin','Administrator','Full access to all platform features'],['regular','Regular user','Assign specific permissions and tools']].map(([pt,lbl,desc])=>
                        h('button',{key:pt,onClick:()=>setUserWiz(w=>({...w,profileType:pt,role:pt==='admin'?'admin':w.role==='admin'?'orderManager':w.role})),style:{padding:'13px',borderRadius:'10px',border:'1px solid '+(userWiz.profileType===pt?'#5514B4':'#E3E3E3'),background:userWiz.profileType===pt?'#FAF6FF':'#fff',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}},
                          h('span',{style:{display:'block',fontWeight:700,fontSize:'14px',color:userWiz.profileType===pt?'#5514B4':'#1A1A1A'}},lbl),
                          h('span',{style:{display:'block',fontSize:'12px',color:'#808080',marginTop:'3px',lineHeight:1.35}},desc))))),
                  h('div',{style:{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:'32px'}},
                    h('div',null,
                      h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},userWiz.profileType==='admin'?'Role':'Assign a role'),
                      userWiz.profileType==='admin'
                        ?h('div',{style:{padding:'12px 13px',borderRadius:'11px',border:'1px solid #5514B4',background:'#FAF6FF'}},
                            h('span',{style:{display:'block',fontWeight:700,fontSize:'14px',color:'#5514B4'}},'Administrator'),
                            h('span',{style:{display:'block',fontSize:'12px',color:'#808080',lineHeight:1.35,marginTop:'4px'}},'Manages users, billing, orders and all platform settings'))
                        :h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                            (()=>{
                              const targetOrg=orgById(userWiz.orgId);
                              const isSubRes=targetOrg&&targetOrg.typeKey==='subReseller';
                              const billingBlockedRoles=['billingManager'];
                              return ROLES.filter(r=>r.key!=='admin').map(r=>{
                                const active=userWiz.role===r.key;
                                const blocked=isSubRes&&billingBlockedRoles.includes(r.key);
                                return h('button',{key:r.key,onClick:()=>!blocked&&setUserWiz(w=>({...w,role:r.key})),style:{display:'flex',alignItems:'flex-start',gap:'12px',width:'100%',padding:'12px 13px',borderRadius:'11px',cursor:blocked?'not-allowed':'pointer',border:'1px solid '+(active?'#5514B4':blocked?'#F0E0E0':'#E3E3E3'),background:active?'#FAF6FF':blocked?'#FFF5F5':'#fff',fontFamily:'inherit',opacity:blocked?0.7:1}},
                                  h('span',{style:{width:'19px',height:'19px',borderRadius:'999px',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',background:active?'#5514B4':'#fff',border:'1px solid '+(active?'#5514B4':'#C8C8C8')}},active&&h('span',{style:{width:'10px',height:'10px',borderRadius:'999px',background:'#fff'}})),
                                  h('span',{style:{textAlign:'left',flex:1}},h('span',{style:{display:'block',fontWeight:700,fontSize:'14px',color:blocked?'#808080':'inherit'}},r.label),h('span',{style:{display:'block',fontSize:'12px',color:'#808080',lineHeight:1.35}},blocked?'Not available — Sub-Reseller orgs are blocked from billing access (PRD §17.2)':r.desc)),
                                  blocked&&lockEl('#C8C8C8'));
                              });
                            })())),
                    h('div',null,
                      h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Permissions granted'),
                      h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'16px'}},
                        h('div',{style:{fontWeight:700,fontSize:'14px',marginBottom:'12px'}},(ROLES.find(r=>r.key===(userWiz.profileType==='admin'?'admin':userWiz.role))||ROLES[0]).label),
                        (ROLES.find(r=>r.key===(userWiz.profileType==='admin'?'admin':userWiz.role))||ROLES[0]).grants.map((pm,i)=>
                          h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'flex-start',fontSize:'12px',marginBottom:'8px'}},
                            ic('M20 6 9 17l-5-5',{s:14,c:'#5514B4',w:2.4}),h('span',null,pm))))))),
                userWiz.step===3&&h('div',null,
                  h('div',{style:{display:'flex',alignItems:'center',gap:'16px',marginBottom:'20px'}},
                    h('div',{style:{width:'52px',height:'52px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'20px',flexShrink:0}},initials(userWiz.name||'?')),
                    h('div',null,h('div',{style:{fontWeight:700,fontSize:'16px'}},userWiz.name||'(unnamed)'),h('div',{style:{fontSize:'14px',color:'#808080'}},userWiz.email))),
                  h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'12px'}},
                    [['Profile type',userWiz.profileType==='admin'?'Administrator':'Regular user'],['Role',(ROLES.find(r=>r.key===(userWiz.profileType==='admin'?'admin':userWiz.role))||ROLES[0]).label],['Organisation',(orgById(userWiz.orgId)||{name:'—'}).name],...(userWiz.phone?[['Phone',userWiz.phone]]:[])].map(([k,v],i)=>
                      h('div',{key:k,style:{display:'flex',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #F0F0F0'}},
                        h('span',{style:{color:'#808080',fontSize:'14px'}},k),h('span',{style:{fontWeight:700,fontSize:'14px'}},v))),
                    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px'}},
                      h('span',{style:{color:'#808080',fontSize:'14px'}},'Status on creation'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#FDF0C4',color:'#2A2A2A',borderRadius:'1000px',padding:'4px 11px',fontSize:'12px',fontWeight:700}},h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),'Invited'))),
                  h('div',{style:{fontSize:'12px',color:'#808080',lineHeight:1.5}},'An invitation email will be sent. The user gains access once they accept and set a password.'))),
              h('div',{style:{padding:'20px 28px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center'}},
                h('button',{onClick:()=>{if(userWiz.step===1){setUserWiz(null);setOverviewTab('network');}else setUserWiz(w=>({...w,step:w.step-1}));},style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},userWiz.step===1?'Cancel':'Back'),
                h('button',{onClick:()=>{
                  if(userWiz.step<3){setUserWiz(w=>({...w,step:w.step+1}));return;}
                  const o=orgById(userWiz.orgId);const id='nu'+seq;
                  const rk=userWiz.profileType==='admin'?'admin':userWiz.role;
                  const user={id,name:userWiz.name.trim()||'New user',email:userWiz.email.trim()||'—',phone:userWiz.phone.trim()||'',roleKey:rk,orgId:userWiz.orgId,status:'Invited'};
                  setUsers(us=>[...us,user]);setSeq(n=>n+1);setUserWiz(null);setOverviewTab('network');
                  showToast('success','Invitation sent to '+user.name+' as '+roleLabel(rk)+' at '+(o?o.name:'Northgate Telecom')+'.');
                },style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 24px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},userWiz.step===3?'Send invitation':'Continue')))),

          screen==='orgs'&&(()=>{
            const dSel=selOrgId?orgById(selOrgId):null;
            const dParent=dSel&&dSel.parentId?orgById(dSel.parentId):null;
            const q=(orgSearch||'').toLowerCase();
            const visFlat=q||orgTypeFilter||orgStatusFilter
              ?flat.filter(row=>{
                  const o=row.org;
                  if(orgTypeFilter&&o.typeKey!==orgTypeFilter) return false;
                  if(orgStatusFilter&&o.status!==orgStatusFilter) return false;
                  if(q&&!o.name.toLowerCase().includes(q)) return false;
                  return true;
                })
              :flat;
            function EntRow({entKey}){
              const e=ENT.find(x=>x.key===entKey);
              const owned=dSel.entitlements.includes(entKey);
              const parentHas=dParent?dParent.entitlements.includes(entKey):true;
              return h('tr',null,
                h('td',{style:{padding:'12px 14px',borderBottom:'1px solid #F0F0F0',background:'#fff'}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
                    parentHas&&owned
                      ?ic('M20 6 9 17l-5-5',{s:14,c:'#036C01',w:2.4})
                      :parentHas&&!owned
                        ?h('span',{style:{width:14,height:14,display:'flex',alignItems:'center',justifyContent:'center'}},ic('M5 12h14',{s:14,c:'#D97706',w:2}))
                        :h('span',{style:{width:14,height:14,display:'flex',alignItems:'center',justifyContent:'center'}},ic('M5 12h14',{s:14,c:'#E0E0E0',w:2})),
                    h('span',{style:{fontSize:'14px',fontWeight:owned?600:400,color:!parentHas?'#CCCCCC':owned?'#1A1A1A':'#808080'}},e.label))),
                h('td',{style:{padding:'12px 14px',borderBottom:'1px solid #F0F0F0',background:'#fff',textAlign:'right',whiteSpace:'nowrap'}},
                  parentHas&&owned&&h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'#036C01',fontWeight:600,background:'#E6F4E5',padding:'3px 9px',borderRadius:'1000px',border:'1px solid #A3D9A1'}},h('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'#036C01',display:'inline-block'}}),'Granted'),
                  parentHas&&!owned&&h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'#2A2A2A',fontWeight:600,background:'#FDF0C4',padding:'3px 9px',borderRadius:'1000px',border:'1px solid #E8D870'}},h('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'#D97706',display:'inline-block'}}),'Available'),
                  !parentHas&&h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'#2A2A2A',fontWeight:600,background:'#F0F0F0',padding:'3px 9px',borderRadius:'1000px',border:'1px solid #D0D0D0'}},h('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'#CCCCCC',display:'inline-block'}}),'Not in parent')));
            }
            return h('div',{style:{maxWidth:'1120px',display:'flex',height:'calc(100vh - 140px)',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden',background:'#fff'}},
              // LEFT PANEL — org tree
              h('div',{style:{width:'340px',flexShrink:0,borderRight:'1px solid #E3E3E3',display:'flex',flexDirection:'column',background:'#fff'}},
                h('div',{style:{padding:'13px 13px 10px',borderBottom:'1px solid #E3E3E3',flexShrink:0}},
                  h('div',{style:{position:'relative',marginBottom:'8px'}},
                    h('span',{style:{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',color:'#AAAAAA'}},
                      ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:14})),
                    h('input',{value:orgSearch,onChange:e=>setOrgSearch(e.target.value),placeholder:'Search organisations…',
                      style:{width:'100%',padding:'8px 10px 8px 30px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}})),
                  h('select',{value:orgTypeFilter,onChange:e=>setOrgTypeFilter(e.target.value),
                    style:{width:'100%',padding:'6px 32px 6px 10px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#434343',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 10px center'}},
                    h('option',{value:''},'All types'),
                    h('option',{value:'reseller'},'Reseller'),
                    h('option',{value:'subReseller'},'Sub-Reseller'),
                    h('option',{value:'childReseller'},'Child Reseller'),
                    h('option',{value:'dealer'},'Dealer'))),
                h('div',{style:{flex:1,overflowY:'auto'}},
                  visFlat.length===0
                    ?h('div',{style:{padding:'32px 14px',textAlign:'center',color:'#AAAAAA',fontSize:'14px'}},'No organisations match')
                    :visFlat.map(row=>{
                      const o=row.org;
                      const isSel=selOrgId===o.id;
                      return h('div',{key:o.id,onClick:()=>setSelOrgId(isSel?null:o.id),
                        style:{display:'flex',alignItems:'center',gap:'0',padding:'10px 13px',borderBottom:'1px solid #F0F0F0',cursor:'pointer',background:isSel?'#FAF6FF':'transparent'},
                        onMouseEnter:e=>{if(!isSel)e.currentTarget.style.background='#FAF6FF';},
                        onMouseLeave:e=>{if(!isSel)e.currentTarget.style.background='transparent';}},
                        h('div',{style:{width:(row.depth*16)+'px',flexShrink:0}}),
                        row.depth>0&&h('span',{style:{color:'#D0D0D0',fontSize:'12px',fontFamily:'monospace',flexShrink:0,marginRight:'4px'}},'└'),
                        h('span',{style:{...dotSt(o.typeKey),flexShrink:0}}),
                        h('div',{style:{minWidth:0,flex:1,marginLeft:'8px'}},
                          h('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
                            h('span',{style:{fontWeight:o.depth===0||o.id===home?700:600,fontSize:'14px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isSel?'#5514B4':'#1A1A1A',flex:1,minWidth:0}},o.name),
                            o.status&&h('span',{style:{
                              fontSize:'12px',fontWeight:700,flexShrink:0,padding:'2px 7px',borderRadius:'999px',
                              ...(o.status==='Active'?{background:'#E6F4E5',color:'#036C01',border:'1px solid #A3D9A1'}:
                                 o.status==='Inactive'?{background:'#F0F0F0',color:'#2A2A2A',border:'1px solid #D0D0D0'}:
                                 {background:'#FEF3F2',color:'#B42318',border:'1px solid #FECDCA'})
                            }},o.status)),
                          h('div',{style:{display:'flex',alignItems:'center',gap:'5px',marginTop:'3px'}},
                            h('span',{style:{...s(badgeSt(o.typeKey)),fontSize:'12px',padding:'2px 6px'}},TYPE_LABELS[o.typeKey]),
                            o.id===home&&h('span',{style:{fontSize:'12px',fontWeight:700,color:'#5514B4',background:'#F3EBFE',padding:'2px 6px',borderRadius:'1000px'}},'You'))));
                    }))),
              // RIGHT PANEL — org detail
              dSel
                ?h('div',{style:{flex:1,overflowY:'auto',padding:'28px',minWidth:0}},
                    h('div',{style:{marginBottom:'24px'}},
                      h('div',{style:{fontSize:'20px',fontWeight:700,letterSpacing:'-0.01em',marginBottom:'8px'}},dSel.name),
                      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',flexWrap:'wrap',marginBottom:'16px'}},
                        h('div',{style:{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}},
                          h('span',{style:s(badgeSt(dSel.typeKey))},TYPE_LABELS[dSel.typeKey]),
                          dSel.id===home&&h('span',{style:{fontSize:'12px',fontWeight:700,color:'#5514B4',background:'#F3EBFE',padding:'3px 8px',borderRadius:'1000px'}},'Your organisation'),
                          h('span',{style:{fontSize:'14px',color:'#808080'}},dSel.id===home?'':dParent?'Reports to '+dParent.name:'Platform root')),
                        h('button',{onClick:()=>{setSelOrgId(dSel.id);setScreen('orgDetail');},
                          style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#fff',border:'1.5px solid #5514B4',color:'#5514B4',fontWeight:700,fontSize:'14px',cursor:'pointer',padding:'8px 16px',borderRadius:'32px',fontFamily:'inherit',flexShrink:0}},
                          'View full profile'))),
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'24px'}},
                      [['Primary contact',dSel.primaryName||dSel.contact||'—'],['Users',String(userCountFor(dSel.id))],['Sub-orgs',String(childrenOf(dSel.id).length)]].map(([label,val])=>
                        h('div',{key:label,style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'12px'}},
                          h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'5px'}},label),
                          h('div',{style:{fontWeight:700,fontSize:'16px',color:'#5514B4'}},val)))),
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},'Product entitlements'),
                    h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'20px'}},
                      h('table',{style:{width:'100%',borderCollapse:'collapse'}},
                        h('thead',null,h('tr',null,
                          h('th',{style:{fontSize:'12px',fontWeight:600,color:'#434343',textAlign:'left',padding:'12px 14px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Product'),
                          h('th',{style:{fontSize:'12px',fontWeight:600,color:'#434343',textAlign:'right',padding:'12px 14px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',width:'120px'}},'Access'))),
                        h('tbody',null,PRODUCT_KEYS.map(k=>h(EntRow,{key:k,entKey:k}))))),
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},'Services & capabilities'),
                    h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden'}},
                      h('table',{style:{width:'100%',borderCollapse:'collapse'}},
                        h('thead',null,h('tr',null,
                          h('th',{style:{fontSize:'12px',fontWeight:600,color:'#434343',textAlign:'left',padding:'12px 14px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Service'),
                          h('th',{style:{fontSize:'12px',fontWeight:600,color:'#434343',textAlign:'right',padding:'12px 14px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',width:'120px'}},'Access'))),
                        h('tbody',null,ENT.filter(e=>e.kind==='service').map(e=>h(EntRow,{key:e.key,entKey:e.key}))))),
                    canAdmin&&dSel.id!=='btw'&&dSel.id!==home&&dSel.typeKey!=='subReseller'&&dSel.typeKey!=='dealer'&&h('button',{
                      onClick:()=>showToast('info','Entitlements are edited with the same picker used when creating an organisation.'),
                      style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',marginTop:'20px'}},
                      ic('M12 5v14M5 12h14',{s:15,c:'#fff'}),'Assign entitlements'))
                :h('div',{style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px',padding:'40px'}},
                    h('div',{style:{width:'52px',height:'52px',borderRadius:'14px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'4px'}},
                      ic('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2',{s:24,c:'#5514B4'})),
                    h('div',{style:{fontWeight:700,fontSize:'14px',color:'#434343'}},'Select an organisation'),
                    h('div',{style:{fontSize:'14px',color:'#AAAAAA'}},'Choose from the tree on the left to view its details')));
          })(),

          screen==='orgDetail'&&selOrgId&&(()=>{
            const od=orgById(selOrgId);
            if(!od) return null;
            const odParent=od.parentId?orgById(od.parentId):null;
            const odChildren=childrenOf(od.id);
            const odUsers=users.filter(u=>u.orgId===od.id);
            const PROD_KEYS=ENT.filter(e=>e.kind==='product').map(e=>e.key);
            function OdEntRow({entKey}){
              const owned=od.entitlements.includes(entKey);
              const e=ENT.find(x=>x.key===entKey);
              return h('div',{style:{display:'flex',alignItems:'center',gap:'12px',padding:'8px 0',borderBottom:'1px solid #F3F3F3'}},
                owned?ic('M20 6 9 17l-5-5',{s:14,c:'#357E3C',w:2.4}):h('span',{style:{display:'flex'}},ic('M5 12h14',{s:14,c:'#C8C8C8',w:2})),
                h('span',{style:{fontSize:'14px',fontWeight:owned?600:400,color:owned?'#1A1A1A':'#AAAAAA'}},e.label));
            }
            return h('div',{style:{maxWidth:'1120px'}},
              h('button',{onClick:()=>{setScreen('orgs');setSelOrgId(null);},style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:0,color:'#5514B4',fontWeight:700,fontSize:'14px',cursor:'pointer',padding:'0 0 20px 0',fontFamily:'inherit'}},
                ic('m15 18-6-6 6-6',{s:15,c:'#5514B4'}),'Organisations'),
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr 320px',gap:'32px',alignItems:'start'}},

                h('div',null,
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'24px',marginBottom:'20px'}},
                    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}},
                      h('div',{style:{width:'48px',height:'48px',borderRadius:'12px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2',{s:22,c:'#5514B4'})),
                      h('div',null,
                        h('div',{style:{fontSize:'20px',fontWeight:700,letterSpacing:'-0.01em'}},od.name),
                        h('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginTop:'4px'}},
                          h('span',{style:s(badgeSt(od.typeKey))},TYPE_LABELS[od.typeKey]),
                          odParent&&h('span',{style:{fontSize:'14px',color:'#808080'}},'Reports to ',h('b',null,odParent.name))))),
                    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'#E3E3E3',borderRadius:'12px',overflow:'hidden'}},
                      [['Primary contact',od.primaryName||od.contact||'—'],['Users',String(userCountFor(od.id))],['Sub-orgs',String(odChildren.length)]].map(([label,val])=>
                        h('div',{key:label,style:{background:'#F7F7F7',padding:'14px 16px'}},
                          h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'5px'}},label),
                          h('div',{style:{fontWeight:700,fontSize:'16px',color:'#5514B4',wordBreak:'break-all'}},val))))),

                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden',marginBottom:'20px'}},
                    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid #E3E3E3'}},
                      h('div',{style:{fontWeight:700,fontSize:'16px'}},'Contact details'),
                      canAdmin&&!editingContact&&h('button',{
                        onClick:()=>{setContactDraft({primaryName:od.primaryName||'',primaryEmail:od.primaryEmail||'',primaryPhone:od.primaryPhone||'',billingName:od.billingName||'',billingEmail:od.billingEmail||'',billingPhone:od.billingPhone||'',address:od.address||'',contact:od.contact||'',website:od.website||''});setEditingContact(true);},
                        title:'Edit contact details',
                        style:{display:'inline-flex',alignItems:'center',background:'none',border:'none',padding:'4px',cursor:'pointer',borderRadius:'6px',lineHeight:0}},
                        ic('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',{s:16,c:'#5514B4'}))),
                    h('div',{style:{padding:'4px 22px 22px'}},
                    editingContact&&contactDraft?(()=>{
                      const inputSt={fontSize:'14px',border:'1px solid #6B6B6B',borderRadius:'8px',padding:'8px 12px',fontFamily:'inherit',outline:'none',color:'#2A2A2A',width:'100%'};
                      const lbl=(txt)=>h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'4px'}},txt);
                      const inp=(key,type)=>h('input',{value:contactDraft[key]||'',onChange:e=>setContactDraft(d=>({...d,[key]:e.target.value})),type:type||'text',style:inputSt});
                      const section=(title)=>h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',padding:'12px 0 6px',borderBottom:'1px solid #F0F0F0',marginBottom:'8px'}},title);
                      return h('div',null,
                        section('Primary contact'),
                        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}},
                          h('div',null,lbl('Name'),inp('primaryName')),
                          h('div',null,lbl('Email'),inp('primaryEmail','email'))),
                        h('div',{style:{marginBottom:'16px'}},lbl('Phone'),inp('primaryPhone','tel')),
                        section('Billing contact'),
                        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}},
                          h('div',null,lbl('Name'),inp('billingName')),
                          h('div',null,lbl('Email'),inp('billingEmail','email'))),
                        h('div',{style:{marginBottom:'16px'}},lbl('Phone'),inp('billingPhone','tel')),
                        section('Organisation'),
                        h('div',{style:{marginBottom:'12px'}},lbl('Registered address'),inp('address')),
                        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}},
                          h('div',null,lbl('Contact email'),inp('contact','email')),
                          h('div',null,lbl('Website'),inp('website'))),
                        h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},
                          h('button',{
                            onClick:()=>{setOrgs(os=>os.map(o=>o.id===od.id?{...o,...contactDraft}:o));setEditingContact(false);setContactDraft(null);showToast('success','Contact details updated.');},
                            style:{background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}
                          },'Save changes'),
                          h('button',{
                            onClick:()=>{setEditingContact(false);setContactDraft(null);},
                            style:{background:'none',border:'1px solid #D0D0D0',color:'#434343',borderRadius:'32px',padding:'12px 20px',fontWeight:600,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}
                          },'Cancel')));
                    })()
                    :(()=>{
                      const row=(label,val,type,displayText)=>h('div',{style:{display:'grid',gridTemplateColumns:'160px 1fr',gap:'8px',padding:'8px 0',borderBottom:'1px solid #F3F3F3',alignItems:'center'}},
                        h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343'}},label),
                        type==='email'&&val
                          ?h('a',{href:'mailto:'+val,style:{fontSize:'14px',color:'#5514B4',textDecoration:'none'}},displayText||val)
                          :type==='url'&&val
                          ?h('a',{href:val,target:'_blank',rel:'noopener noreferrer',style:{fontSize:'14px',color:'#5514B4',textDecoration:'none'}},displayText||val)
                          :h('div',{style:{fontSize:'14px',color:'#434343'}},val||'—'));
                      const sec=(title)=>h('div',{style:{fontSize:'12px',fontWeight:500,color:'#808080',padding:'12px 0 4px',marginTop:'4px'}},title);
                      return h('div',null,
                        sec('Primary contact'),
                        row('Name',od.primaryName),
                        row('Email',od.primaryEmail,'email'),
                        row('Phone',od.primaryPhone),
                        sec('Billing contact'),
                        row('Name',od.billingName),
                        row('Email',od.billingEmail,'email'),
                        row('Phone',od.billingPhone),
                        sec('Organisation'),
                        row('Address',od.address),
                        row('Contact email',od.contact,'email'),
                        row('Website',od.website?'https://'+od.website:null,'url',od.website));
                    })())),

                  odUsers.length>0&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden',marginBottom:'20px'}},
                    h('div',{style:{padding:'20px 24px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                      h('div',{style:{fontWeight:700,fontSize:'16px'}},'Users (',odUsers.length,')'),
                      h('button',{onClick:()=>{setFilterOrg(od.id);setScreen('users');},style:{background:'none',border:0,color:'#5514B4',fontWeight:400,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:'4px',textDecoration:'underline',textUnderlineOffset:'2px'}},'View all',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))),
                    odUsers.slice(0,5).map(u=>h('div',{key:u.id,style:{display:'flex',alignItems:'center',gap:'12px',padding:'12px 22px',borderBottom:'1px solid #F0F0F0',cursor:'pointer'},onClick:()=>openUserDrawer(u.id)},
                      h('div',{style:{width:'34px',height:'34px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'12px',flexShrink:0}},initials(u.name)),
                      h('div',{style:{flex:1,minWidth:0}},
                        h('div',{style:{fontWeight:700,fontSize:'14px'}},u.name),
                        h('div',{style:{fontSize:'12px',color:'#808080'}},roleLabel(u.roleKey))))))),

                  odChildren.length>0&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden'}},
                    h('div',{style:{padding:'20px 24px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                      h('div',{style:{fontWeight:700,fontSize:'16px'}},'Sub-organisations (',odChildren.length,')'),
                      h('button',{onClick:()=>setScreen('orgs'),style:{background:'none',border:0,color:'#5514B4',fontWeight:400,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:'4px',textDecoration:'underline',textUnderlineOffset:'2px'}},'View in tree',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))),
                    odChildren.map(c=>h('div',{key:c.id,style:{display:'flex',alignItems:'center',gap:'12px',padding:'12px 22px',borderBottom:'1px solid #F0F0F0',cursor:'pointer'},onClick:()=>setSelOrgId(c.id)},
                      h('span',{style:dotSt(c.typeKey)}),
                      h('div',{style:{flex:1}},
                        h('div',{style:{fontWeight:600,fontSize:'14px'}},c.name),
                        h('div',{style:{fontSize:'12px',color:'#808080'}},TYPE_LABELS[c.typeKey])),
                      h('div',{style:{fontSize:'14px',color:'#808080'}},userCountFor(c.id),' users')))),  // close text, row, map, sub-orgs card

                h('div',null,
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'20px',marginBottom:'16px'}},
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'4px',paddingBottom:'8px',borderBottom:'1px solid #E3E3E3'}},'Product entitlements'),
                    PROD_KEYS.map(k=>h(OdEntRow,{key:k,entKey:k})),
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'4px',paddingBottom:'8px',borderBottom:'1px solid #E3E3E3',marginTop:'20px'}},'Services & capabilities'),
                    ENT.filter(e=>e.kind==='service').map(e=>h(OdEntRow,{key:e.key,entKey:e.key})),
                    canAdmin&&od.id!=='btw'&&od.id!==home&&od.typeKey!=='subReseller'&&od.typeKey!=='dealer'&&h('button',{onClick:()=>showToast('info','Entitlements are edited with the same picker used when creating an organisation.'),style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'8px',padding:'10px 16px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',marginTop:'16px',width:'100%',justifyContent:'center'}},ic('M12 5v14M5 12h14',{s:14,c:'#fff'}),'Edit entitlements')))));
          })(),

          screen==='users'&&h('div',{style:{maxWidth:'1120px'}},
            h('div',{style:{borderBottom:'1px solid #E3E3E3',marginBottom:'24px',display:'flex',gap:'8px'}},
              [{key:'users',label:'Users'},{key:'roles',label:'Roles & permissions'}].map(t=>
                h('button',{key:t.key,onClick:()=>setUsersTab(t.key),
                  style:{background:'none',border:'none',borderBottom:usersTab===t.key?'2px solid #2A1C4A':'1px solid #C8C8C8',padding:'10px 16px 10px 12px',fontWeight:usersTab===t.key?700:400,fontSize:'14px',color:usersTab===t.key?'#2A1C4A':'#5514B4',cursor:'pointer',fontFamily:'inherit',marginBottom:'-1px',whiteSpace:'nowrap'}},
                  t.label))),
            usersTab==='users'&&(()=>{
            const q=userSearch.toLowerCase();
            const filtered=visibleUsers.filter(u=>{
              if(q&&!u.name.toLowerCase().includes(q)&&!u.email.toLowerCase().includes(q)) return false;
              if(filterRole&&u.roleKey!==filterRole) return false;
              if(filterOrg&&u.orgId!==filterOrg) return false;
              if(filterStatus&&u.status!==filterStatus) return false;
              return true;
            });
            const du=userDrawer?users.find(u=>u.id===userDrawer):null;
            const dr=du?ROLES.find(r=>r.key===du.roleKey):null;
            const dOrg=du?orgById(du.orgId):null;
            return h('div',{style:{maxWidth:'1120px',display:'flex',height:'calc(100vh - 190px)',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden',background:'#fff'}},
              // LEFT PANEL — user list
              h('div',{style:{width:'292px',flexShrink:0,borderRight:'1px solid #E3E3E3',display:'flex',flexDirection:'column',background:'#fff'}},
                h('div',{style:{padding:'13px 13px 10px',borderBottom:'1px solid #E3E3E3',flexShrink:0}},
                  h('div',{style:{position:'relative',marginBottom:'8px'}},
                    h('span',{style:{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',color:'#AAAAAA'}},
                      ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:14})),
                    h('input',{value:userSearch,onChange:e=>setUserSearch(e.target.value),placeholder:'Search by name…',
                      style:{width:'100%',padding:'8px 10px 8px 30px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}})),
                  h('div',{style:{display:'flex',gap:'6px'}},
                    h('select',{value:filterStatus,onChange:e=>setFilterStatus(e.target.value),style:{flex:1,padding:'6px 28px 6px 10px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#434343',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center'}},
                      h('option',{value:''},'Status'),
                      ['Active','Invited','Inactive'].map(s=>h('option',{key:s,value:s},s))),
                    h('select',{value:filterRole,onChange:e=>setFilterRole(e.target.value),style:{flex:1,padding:'6px 28px 6px 8px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#434343',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center'}},
                      h('option',{value:''},'All roles'),
                      ROLES.map(r=>h('option',{key:r.key,value:r.key},r.label))))),
                h('div',{style:{flex:1,overflowY:'auto'}},
                  filtered.length===0
                    ?h('div',{style:{padding:'32px 14px',textAlign:'center',color:'#AAAAAA',fontSize:'14px'}},'No users match')
                    :filtered.map(u=>{
                      const sc=statusMap[u.status]||statusMap.Active;
                      const isSel=userDrawer===u.id;
                      return h('div',{key:u.id,onClick:()=>openUserDrawer(u.id),
                        style:{display:'flex',alignItems:'center',gap:'12px',padding:'11px 13px',borderBottom:'1px solid #F0F0F0',cursor:'pointer',background:isSel?'#FAF6FF':'transparent'},
                        onMouseEnter:e=>{if(!isSel)e.currentTarget.style.background='#FAF6FF';},
                        onMouseLeave:e=>{if(!isSel)e.currentTarget.style.background='transparent';}},
                        h('div',{style:{position:'relative',flexShrink:0}},
                          u.photo
                            ?h('img',{src:u.photo,alt:u.name,style:{width:'34px',height:'34px',borderRadius:'999px',objectFit:'cover',display:'block'}})
                            :h('div',{style:{width:'34px',height:'34px',borderRadius:'999px',background:isSel?'#5514B4':'#F3EBFE',color:isSel?'#fff':'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'12px'}},initials(u.name)),
                          h('span',{style:{position:'absolute',bottom:0,right:'-1px',width:'9px',height:'9px',borderRadius:'999px',border:'2px solid #fff',background:sc[2]}})),
                        h('div',{style:{minWidth:0,flex:1}},
                          h('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
                            h('span',{style:{fontWeight:isSel?700:600,fontSize:'14px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isSel?'#5514B4':'#1A1A1A',flex:1,minWidth:0}},u.name),
                            h('span',{style:{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,flexShrink:0,padding:'2px 7px',borderRadius:'999px',color:sc[0],background:sc[1],border:'1px solid '+sc[0]+'33'}},
                              h('span',{style:{width:'5px',height:'5px',borderRadius:'50%',background:'currentColor',flexShrink:0}}),
                              u.status)),
                          h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'1px'}},roleLabel(u.roleKey))));
                    }))),
              // RIGHT PANEL — user detail
              du
                ?h('div',{style:{flex:1,overflowY:'auto',padding:'28px',minWidth:0}},
                    // Header
                    h('div',{style:{display:'flex',alignItems:'flex-start',gap:'16px',marginBottom:'24px'}},
                      du.photo
                        ?h('img',{src:du.photo,alt:du.name,style:{width:'64px',height:'64px',borderRadius:'999px',objectFit:'cover',flexShrink:0}})
                        :h('div',{style:{width:'64px',height:'64px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'20px',flexShrink:0}},initials(du.name)),
                      h('div',{style:{minWidth:0,flex:1,paddingTop:'4px'}},
                        h('div',{style:{fontSize:'20px',fontWeight:700,letterSpacing:'-0.01em'}},du.name),
                        h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'3px'}},du.email),
                        h('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginTop:'12px',flexWrap:'wrap'}},
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',background:du.roleKey==='admin'?'#2A1C4A':'#F0F0F0',color:du.roleKey==='admin'?'#fff':'#434343',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700}},
                            du.roleKey==='admin'
                              ?ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:12,c:'#fff'})
                              :ic([{el:'circle',cx:9,cy:7,r:4},'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'],{s:12,c:'#808080'}),
                            du.roleKey==='admin'?'Administrator':'Standard user'),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'4px 10px',fontSize:'12px',fontWeight:700,color:(statusMap[du.status]||statusMap.Active)[0],background:(statusMap[du.status]||statusMap.Active)[1]}},
                            h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),du.status),
                          du.isPrimary&&h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#E8F1FB',color:'#1A4070',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700}},
                            ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:12,c:'#1A4070'}),'Primary contact')))),
                    // Details strip
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'24px'}},
                      [['Organisation',dOrg?dOrg.name:'—'],['Role since',du.roleDate||'—'],['Org type',dOrg?TYPE_LABELS[dOrg.typeKey]:'—']].map(([lbl,val])=>
                        h('div',{key:lbl,style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'12px'}},
                          h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'5px'}},lbl),
                          h('div',{style:{fontWeight:700,fontSize:'14px',color:'#2A2A2A'}},val)))),
                    // Capabilities
                    (()=>{
                      const caps=ROLE_CAPS[du.roleKey]||[];
                      return caps.length>0?h('div',{style:{marginBottom:'24px'}},
                        h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},'Capabilities'),
                        h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                          caps.map(cap=>{
                            const [fg,bg]=CAP_COLORS[cap]||['#434343','#F7F7F7'];
                            return h('span',{key:cap,style:{display:'inline-flex',alignItems:'center',gap:'5px',background:bg,color:fg,borderRadius:'6px',padding:'5px 11px',fontSize:'12px',fontWeight:700}},
                              ic('M20 6 9 17l-5-5',{s:11,c:fg,w:2.5}),cap);
                          }))):null;
                    })(),
                    // Role section
                    dr&&(()=>{
                      const previewKey=drawerPendingRole??du.roleKey;
                      const previewRole=ROLES.find(r=>r.key===previewKey)||dr;
                      const isPreviewing=previewKey!==du.roleKey;
                      return h('div',{style:{marginBottom:'24px'}},
                        h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},isPreviewing?'Role preview':'Current role'),
                        h('div',{style:{background:'#FAF6FF',border:'2px solid '+(isPreviewing?'#8B44D4':'#5514B4'),borderRadius:'12px',padding:'16px',marginBottom:canAdmin?'14px':'0'}},
                          h('div',{style:{display:'flex',gap:'12px',alignItems:'center',marginBottom:'12px'}},
                            h('span',{style:{width:'34px',height:'34px',borderRadius:'8px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                              ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:17})),
                            h('div',null,
                              h('div',{style:{fontWeight:700,fontSize:'14px'}},previewRole.label),
                              h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},previewRole.desc))),
                          h('div',{style:{display:'flex',flexDirection:'column',gap:'5px'}},
                            previewRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'center',fontSize:'12px',color:'#3F187F'}},
                              ic('M20 6 9 17l-5-5',{s:12,c:'#5514B4',w:2.4}),g)))),
                        canAdmin&&h('div',null,
                          h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},'Change role'),
                          h('div',{style:{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'12px'}},
                            ROLES.map(r=>h('button',{key:r.key,
                              onClick:()=>setDrawerPendingRole(r.key===du.roleKey&&!isPreviewing?null:r.key),
                              style:{display:'flex',alignItems:'center',gap:'8px',width:'100%',padding:'8px 12px',border:'1px solid '+(r.key===previewKey?'#5514B4':'#E3E3E3'),borderRadius:'12px',background:r.key===previewKey?'#FAF6FF':'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}},
                              h('span',{style:{width:'17px',height:'17px',borderRadius:'999px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:r.key===previewKey?'#5514B4':'#fff',border:'1px solid '+(r.key===previewKey?'#5514B4':'#C8C8C8')}},
                                r.key===previewKey&&h('span',{style:{width:'8px',height:'8px',borderRadius:'999px',background:'#fff'}})),
                              h('div',{style:{flex:1,minWidth:0}},
                                h('span',{style:{fontWeight:700,fontSize:'14px',color:r.key===previewKey?'#5514B4':'#2A2A2A'}},r.label),
                                r.key===du.roleKey&&h('span',{style:{marginLeft:'7px',fontSize:'12px',fontWeight:700,color:'#036C01',background:'#E6F4E5',border:'1px solid #A3D9A1',padding:'2px 7px',borderRadius:'1000px'}},'Current'))))),
                          h('button',{
                            onClick:()=>{
                              if(!isPreviewing)return;
                              setUsers(us=>us.map(u=>u.id===du.id?{...u,roleKey:previewKey}:u));
                              setDrawerPendingRole(null);
                              showToast('success',du.name+' changed to '+previewRole.label+'.');
                            },
                            style:{padding:'10px 24px',background:isPreviewing?'#5514B4':'#D9C9F5',color:'#fff',border:0,borderRadius:'32px',fontWeight:700,fontSize:'14px',cursor:isPreviewing?'pointer':'default',fontFamily:'inherit',opacity:isPreviewing?1:0.55}},
                            'Confirm role change')));
                    })(),
                    // Actions
                    canAdmin&&h('div',{style:{borderTop:'1px solid #F0F0F0',paddingTop:'18px'}},
                      h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Actions'),
                      h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                        du.status==='Invited'&&h('button',{
                          onClick:()=>showToast('success','Invitation resent to '+du.name+'.'),
                          style:{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',border:'1px solid #E3E3E3',borderRadius:'12px',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'14px',color:'#2A2A2A',textAlign:'left'}},
                          ic('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3 18a2 2 0 0 1-2-2.18V13a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v.92',{s:14,c:'#434343'}),'Resend invite email'),
                        (du.status==='Active'||du.status==='Invited')&&h('button',{
                          onClick:()=>setDeactivateConfirm(du.id),
                          style:{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',border:'1px solid #F8E0C0',borderRadius:'12px',background:'#FFF9F0',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'14px',color:'#8A5A00',textAlign:'left'}},
                          ic(['M18 8h1a4 4 0 0 1 0 8h-1','M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z','M6 1v3','M10 1v3','M14 1v3'],{s:14,c:'#8A5A00'}),'Deactivate user'),
                        du.status==='Inactive'&&h('button',{
                          onClick:()=>{setUsers(us=>us.map(u=>u.id===du.id?{...u,status:'Active'}:u));showToast('success',du.name+' has been reactivated.');},
                          style:{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',border:'1px solid #A3D9A1',borderRadius:'12px',background:'#E6F4E5',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'14px',color:'#036C01',textAlign:'left'}},
                          ic('M20 6 9 17l-5-5',{s:14,c:'#357E3C'}),'Reactivate user'),
                        h('button',{
                          onClick:()=>setRemoveConfirm(du.id),
                          style:{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',border:'1px solid #FAD4D4',borderRadius:'8px',background:'#FEF5F5',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'14px',color:'#A0121B',textAlign:'left'}},
                          ic(['M3 6h18','M8 6V4h8v2','M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],{s:14,c:'#A0121B'}),'Remove user'))))
                :h('div',{style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px',padding:'40px'}},
                    h('div',{style:{width:'52px',height:'52px',borderRadius:'14px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'4px'}},
                      ic([{el:'circle',cx:9,cy:7,r:4},'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],{s:24,c:'#5514B4'})),
                    h('div',{style:{fontWeight:700,fontSize:'14px',color:'#434343'}},'Select a user'),
                    h('div',{style:{fontSize:'14px',color:'#AAAAAA'}},'Choose from the list on the left to view their profile')));
          })(),
            usersTab==='auditLog'&&(()=>{
              const catColors={'User administration':['#3F187F','#F3EBFE'],'Organisation management':['#036C01','#E6F4E5'],'Product management':['#2A2A2A','#FDF0C4'],'Billing':['#1A4070','#E8F1FB'],'API access':['#1A4A3A','#E6F5F0']};
              const q=auditFilter.toLowerCase();
              const filtered=AUDIT_LOG.filter(e=>!q||(e.who+e.action+e.detail+e.category+e.org).toLowerCase().includes(q));
              return h('div',{style:{maxWidth:'1120px'}},
                h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px 18px',display:'flex',gap:'12px',alignItems:'flex-start',marginBottom:'20px'}},
                  ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:16,c:'#5514B4'}),
                  h('div',{style:{fontSize:'14px',color:'#434343',lineHeight:1.5}},'All role and permission changes are logged here. Records are ',h('b',null,'immutable'),' — actions are captured with the actor identity, organisation context, and a timestamp. Accessible only to Administrators.')),
                h('div',{style:{display:'flex',gap:'12px',marginBottom:'20px',alignItems:'center'}},
                  h('div',{style:{position:'relative',flex:1}},
                    h('span',{style:{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',color:'#AAAAAA'}},ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:15})),
                    h('input',{value:auditFilter,onChange:e=>setAuditFilter(e.target.value),placeholder:'Search log…',style:{width:'100%',padding:'9px 14px 9px 36px',border:'1px solid #6B6B6B',borderRadius:'10px',fontSize:'14px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}})),
                  auditFilter&&h('button',{onClick:()=>setAuditFilter(''),style:{padding:'9px 14px',border:'1px solid #E3E3E3',borderRadius:'10px',fontSize:'14px',background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#808080',whiteSpace:'nowrap'}},'Clear')),
                h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                  h('div',{style:{display:'grid',gridTemplateColumns:'1.4fr 2fr 1.2fr 0.9fr',padding:'11px 20px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',fontSize:'12px',fontWeight:600,color:'#434343'}},
                    h('div',null,'Actor'),h('div',null,'Action'),h('div',null,'Category'),h('div',null,'Timestamp')),
                  filtered.length===0
                    ?h('div',{style:{padding:'40px',textAlign:'center',color:'#AAAAAA',fontSize:'14px'}},'No log entries match')
                    :filtered.map((e,i)=>{
                      const [cfg,cbg]=catColors[e.category]||['#434343','#F7F7F7'];
                      return h('div',{key:e.id,style:{display:'grid',gridTemplateColumns:'1.4fr 2fr 1.2fr 0.9fr',padding:'14px 20px',borderBottom:i<filtered.length-1?'1px solid #F5F5F5':'none',alignItems:'start'}},
                        h('div',null,
                          h('div',{style:{fontWeight:700,fontSize:'14px',color:'#2A2A2A'}},e.who),
                          h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},e.whoRole+' · '+e.org),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'11px',fontWeight:700,color:e.actorType==='bt'?'#2A1C4A':'#5514B4',background:e.actorType==='bt'?'#EBE6F4':'#F3EBFE',border:'1px solid '+(e.actorType==='bt'?'#BDB0E0':'#C4A0F0'),borderRadius:'1000px',padding:'2px 8px',marginTop:'6px'}},
                            ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:10,c:e.actorType==='bt'?'#2A1C4A':'#5514B4'}),
                            e.actorType==='bt'?'BT Internal':'Reseller')),
                        h('div',null,
                          h('div',{style:{fontWeight:600,fontSize:'14px',color:'#2A2A2A'}},e.action),
                          h('div',{style:{fontSize:'12px',color:'#6B6B6B',marginTop:'3px',lineHeight:1.4}},e.detail)),
                        h('div',null,
                          h('span',{style:{display:'inline-flex',alignItems:'center',fontSize:'12px',fontWeight:700,color:cfg,background:cbg,borderRadius:'6px',padding:'4px 10px'}},e.category)),
                        h('div',{style:{fontSize:'12px',color:'#808080',fontVariantNumeric:'tabular-nums'}},e.ts));
                    })));
            })(),

            usersTab==='roles'&&(()=>{
              const tabs=isBt
                ?[{key:'roleDirectory',label:'Available roles'},{key:'resellerAdmins',label:'Reseller admins'},{key:'whoHasAccess',label:'Who has access?'}]
                :[{key:'roleDirectory',label:'Available roles'},{key:'permSets',label:'Permission sets'},{key:'userRoles',label:"Your team's roles"},{key:'whoHasAccess',label:'Who has access?'}];
              const activeTab=rolesTab;
              const tabBtnSt=active=>({background:'none',border:'none',borderBottom:active?'2px solid #2A1C4A':'1px solid #C8C8C8',padding:'10px 16px 10px 12px',fontSize:'14px',fontWeight:active?700:400,color:active?'#2A1C4A':'#5514B4',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',marginBottom:'-1px'});
              const whoHasAccessPanel=isBt
                ?h('div',{style:{borderTop:'1px solid #E8E8E8',overflowX:'auto'}},
                    h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'640px'}},
                      h('thead',null,h('tr',null,
                        h('th',{style:{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343'}},'Capability'),
                        PROFILE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'11px 10px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'120px',color:'#434343'}},hd)))),
                      h('tbody',null,PROFILE_ROWS.map((row,ri)=>h('tr',{key:ri},
                        h('td',{style:{textAlign:'left',padding:'12px 16px',fontSize:'14px',borderBottom:'1px solid #F0F0F0'}},row[0]),
                        row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'12px 10px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v}))))))))
                :h('div',{style:{borderTop:'1px solid #E8E8E8',overflowX:'auto'}},
                    h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'820px'}},
                      h('thead',null,h('tr',null,
                        h('th',{style:{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343'}},'Permission area'),
                        ROLE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'11px 8px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'96px',color:'#434343'}},hd)))),
                      h('tbody',null,ROLE_ROWS.map((row,ri)=>h('tr',{key:ri},
                        h('td',{style:{textAlign:'left',padding:'12px 16px',fontSize:'14px',fontWeight:700,borderBottom:'1px solid #F0F0F0'}},row[0]),
                        row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'13px 8px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v}))))))));;
              const me=users.find(u=>u.id==='u2')||users[0];
              const myRole=ROLES.find(r=>r.key===me.roleKey)||ROLES[0];
              const myColIdx=ROLE_COL_MAP[me.roleKey]??0;
              return h('div',{style:{maxWidth:'1120px'}},
                persona==='user'
                ?h('div',null,
                  h('div',{style:{background:'#fff',border:'2px solid #5514B4',borderRadius:'32px',padding:'24px',marginBottom:'20px'}},
                    h('div',{style:{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:'20px'}},
                      h('span',{style:{width:'52px',height:'52px',borderRadius:'12px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:24})),
                      h('div',null,
                        h('div',{style:{fontSize:'20px',fontWeight:700,letterSpacing:'-0.01em'}},myRole.label),
                        h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'3px'}},'Your assigned role — since '+me.roleDate),
                        h('div',{style:{fontSize:'14px',color:'#434343',marginTop:'8px',lineHeight:1.5,maxWidth:'600px'}},myRole.desc))),
                    h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Permissions granted'),
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
                      myRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'12px',alignItems:'center',background:'#E6F4E5',border:'1px solid #A3D9A1',borderRadius:'9px',padding:'12px 14px',fontSize:'14px',color:'#036C01',fontWeight:600}},
                        ic('M20 6 9 17l-5-5',{s:13,c:'#357E3C',w:2.6}),g)))),
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',padding:'24px',marginBottom:'20px'}},
                    h('div',{style:{fontWeight:700,fontSize:'16px',marginBottom:'6px'}},'Your permission scope'),
                    h('div',{style:{fontSize:'14px',color:'#808080',marginBottom:'16px'}},'What you can access across the platform capabilities.'),
                    h('div',{style:{display:'flex',gap:'16px',marginBottom:'16px',fontSize:'12px',color:'#6B6B6B'}},
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'y'}),'Full'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'p'}),'Partial'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'n'}),'None')),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'0'}},
                      ROLE_ROWS.map((row,ri)=>{
                        const v=myColIdx>=0?row[myColIdx+1]:'n';
                        return h('div',{key:ri,style:{display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom:ri<ROLE_ROWS.length-1?'1px solid #F0F0F0':'none'}},
                          h(CellMark,{v}),
                          h('span',{style:{fontSize:'14px',fontWeight:v==='y'?700:v==='p'?600:400,color:v==='n'?'#AAAAAA':'#2A2A2A'}},row[0]));
                      }))),
                  h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px 18px',display:'flex',gap:'12px',alignItems:'flex-start'}},
                    ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:16,c:'#808080'}),
                    h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.5}},'To request a role change, contact your organisation administrator (Sarah Whitfield).')))
                :h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',overflow:'hidden'}},
                  h('div',{style:{padding:'20px 24px 18px'}},
                    h('div',{style:{display:'flex',borderBottom:'1px solid #E3E3E3',gap:'8px'}},
                      tabs.map(t=>h('button',{key:t.key,onClick:()=>setRolesTab(t.key),style:tabBtnSt(activeTab===t.key)},t.label)))),
                  activeTab==='roleDirectory'&&(selRole&&!isBt
                    ?(()=>{
                        const ro=ROLES.find(r=>r.key===selRole);
                        const ruserList=users.filter(u=>u.roleKey===selRole);
                        const roPsets=(ro.permSets||[]).map(pk=>PERMISSION_SETS.find(p=>p.key===pk)).filter(Boolean);
                        const groupedPsets=PSET_GROUPS.map(g=>({group:g,sets:roPsets.filter(p=>p.group===g)})).filter(g=>g.sets.length>0);
                        return h('div',{style:{padding:'20px 24px'}},
                          h('button',{onClick:()=>setSelRole(null),style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:'none',padding:0,cursor:'pointer',fontFamily:'inherit',fontSize:'14px',color:'#5514B4',fontWeight:600,marginBottom:'20px'}},
                            ic('M15 18l-6-6 6-6',{s:14,c:'#5514B4',w:2.5}),'Available roles'),
                          h('div',{style:{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:'24px'}},
                            h('div',{style:{width:'48px',height:'48px',borderRadius:'12px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                              ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:22,c:'#5514B4'})),
                            h('div',null,
                              h('div',{style:{fontSize:'20px',fontWeight:700,letterSpacing:'-0.01em'}},ro.label),
                              h('div',{style:{fontSize:'14px',color:'#6B6B6B',marginTop:'4px',lineHeight:1.5}},ro.desc))),
                          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}},
                            h('div',{style:{fontWeight:700,fontSize:'15px'}},
                              'Permission sets ',h('span',{style:{fontWeight:400,color:'#808080',fontSize:'14px'}},'('+roPsets.length+')')),
                            h('button',{onClick:()=>showToast('info','Permission set management is coming. You\'ll be able to add and remove sets from this role.'),style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:'1px solid #C4A0F0',borderRadius:'32px',padding:'7px 14px',fontSize:'13px',fontWeight:600,color:'#5514B4',cursor:'pointer',fontFamily:'inherit'}},
                              ic('M12 5v14M5 12h14',{s:12,c:'#5514B4'}),'Add permission set')),
                          h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'28px'}},
                            groupedPsets.map((g,gi)=>h('div',{key:g.group,style:{borderBottom:gi<groupedPsets.length-1?'1px solid #F0F0F0':'none',padding:'14px 20px'}},
                              h('div',{style:{fontSize:'11px',fontWeight:700,color:'#808080',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'10px'}},g.group),
                              h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                                g.sets.map(ps=>h('span',{key:ps.key,style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#F3EBFE',border:'1px solid #C4A0F0',borderRadius:'999px',padding:'5px 12px',fontSize:'13px',fontWeight:600,color:'#5514B4'}},
                                  ic('M20 6 9 17l-5-5',{s:11,c:'#7B3FD4',w:2.5}),ps.label)))))),
                          h('div',{style:{fontWeight:700,fontSize:'15px',marginBottom:'12px'}},
                            'Users with this role ',h('span',{style:{fontWeight:400,color:'#808080',fontSize:'14px'}},'('+ruserList.length+')')),
                          ruserList.length===0
                            ?h('div',{style:{fontSize:'14px',color:'#AAAAAA',padding:'12px 0'}},'No users are currently assigned this role.')
                            :h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden'}},
                                ruserList.map((u,i)=>{
                                  const sc=statusMap[u.status]||statusMap.Active;
                                  return h('div',{key:u.id,style:{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderBottom:i<ruserList.length-1?'1px solid #F0F0F0':'none'}},
                                    u.photo
                                      ?h('img',{src:u.photo,style:{width:'32px',height:'32px',borderRadius:'999px',objectFit:'cover',flexShrink:0}})
                                      :h('div',{style:{width:'32px',height:'32px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'13px',flexShrink:0}},initials(u.name)),
                                    h('div',{style:{flex:1}},
                                      h('div',{style:{fontWeight:600,fontSize:'14px'}},u.name),
                                      h('div',{style:{fontSize:'12px',color:'#808080'}},u.email)),
                                    h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'3px 9px',fontSize:'12px',fontWeight:700,color:sc[0],background:sc[1]}},
                                      h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),u.status));
                                })));
                      })()
                    :h('div',null,
                        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',marginBottom:'16px'}},
                          h('p',{style:{fontSize:'14px',color:'#6B6B6B',lineHeight:1.55,margin:0,flex:1}},isBt
                            ?'These are the roles available to BT Wholesale staff. Each role defines what someone can configure, view, or manage across the platform.'
                            :'Each role controls what a user can see and do. Roles are built from permission sets — click any role to see how it\'s composed.'),
                          !isBt&&h('button',{onClick:()=>setRoleWiz({step:1,name:'',desc:'',permSets:{}}),style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',flexShrink:0,marginLeft:'20px'}},
                            ic('M12 5v14M5 12h14',{s:14,c:'#fff'}),'Create custom role')),
                        h('div',{style:{borderTop:'1px solid #E8E8E8'}},
                          h('table',{style:{borderCollapse:'collapse',width:'100%'}},
                            h('thead',null,h('tr',null,
                              h('th',{style:{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343'}},'Role'),
                              h('th',{style:{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343'}},'Description'),
                              h('th',{style:{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343'}},'Permission sets'),
                              h('th',{style:{textAlign:'right',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343',whiteSpace:'nowrap'}},'Users assigned'))),
                            h('tbody',null,(isBt?BT_ROLES:ROLES).map((r,i,arr)=>h('tr',{key:r.key,
                              style:{cursor:isBt?'default':'pointer'},
                              onClick:()=>isBt?null:setSelRole(r.key),
                              onMouseEnter:e=>{if(!isBt)e.currentTarget.style.background='#FAF6FF';},
                              onMouseLeave:e=>{e.currentTarget.style.background='';} },
                              h('td',{style:{padding:'12px 16px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none',fontWeight:700,fontSize:'14px',whiteSpace:'nowrap'}},r.label),
                              h('td',{style:{padding:'12px 16px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none',fontSize:'14px',color:'#6B6B6B',lineHeight:1.45}},r.desc),
                              h('td',{style:{padding:'12px 16px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none'}},
                                isBt?h('span',{style:{color:'#AAAAAA',fontSize:'13px'}},'—')
                                  :h('span',{style:{display:'inline-flex',alignItems:'center',gap:'4px',background:'#F3EBFE',border:'1px solid #C4A0F0',borderRadius:'999px',padding:'3px 10px',fontSize:'12px',fontWeight:600,color:'#5514B4'}},
                                      ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:11,c:'#7B3FD4'}),
                                      String((r.permSets||[]).length)+' sets')),
                              h('td',{style:{padding:'12px 16px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none',textAlign:'right',fontSize:'14px',color:'#5514B4',fontWeight:700}},
                                isBt?String(r.users):String(users.filter(u=>u.roleKey===r.key).length))))))))),
                  activeTab==='permSets'&&!isBt&&h('div',{style:{padding:'20px 24px'}},
                    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}},
                      h('p',{style:{fontSize:'14px',color:'#6B6B6B',lineHeight:1.55,margin:0,maxWidth:'600px'}},'Permission sets are the building blocks of roles. Each set represents a specific capability — administrators combine them into roles that match how people work.'),
                      h('button',{onClick:()=>showToast('info','Permission set creation is in development. You\'ll be able to define new capabilities and add them to any role.'),style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',flexShrink:0,marginLeft:'20px'}},
                        ic('M12 5v14M5 12h14',{s:14,c:'#fff'}),'Create permission set')),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'24px'}},
                      PSET_GROUPS.map(g=>{
                        const gSets=PERMISSION_SETS.filter(p=>p.group===g);
                        const rolesUsingGroup=ROLES.filter(r=>(r.permSets||[]).some(pk=>gSets.find(p=>p.key===pk)));
                        if(gSets.length===0)return null;
                        return h('div',{key:g},
                          h('div',{style:{fontSize:'11px',fontWeight:700,color:'#808080',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'12px'}},g),
                          h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                            gSets.map(ps=>{
                              const psRoles=ROLES.filter(r=>(r.permSets||[]).includes(ps.key));
                              return h('div',{key:ps.key,style:{border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'16px',background:'#fff'}},
                                h('div',{style:{width:'36px',height:'36px',borderRadius:'8px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                                  ic('M20 6 9 17l-5-5',{s:15,c:'#5514B4',w:2.5})),
                                h('div',{style:{flex:1,minWidth:0}},
                                  h('div',{style:{fontWeight:700,fontSize:'14px',marginBottom:'2px'}},ps.label),
                                  h('div',{style:{fontSize:'13px',color:'#6B6B6B'}},ps.desc)),
                                h('div',{style:{flexShrink:0,textAlign:'right'}},
                                  h('div',{style:{fontSize:'11px',color:'#808080',marginBottom:'5px',fontWeight:600}},psRoles.length===0?'Not used in any role':psRoles.length===1?'Used in 1 role':'Used in '+psRoles.length+' roles'),
                                  h('div',{style:{display:'flex',flexWrap:'wrap',gap:'4px',justifyContent:'flex-end'}},
                                    psRoles.slice(0,3).map(r=>h('span',{key:r.key,style:{display:'inline-block',background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'999px',padding:'2px 8px',fontSize:'11px',fontWeight:600,color:'#434343'}},r.label)),
                                    psRoles.length>3&&h('span',{style:{display:'inline-block',background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'999px',padding:'2px 8px',fontSize:'11px',fontWeight:600,color:'#808080'}},'+'+String(psRoles.length-3)+' more'))));
                            })));
                      }))),
                  (activeTab==='userRoles'||activeTab==='resellerAdmins')&&(isBt
                    ?h('div',null,
                        h('p',{style:{fontSize:'14px',color:'#6B6B6B',lineHeight:1.55,margin:'0 24px 16px'}},'These are the named administrators across your reseller network. Each reseller needs an active administrator before their users and downstream organisations can be managed.'),
                        h('div',{style:{borderTop:'1px solid #E8E8E8',marginBottom:'12px'}},
                          h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 120px',padding:'12px 16px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',fontSize:'12px',fontWeight:600,color:'#434343'}},'Organisation','Administrator','Email','Status'),
                          orgs.filter(o=>o.typeKey==='reseller').map(o=>{
                            const admin=users.find(u=>u.orgId===o.id&&u.roleKey==='admin');
                            const sc=admin?statusMap[admin.status]||statusMap.Active:null;
                            return h('div',{key:o.id,style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 120px',padding:'13px 20px',borderBottom:'1px solid #F0F0F0',alignItems:'center'}},
                              h('div',{style:{fontWeight:700,fontSize:'14px'}},o.name),
                              admin
                                ?h('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
                                    h('div',{style:{width:'28px',height:'28px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'12px',flexShrink:0}},initials(admin.name)),
                                    h('div',{style:{fontSize:'14px',fontWeight:600}},admin.name))
                                :h('div',{style:{fontSize:'14px',color:'#AAAAAA'}},'No admin set'),
                              h('div',{style:{fontSize:'12px',color:'#808080'}},admin?admin.email:'—'),
                              admin&&sc
                                ?h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'3px 9px',fontSize:'12px',fontWeight:700,color:sc[0],background:sc[1],width:'fit-content'}},
                                    h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),admin.status)
                                :h('span',null,'—'));
                          })),
                        h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px 18px',display:'flex',gap:'12px',alignItems:'flex-start'}},
                          h('span',{style:{color:'#808080',flexShrink:0,marginTop:'1px'}},ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:15,c:'#808080'})),
                          h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.5}},"Day-to-day user roles within each reseller — such as Order Manager, Billing Manager and Support — are set and managed by each reseller's own administrator. You don't configure those from here.")))
                    :h('div',null,
                        h('p',{style:{fontSize:'14px',color:'#6B6B6B',lineHeight:1.55,margin:'0 24px 16px'}},'This shows what each role in your organisation can access. Use it when deciding which role to assign to a new team member, or to check what someone currently has access to.'),
                        h('div',{style:{display:'flex',gap:'16px',alignItems:'center',marginBottom:'12px',fontSize:'12px',color:'#6B6B6B',padding:'0 24px'}},
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'8px'}},h(CellMark,{v:'y'}),'Full access'),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'8px'}},h(CellMark,{v:'p'}),'Partial access'),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'8px'}},h(CellMark,{v:'n'}),'No access')),
                        h('div',{style:{borderTop:'1px solid #E8E8E8',overflowX:'auto'}},h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'820px'}},
                            h('thead',null,h('tr',null,
                              h('th',{style:{textAlign:'left',padding:'12px 16px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',color:'#434343'}},'Permission area'),
                              ROLE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'11px 8px',fontSize:'12px',fontWeight:600,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'96px',color:'#434343'}},hd)))),
                            h('tbody',null,ROLE_ROWS.map((row,ri)=>h('tr',{key:ri},
                              h('td',{style:{textAlign:'left',padding:'12px 16px',fontSize:'14px',fontWeight:700,borderBottom:'1px solid #F0F0F0'}},row[0]),
                              row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'13px 8px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))))),
                  activeTab==='whoHasAccess'&&h('div',null,
                    h('p',{style:{fontSize:'14px',color:'#6B6B6B',lineHeight:1.55,margin:'0 24px 16px'}},isBt
                      ?'A complete breakdown of which platform capabilities each organisation type in your network can access.'
                      :'A complete breakdown of which permission areas each role in your organisation can access. Use this to understand what you\'re granting when you assign someone a role.'),
                    whoHasAccessPanel)));
            })()),



        // User Wizard
        userWiz&&h('div',{onClick:()=>setUserWiz(null),style:{position:'fixed',inset:0,background:'rgba(20,10,40,0.42)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px',zIndex:50}},
          h('div',{onClick:e=>e.stopPropagation(),style:{background:'#fff',borderRadius:'20px',width:'680px',maxWidth:'100%',maxHeight:'90vh',display:'flex',flexDirection:'column',overflow:'hidden'}},
            h('div',{style:{padding:'24px 28px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
              h('div',null,
                h('div',{style:{fontSize:'20px',fontWeight:700}},'Invite a user'),
                h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'2px'}},'Step '+userWiz.step+' of 3 · '+['Details','Access','Review'][userWiz.step-1])),
              h('button',{onClick:()=>setUserWiz(null),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
            h('div',{style:{height:'4px',background:'#F0F0F0'}},h('div',{style:{height:'100%',background:'#5514B4',width:Math.round(userWiz.step/3*100)+'%',transition:'width 240ms ease'}})),
            h('div',{style:{padding:'24px',overflowY:'auto',flex:1}},
              userWiz.step===1&&h('div',null,
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Full name'),
                h('input',{value:userWiz.name,onChange:e=>setUserWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Morgan Hale',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit'}}),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Email address'),
                h('input',{value:userWiz.email,onChange:e=>setUserWiz(w=>({...w,email:e.target.value})),placeholder:'morgan.hale@northgate.co.uk',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit'}}),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},h('span',null,'Phone number '),h('span',{style:{fontWeight:400,color:'#808080'}},'(optional)')),
                h('input',{value:userWiz.phone,onChange:e=>setUserWiz(w=>({...w,phone:e.target.value})),placeholder:'+44 7700 900000',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit'}}),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Organisation'),
                h('select',{value:userWiz.orgId,onChange:e=>setUserWiz(w=>({...w,orgId:e.target.value})),style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',background:'#fff',cursor:'pointer',fontFamily:'inherit'}},
                  [orgById('northgate'),...childrenOf('northgate')].map(o=>h('option',{key:o.id,value:o.id},o.name+' · '+TYPE_LABELS[o.typeKey])))),
              userWiz.step===2&&h('div',null,
                h('div',{style:{marginBottom:'20px'}},
                  h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Profile type'),
                  h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
                    [['admin','Administrator','Full access to all platform features'],['regular','Regular user','Assign specific permissions and tools']].map(([pt,lbl,desc])=>
                      h('button',{key:pt,onClick:()=>setUserWiz(w=>({...w,profileType:pt,role:pt==='admin'?'admin':w.role==='admin'?'orderManager':w.role})),style:{padding:'13px',borderRadius:'10px',border:'1px solid '+(userWiz.profileType===pt?'#5514B4':'#E3E3E3'),background:userWiz.profileType===pt?'#FAF6FF':'#fff',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}},
                        h('span',{style:{display:'block',fontWeight:700,fontSize:'14px',color:userWiz.profileType===pt?'#5514B4':'#1A1A1A'}},lbl),
                        h('span',{style:{display:'block',fontSize:'12px',color:'#808080',marginTop:'3px',lineHeight:1.35}},desc))))),
                h('div',{style:{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:'32px'}},
                  h('div',null,
                    h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},userWiz.profileType==='admin'?'Role':'Assign a role'),
                    userWiz.profileType==='admin'
                      ?h('div',{style:{padding:'12px 13px',borderRadius:'11px',border:'1px solid #5514B4',background:'#FAF6FF'}},
                          h('span',{style:{display:'block',fontWeight:700,fontSize:'14px',color:'#5514B4'}},'Administrator'),
                          h('span',{style:{display:'block',fontSize:'12px',color:'#808080',lineHeight:1.35,marginTop:'4px'}},'Manages users, billing, orders and all platform settings'))
                      :h('div',{style:{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'280px',overflowY:'auto',paddingRight:'4px'}},
                          (()=>{const tOrg=orgById(userWiz.orgId);const isSub=tOrg&&tOrg.typeKey==='subReseller';return ROLES.filter(r=>r.key!=='admin').map(r=>{const blocked=isSub&&r.key==='billingManager';const active=userWiz.role===r.key;return blocked?h('div',{key:r.key,style:{display:'flex',alignItems:'flex-start',gap:'12px',width:'100%',padding:'12px 13px',borderRadius:'11px',border:'1px solid #E3E3E3',background:'#FAFAFA',opacity:0.7}},ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10',{s:16,c:'#C8C8C8'}),h('span',{style:{textAlign:'left'}},h('span',{style:{display:'block',fontWeight:700,fontSize:'14px',color:'#C8C8C8'}},r.label),h('span',{style:{display:'block',fontSize:'11px',color:'#C8C8C8',lineHeight:1.35,marginTop:'2px'}},'Not available — Sub-Reseller orgs are blocked from billing access (PRD §17.2)'))):h('button',{key:r.key,onClick:()=>setUserWiz(w=>({...w,role:r.key})),style:{display:'flex',alignItems:'flex-start',gap:'12px',width:'100%',padding:'12px 13px',borderRadius:'11px',cursor:'pointer',border:'1px solid '+(active?'#5514B4':'#E3E3E3'),background:active?'#FAF6FF':'#fff',fontFamily:'inherit'}},h('span',{style:{width:'19px',height:'19px',borderRadius:'999px',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',background:active?'#5514B4':'#fff',border:'1px solid '+(active?'#5514B4':'#C8C8C8')}},active&&h('span',{style:{width:'10px',height:'10px',borderRadius:'999px',background:'#fff'}})),h('span',{style:{textAlign:'left'}},h('span',{style:{display:'block',fontWeight:700,fontSize:'14px'}},r.label),h('span',{style:{display:'block',fontSize:'12px',color:'#808080',lineHeight:1.35}},r.desc)));})})()),
                  h('div',null,
                    h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Permissions granted'),
                    h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'16px',maxHeight:'280px',overflowY:'auto'}},
                      h('div',{style:{fontWeight:700,fontSize:'14px',marginBottom:'12px'}},(ROLES.find(r=>r.key===(userWiz.profileType==='admin'?'admin':userWiz.role))||ROLES[0]).label),
                      (ROLES.find(r=>r.key===(userWiz.profileType==='admin'?'admin':userWiz.role))||ROLES[0]).grants.map((pm,i)=>
                        h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'flex-start',fontSize:'12px',marginBottom:'8px'}},
                          ic('M20 6 9 17l-5-5',{s:14,c:'#5514B4',w:2.4}),h('span',null,pm))))))),
              userWiz.step===3&&h('div',null,
                h('div',{style:{display:'flex',alignItems:'center',gap:'16px',marginBottom:'20px'}},
                  h('div',{style:{width:'52px',height:'52px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'20px',flexShrink:0}},initials(userWiz.name||'?')),
                  h('div',null,h('div',{style:{fontWeight:700,fontSize:'16px'}},userWiz.name||'(unnamed)'),h('div',{style:{fontSize:'14px',color:'#808080'}},userWiz.email))),
                h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'12px'}},
                  [['Profile type',userWiz.profileType==='admin'?'Administrator':'Regular user'],['Role',(ROLES.find(r=>r.key===(userWiz.profileType==='admin'?'admin':userWiz.role))||ROLES[0]).label],['Organisation',(orgById(userWiz.orgId)||{name:'—'}).name],...(userWiz.phone?[['Phone',userWiz.phone]]:[])].map(([k,v],i)=>
                    h('div',{key:k,style:{display:'flex',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #F0F0F0'}},
                      h('span',{style:{color:'#808080',fontSize:'14px'}},k),h('span',{style:{fontWeight:700,fontSize:'14px'}},v))),
                  h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px'}},
                    h('span',{style:{color:'#808080',fontSize:'14px'}},'Status on creation'),
                    h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#FDF0C4',color:'#2A2A2A',borderRadius:'1000px',padding:'4px 11px',fontSize:'12px',fontWeight:700}},h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),'Invited'))),
                h('div',{style:{fontSize:'12px',color:'#808080',lineHeight:1.5}},'An invitation email will be sent. The user gains access once they accept and set a password.'))),
            h('div',{style:{padding:'20px 28px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center'}},
              h('button',{onClick:()=>setUserWiz(w=>({...w,step:Math.max(1,w.step-1)})),style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',visibility:userWiz.step===1?'hidden':'visible',fontFamily:'inherit'}},'Back'),
              h('button',{onClick:()=>{
                if(userWiz.step<3){setUserWiz(w=>({...w,step:w.step+1}));return;}
                const o=orgById(userWiz.orgId);const id='nu'+seq;
                const rk=userWiz.profileType==='admin'?'admin':userWiz.role;
                const user={id,name:userWiz.name.trim()||'New user',email:userWiz.email.trim()||'—',phone:userWiz.phone.trim()||'',roleKey:rk,orgId:userWiz.orgId,status:'Invited'};
                setUsers(us=>[...us,user]);setSeq(n=>n+1);setUserWiz(null);setScreen('users');
                showToast('success','Invitation sent to '+user.name+' as '+roleLabel(rk)+' at '+(o?o.name:'Northgate Telecom')+'.');
              },style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 24px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},userWiz.step===3?'Send invitation':'Continue')))),

        // User profile drawer
        userDrawer&&drawerUser&&screen!=='users'&&h('div',{style:{position:'fixed',inset:0,zIndex:60,display:'flex'}},
          h('div',{onClick:()=>closeUserDrawer(),style:{flex:1,background:'rgba(20,10,40,0.42)'}}),
          h('div',{style:{width:'420px',background:'#fff',display:'flex',flexDirection:'column',overflowY:'auto',boxShadow:'-16px 0 40px rgba(20,10,40,0.18)'}},
            h('div',{style:{padding:'24px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}},
              h('div',{style:{fontWeight:700,fontSize:'20px'}},'User profile'),
              h('button',{onClick:()=>closeUserDrawer(),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
            h('div',{style:{padding:'24px',flex:1}},
              h('div',{style:{display:'flex',alignItems:'center',gap:'16px',marginBottom:'24px'}},
                h('div',{style:{width:'60px',height:'60px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'20px',flexShrink:0}},initials(drawerUser.name)),
                h('div',null,
                  h('div',{style:{fontWeight:700,fontSize:'20px'}},drawerUser.name),
                  h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'3px'}},drawerUser.email),
                  drawerUser.isPrimary&&h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#E8F1FB',color:'#1A4070',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700,marginTop:'8px'}},
                    ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:12,c:'#1A4070'}),'Primary contact'))),
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'24px'}},
                h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px'}},
                  h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},'Status'),
                  h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',borderRadius:'999px',padding:'5px 12px',fontSize:'14px',fontWeight:700,color:(statusMap[drawerUser.status]||statusMap.Active)[0],background:(statusMap[drawerUser.status]||statusMap.Active)[1]}},
                    h('span',{style:{width:'7px',height:'7px',borderRadius:'999px',background:'currentColor'}}),drawerUser.status)),
                h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px'}},
                  h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'8px'}},'Organisation'),
                  h('div',{style:{fontWeight:700,fontSize:'14px'}},drawerOrg?drawerOrg.name:'—'))),
              drawerRole&&(()=>{
                const previewKey=drawerPendingRole??drawerUser.roleKey;
                const previewRole=ROLES.find(r=>r.key===previewKey)||drawerRole;
                const isPreviewing=previewKey!==drawerUser.roleKey;
                return h('div',null,
                  h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}},
                    h('div',null,
                      h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343'}},
                        isPreviewing?'Role preview':'Current role'),
                      !isPreviewing&&drawerUser.roleDate&&h('div',{style:{fontSize:'12px',color:'#AAAAAA',marginTop:'2px'}},'Since '+drawerUser.roleDate)),
                    isPreviewing&&h('span',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'#5514B4',background:'#F3EBFE',padding:'3px 8px',borderRadius:'6px'}},'Preview')),
                  h('div',{style:{background:'#FAF6FF',border:'2px solid '+(isPreviewing?'#8B44D4':'#5514B4'),borderRadius:'14px',padding:'18px',marginBottom:'16px',transition:'border-color 0.15s'}},
                    h('div',{style:{display:'flex',gap:'12px',alignItems:'center',marginBottom:'12px'}},
                      h('span',{style:{width:'36px',height:'36px',borderRadius:'9px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:17})),
                      h('div',null,
                        h('div',{style:{fontWeight:700,fontSize:'16px'}},previewRole.label),
                        h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},previewRole.desc))),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'6px'}},
                      previewRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'center',fontSize:'12px',color:'#3F187F'}},
                        ic('M20 6 9 17l-5-5',{s:13,c:'#5514B4',w:2.4}),g)))),
                  canAdmin&&h('div',null,
                    h('div',{style:{fontSize:'12px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Change role'),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                      ROLES.map(r=>h('button',{key:r.key,
                        onClick:()=>setDrawerPendingRole(r.key===drawerUser.roleKey&&!isPreviewing?null:r.key),
                        style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'10px 12px',border:'1px solid '+(r.key===previewKey?'#5514B4':'#E3E3E3'),borderRadius:'9px',background:r.key===previewKey?'#FAF6FF':'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}},
                        h('span',{style:{width:'18px',height:'18px',borderRadius:'999px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:r.key===previewKey?'#5514B4':'#fff',border:'1px solid '+(r.key===previewKey?'#5514B4':'#C8C8C8')}},
                          r.key===previewKey&&h('span',{style:{width:'9px',height:'9px',borderRadius:'999px',background:'#fff'}})),
                        h('div',{style:{flex:1,minWidth:0}},
                          h('span',{style:{fontWeight:700,fontSize:'14px',color:r.key===previewKey?'#5514B4':'#2A2A2A'}},r.label),
                          r.key===drawerUser.roleKey&&h('span',{style:{marginLeft:'8px',fontSize:'12px',fontWeight:700,color:'#036C01',background:'#E6F4E5',border:'1px solid #A3D9A1',padding:'2px 7px',borderRadius:'1000px'}},'Current'))))),
                    h('button',{
                      onClick:()=>{
                        if(!isPreviewing)return;
                        setUsers(us=>us.map(u=>u.id===drawerUser.id?{...u,roleKey:previewKey}:u));
                        closeUserDrawer();
                        showToast('success',drawerUser.name+' changed to '+previewRole.label+'.');
                      },
                      style:{padding:'11px 26px',marginTop:'12px',background:isPreviewing?'#5514B4':'#D9C9F5',color:'#fff',border:0,borderRadius:'32px',fontWeight:700,fontSize:'14px',cursor:isPreviewing?'pointer':'default',fontFamily:'inherit',opacity:isPreviewing?1:0.55}},
                      'Confirm role change')))
              })()))),

          screen==='accountSettings'&&persona!=='user'&&(()=>{
            const STABS=[
              {key:'profile',label:'My profile',icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8'},
              {key:'activityLog',label:'Activity log',icon:'M18 20V10M12 20V4M6 20v-6'},
              {key:'preferences',label:'Preferences',icon:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'},
              {key:'helpSupport',label:'Help & support',icon:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'},
            ];
            const STAB_CONTENT={
              profile:{title:'My profile',desc:'Manage your personal information, contact details and profile photo.',icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8'},
              activityLog:{title:'Activity log',desc:'A record of all actions taken under your account across the platform.',icon:'M18 20V10M12 20V4M6 20v-6'},
              preferences:{title:'Preferences',desc:'Configure your notification settings, display options and default views.',icon:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'},
              helpSupport:{title:'Help & support',desc:'Access documentation, contact support and browse FAQs.',icon:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'},
            };
            const cur=STAB_CONTENT[settingsTab]||STAB_CONTENT.profile;
            return h('div',{style:{maxWidth:'860px'}},
              h('div',{style:{display:'flex',gap:'8px',borderBottom:'1px solid #E3E3E3',marginBottom:'28px'}},
                STABS.map(t=>h('button',{key:t.key,onClick:()=>setSettingsTab(t.key),style:{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 16px',background:'none',border:'none',borderBottom:settingsTab===t.key?'2px solid #2A1C4A':'1px solid #C8C8C8',marginBottom:'-1px',color:settingsTab===t.key?'#2A1C4A':'#5514B4',fontWeight:settingsTab===t.key?700:400,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}},
                  ic(t.icon,{s:15,c:settingsTab===t.key?'#1A1A1A':'#5514B4'}),t.label))),
              h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'52vh'}},
                h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',textAlign:'center',maxWidth:'440px',width:'100%'}},
                  h('div',{style:{width:'52px',height:'52px',borderRadius:'14px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:'#5514B4'}},
                    ic(cur.icon,{s:24})),
                  h('div',{style:{fontWeight:700,fontSize:'16px',color:'#2A2A2A',marginBottom:'8px'}},cur.title),
                  h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.6,marginBottom:'6px'}},cur.desc),
                  h('div',{style:{fontSize:'12px',color:'#AAAAAA',marginTop:'4px'}},'Content coming soon'))));
          })(),

          screen==='helpSupport'&&h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}},
            h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'32px',textAlign:'center',maxWidth:'440px',width:'100%'}},
              h('div',{style:{width:'56px',height:'56px',borderRadius:'20px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:'#5514B4'}},
                ic(['M3 18v-6a9 9 0 0 1 18 0v6','M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'],{s:26})),
              h('div',{style:{fontWeight:700,fontSize:'20px',color:'#2A2A2A',marginBottom:'12px'}},'Coming soon'),
              h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.6,maxWidth:'340px'}},'Help and support resources are on their way. In the meantime, contact your BT Wholesale account manager for assistance.'))),

        // Deactivate confirmation
        deactivateConfirm&&(()=>{
          const dUser=users.find(u=>u.id===deactivateConfirm);
          return dUser?h('div',{onClick:()=>setDeactivateConfirm(null),style:{position:'fixed',inset:0,background:'rgba(20,10,40,0.42)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px',zIndex:70}},
            h('div',{onClick:e=>e.stopPropagation(),style:{background:'#fff',borderRadius:'20px',width:'440px',maxWidth:'100%',padding:'28px'}},
              h('div',{style:{width:'48px',height:'48px',borderRadius:'12px',background:'#FEF6DE',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px'}},
                ic(['M18 8h1a4 4 0 0 1 0 8h-1','M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z','M6 1v3','M10 1v3','M14 1v3'],{s:22,c:'#8A5A00'})),
              h('div',{style:{fontSize:'16px',fontWeight:700,marginBottom:'8px'}},'Deactivate user?'),
              h('div',{style:{fontSize:'14px',color:'#434343',lineHeight:1.5,marginBottom:'6px'}},'You are about to deactivate ',h('b',null,dUser.name),'. They will lose access to the portal immediately.'),
              h('div',{style:{fontSize:'14px',color:'#808080',marginBottom:'24px'}},'You can reactivate them at any time from their profile.'),
              h('div',{style:{display:'flex',gap:'12px',justifyContent:'flex-end'}},
                h('button',{onClick:()=>setDeactivateConfirm(null),style:{padding:'11px 20px',border:'1px solid #E3E3E3',borderRadius:'32px',fontWeight:700,fontSize:'14px',cursor:'pointer',background:'#fff',fontFamily:'inherit'}},'Cancel'),
                h('button',{onClick:()=>{
                  setUsers(us=>us.map(u=>u.id===deactivateConfirm?{...u,status:'Inactive'}:u));
                  setDeactivateConfirm(null);
                  showToast('success',dUser.name+' has been deactivated. Reactivate from their profile.');
                },style:{padding:'12px 20px',border:0,borderRadius:'32px',fontWeight:700,fontSize:'14px',cursor:'pointer',background:'#8A5A00',color:'#fff',fontFamily:'inherit'}},'Deactivate')))):null;
        })(),

        // Remove confirmation
        removeConfirm&&(()=>{
          const rUser=users.find(u=>u.id===removeConfirm);
          return rUser?h('div',{onClick:()=>setRemoveConfirm(null),style:{position:'fixed',inset:0,background:'rgba(20,10,40,0.42)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px',zIndex:70}},
            h('div',{onClick:e=>e.stopPropagation(),style:{background:'#fff',borderRadius:'20px',width:'440px',maxWidth:'100%',padding:'28px'}},
              h('div',{style:{width:'48px',height:'48px',borderRadius:'12px',background:'#FDECEC',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px'}},
                ic(['M3 6h18','M8 6V4h8v2','M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],{s:22,c:'#A0121B'})),
              h('div',{style:{fontSize:'16px',fontWeight:700,marginBottom:'8px'}},'Remove user?'),
              h('div',{style:{fontSize:'14px',color:'#434343',lineHeight:1.5,marginBottom:'6px'}},'You are about to permanently remove ',h('b',null,rUser.name),' from the platform.'),
              h('div',{style:{fontSize:'14px',fontWeight:700,color:'#A0121B',marginBottom:'24px'}},'This cannot be undone.'),
              h('div',{style:{display:'flex',gap:'12px',justifyContent:'flex-end'}},
                h('button',{onClick:()=>setRemoveConfirm(null),style:{padding:'11px 20px',border:'1px solid #E3E3E3',borderRadius:'32px',fontWeight:700,fontSize:'14px',cursor:'pointer',background:'#fff',fontFamily:'inherit'}},'Cancel'),
                h('button',{onClick:()=>{
                  const name=rUser.name;
                  setUsers(us=>us.filter(u=>u.id!==removeConfirm));
                  setRemoveConfirm(null);
                  setUserDrawer(null);
                  showToast('success',name+' has been removed.');
                },style:{padding:'12px 20px',border:0,borderRadius:'32px',fontWeight:700,fontSize:'14px',cursor:'pointer',background:'#A0121B',color:'#fff',fontFamily:'inherit'}},'Remove')))):null;
        })(),

        // Org wizard drawer
        orgWiz&&h('div',{style:{position:'fixed',inset:0,zIndex:60,display:'flex'}},
          h('div',{onClick:()=>setOrgWiz(null),style:{flex:1,background:'rgba(20,10,40,0.42)'}}),
          h('div',{style:{width:'540px',background:'#fff',display:'flex',flexDirection:'column',boxShadow:'-16px 0 40px rgba(20,10,40,0.18)'}},
            // Header
            h('div',{style:{padding:'24px 28px',borderBottom:'1px solid #E3E3E3',flexShrink:0}},
              h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}},
                h('div',null,
                  h('div',{style:{fontSize:'20px',fontWeight:700}},isBt?'Create reseller':'Create organisation'),
                  h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'2px'}},'Step '+orgWiz.step+' of 4 · '+['Details','Contacts','Entitlements','Review'][orgWiz.step-1])),
                h('button',{onClick:()=>setOrgWiz(null),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
              // Step progress bar
              h('div',{style:{display:'flex',alignItems:'center',gap:'0',maxWidth:'100%'}},
                ['Details','Contacts','Entitlements','Review'].map((label,i)=>{
                  const stepNum=i+1;const done=orgWiz.step>stepNum;const active=orgWiz.step===stepNum;
                  return h('div',{key:label,style:{display:'flex',alignItems:'center',flex:i<3?1:'auto'}},
                    h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}},
                      h('div',{style:{width:'24px',height:'24px',borderRadius:'999px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:done?'#5514B4':active?'#5514B4':'#F0F0F0',transition:'background 200ms'}},
                        done?ic('M20 6 9 17l-5-5',{s:12,c:'#fff',w:2.5}):h('span',{style:{fontSize:'12px',fontWeight:700,color:active?'#fff':'#808080'}},stepNum)),
                      h('span',{style:{fontSize:'12px',fontWeight:active||done?700:400,color:active?'#5514B4':done?'#5514B4':'#808080',whiteSpace:'nowrap'}},label)),
                    i<3&&h('div',{style:{flex:1,height:'2px',background:done?'#5514B4':'#E3E3E3',margin:'0 5px',marginBottom:'16px',transition:'background 200ms'}}));
                }))),
            // Body
            h('div',{style:{flex:1,overflowY:'auto',padding:'24px'}},
              orgWiz.step===1&&h('div',null,
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Organisation name'),
                h('input',{value:orgWiz.name,onChange:e=>setOrgWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Beacon Communications',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit',boxSizing:'border-box'}}),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},'Administrator email'),
                h('input',{value:orgWiz.email,onChange:e=>setOrgWiz(w=>({...w,email:e.target.value})),placeholder:'admin@organisation.co.uk',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'24px',fontFamily:'inherit',boxSizing:'border-box'}}),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'12px'}},'Organisation type'),
                h('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}},
                  childTypes().map(tk=>{
                    const active=orgWiz.type===tk;
                    return h('button',{key:tk,onClick:()=>setOrgWiz(w=>{const ent={};const p=wizParent();ENT.forEach(x=>{if(p.entitlements.includes(x.key)&&typeAllows(tk,x.key))ent[x.key]=true;});return{...w,type:tk,ent};}),style:{display:'flex',alignItems:'flex-start',gap:'12px',width:'100%',padding:'13px 14px',borderRadius:'11px',textAlign:'left',cursor:'pointer',border:'1px solid '+(active?'#5514B4':'#E3E3E3'),background:active?'#FAF6FF':'#fff',fontFamily:'inherit'}},
                      h('span',{style:{width:'20px',height:'20px',borderRadius:'999px',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',background:active?'#5514B4':'#fff',border:'1px solid '+(active?'#5514B4':'#C8C8C8')}},active&&h('span',{style:{width:'10px',height:'10px',borderRadius:'999px',background:'#fff'}})),
                      h('span',null,h('span',{style:{display:'block',fontWeight:700,fontSize:'14px'}},TYPE_LABELS[tk]),h('span',{style:{display:'block',fontSize:'12px',color:'#808080'}},TYPE_DESC[tk])));
                  }))),
              orgWiz.step===2&&(()=>{
                const fld=(label,key,placeholder,half)=>h('div',{style:{gridColumn:half?'span 1':'span 2'}},
                  h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'8px'}},label),
                  h('input',{value:orgWiz[key]||'',onChange:e=>setOrgWiz(w=>({...w,[key]:e.target.value})),placeholder,style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',fontFamily:'inherit',boxSizing:'border-box'}}));
                const sec=(title)=>h('div',{style:{gridColumn:'span 2',fontSize:'12px',fontWeight:500,color:'#808080',paddingTop:'8px',marginBottom:'-4px'}},title);
                return h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}},
                  sec('Primary contact'),fld('Name','primaryName','e.g. Sarah Whitfield',true),fld('Email','primaryEmail','sarah@organisation.co.uk',true),fld('Phone','primaryPhone','+44 1234 567 890',true),
                  sec('Billing contact'),fld('Name','billingName','e.g. Priya Nair',true),fld('Email','billingEmail','billing@organisation.co.uk',true),fld('Phone','billingPhone','+44 1234 567 891',true),
                  sec('Organisation'),fld('Registered address','address','14 Commerce Park, Milton Keynes, MK9 2EA',false),fld('Website','website','www.organisation.co.uk',false));
              })(),
              orgWiz.step===3&&h('div',null,
                h('div',{style:{display:'flex',gap:'12px',background:'#F3EBFE',border:'1px solid #E4D3FA',borderRadius:'12px',padding:'13px 15px',marginBottom:'24px'}},
                  h('span',{style:{color:'#5514B4',flexShrink:0}},ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:18})),
                  h('div',{style:{fontSize:'14px',color:'#3F187F',lineHeight:1.4}},'A ',h('b',null,TYPE_LABELS[orgWiz.type]),' can only inherit capabilities that ',h('b',null,wizParent().name),' already holds.')),
                ['product','service'].map(kind=>h('div',{key:kind},
                  h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},kind==='product'?'Products':'Services & capabilities'),
                  h('div',{style:{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'24px'}},
                    ENT.filter(e=>e.kind===kind).map(e=>{
                      const p=wizParent();const held=p.entitlements.includes(e.key);const allowed=typeAllows(orgWiz.type,e.key);const locked=!held||!allowed;const checked=!!orgWiz.ent[e.key]&&!locked;
                      return h('button',{key:e.key,onClick:()=>{if(!locked)setOrgWiz(w=>({...w,ent:{...w.ent,[e.key]:!w.ent[e.key]}}));},style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1px solid '+(checked?'#5514B4':'#E3E3E3'),background:locked?'#F7F7F7':'#fff',cursor:locked?'not-allowed':'pointer',fontFamily:'inherit'}},
                        h('span',{style:{width:'22px',height:'22px',borderRadius:'6px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:checked?'#5514B4':locked?'#EDEDED':'#fff',border:'1px solid '+(checked?'#5514B4':locked?'#E3E3E3':'#C8C8C8')}},checked&&ic('M20 6 9 17l-5-5',{s:13,c:'#fff',w:3})),
                        h('span',{style:{fontWeight:700,fontSize:'14px',color:locked?'#AAAAAA':'#2A2A2A'}},e.label),
                        h('span',{style:{flex:1}}),
                        locked&&h('span',{style:{fontSize:'12px',color:'#808080',display:'flex',gap:'4px',alignItems:'center'}},lockEl('#808080'),!held?'Not held by '+p.name:'N/A for '+TYPE_LABELS[orgWiz.type]));
                    }))))),
              orgWiz.step===4&&h('div',null,
                h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'20px'}},
                  [['Name',orgWiz.name||'(untitled)'],['Type',TYPE_LABELS[orgWiz.type]],['Admin email',orgWiz.email||'(none)'],['Parent',wizParent().name],['Primary contact',orgWiz.primaryName||(orgWiz.primaryEmail||'(none)')],['Billing contact',orgWiz.billingName||(orgWiz.billingEmail||'(none)')],['Website',orgWiz.website||'(none)']].map(([k,v],i,a)=>
                    h('div',{key:k,style:{display:'flex',justifyContent:'space-between',padding:'12px 16px',borderBottom:i<a.length-1?'1px solid #F0F0F0':'none'}},
                      h('span',{style:{color:'#808080',fontSize:'14px'}},k),h('span',{style:{fontWeight:700,fontSize:'14px'}},v)))),
                h('div',{style:{fontSize:'14px',fontWeight:500,color:'#434343',marginBottom:'12px'}},'Entitlements granted ('+Object.keys(orgWiz.ent).filter(k=>orgWiz.ent[k]).length+')'),
                h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                  Object.keys(orgWiz.ent).filter(k=>orgWiz.ent[k]).length===0
                    ?h('span',{style:{fontSize:'14px',color:'#808080'}},'None selected.')
                    :ENT.filter(e=>orgWiz.ent[e.key]).map(e=>h('span',{key:e.key,style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#E6F4E5',border:'1px solid #A3D9A1',color:'#036C01',borderRadius:'32px',padding:'6px 12px',fontSize:'14px',fontWeight:600}},ic('M20 6 9 17l-5-5',{s:12,c:'#357E3C',w:3}),e.label))))),
            // Footer
            h('div',{style:{padding:'20px 28px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}},
              h('button',{onClick:()=>{if(orgWiz.step===1)setOrgWiz(null);else setOrgWiz(w=>({...w,step:w.step-1}));},style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},orgWiz.step===1?'Cancel':'Back'),
              h('button',{onClick:()=>{
                if(orgWiz.step<4){setOrgWiz(w=>({...w,step:w.step+1}));return;}
                const p=wizParent();const id='org'+seq;const ents=Object.keys(orgWiz.ent).filter(k=>orgWiz.ent[k]);
                const org={id,name:orgWiz.name.trim()||'New organisation',typeKey:orgWiz.type,parentId:p.id,contact:orgWiz.email.trim()||'—',primaryName:orgWiz.primaryName||'',primaryEmail:orgWiz.primaryEmail||'',primaryPhone:orgWiz.primaryPhone||'',billingName:orgWiz.billingName||'',billingEmail:orgWiz.billingEmail||'',billingPhone:orgWiz.billingPhone||'',address:orgWiz.address||'',website:orgWiz.website||'',entitlements:ents};
                setOrgs(os=>[...os,org]);setSeq(n=>n+1);setOrgWiz(null);setSelOrgId(id);setScreen('orgs');
                showToast('success',org.name+' created as a '+TYPE_LABELS[orgWiz.type]+' under '+p.name+'.');
              },style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 24px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},orgWiz.step===4?'Create organisation':'Continue')))),

        // Role Wizard
        roleWiz&&h('div',{onClick:()=>setRoleWiz(null),style:{position:'fixed',inset:0,background:'rgba(20,10,40,0.42)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px',zIndex:55}},
          h('div',{onClick:e=>e.stopPropagation(),style:{background:'#fff',borderRadius:'20px',width:'720px',maxWidth:'100%',maxHeight:'90vh',display:'flex',flexDirection:'column',overflow:'hidden'}},
            h('div',{style:{padding:'24px 28px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
              h('div',null,
                h('div',{style:{fontSize:'20px',fontWeight:700}},'Create custom role'),
                h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'2px'}},'Step '+roleWiz.step+' of 3 · '+['Name & description','Permission sets','Review'][roleWiz.step-1])),
              h('button',{onClick:()=>setRoleWiz(null),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
            h('div',{style:{height:'4px',background:'#F0F0F0'}},h('div',{style:{height:'100%',background:'#5514B4',width:Math.round(roleWiz.step/3*100)+'%',transition:'width 240ms ease'}})),
            h('div',{style:{padding:'24px 28px',overflowY:'auto',flex:1}},
              roleWiz.step===1&&h('div',null,
                h('div',{style:{background:'#F7F3FF',border:'1px solid #D9C3F8',borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',display:'flex',gap:'10px',alignItems:'flex-start'}},
                  ic('M12 16v-4M12 8h.01',{s:16,c:'#5514B4'}),
                  h('div',{style:{fontSize:'13px',color:'#3D1070',lineHeight:1.5}},h('strong',null,'Custom roles use permission sets as building blocks.'),' Choose a name, then select which permission sets this role should include in step 2.')),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'6px'}},'Role name'),
                h('input',{value:roleWiz.name,onChange:e=>setRoleWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Regional Sales Manager',style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'16px',marginBottom:'20px',fontFamily:'inherit'}}),
                h('label',{style:{display:'block',fontSize:'14px',fontWeight:700,marginBottom:'6px'}},'Description'),
                h('textarea',{value:roleWiz.desc,onChange:e=>setRoleWiz(w=>({...w,desc:e.target.value})),placeholder:'What does this role allow the user to do?',rows:3,style:{width:'100%',padding:'12px 14px',border:'1px solid #6B6B6B',borderRadius:'8px',fontSize:'14px',fontFamily:'inherit',resize:'vertical'}})),
              roleWiz.step===2&&h('div',null,
                h('div',{style:{fontSize:'13px',color:'#808080',marginBottom:'16px'}},'Select the permission sets to include in this role. Sets are grouped by capability area.'),
                [
                  ['User & access management',['user_invite','user_deactivate','role_assign','role_create']],
                  ['Order management',['order_place','order_view','order_cancel','order_bulk']],
                  ['Billing & commercial',['billing_view','billing_manage','pricing_view','credit_request']],
                  ['Reporting & analytics',['reports_standard','reports_advanced','usage_export']],
                  ['Support',['fault_raise','fault_manage','ticket_view']],
                  ['Organisation management',['org_create','org_edit','org_entitlements']],
                  ['API access',['api_keys_manage','api_sandbox','api_production']],
                ].map(([group,sets])=>
                  h('div',{key:group,style:{marginBottom:'16px'}},
                    h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'8px'}},group),
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}},
                      sets.map(s=>{const on=!!roleWiz.permSets[s];return h('button',{key:s,onClick:()=>setRoleWiz(w=>({...w,permSets:{...w.permSets,[s]:!w.permSets[s]}})),style:{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'8px',border:'1px solid '+(on?'#5514B4':'#E3E3E3'),background:on?'#FAF6FF':'#fff',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}},
                        h('span',{style:{width:'17px',height:'17px',borderRadius:'4px',border:'1.5px solid '+(on?'#5514B4':'#C8C8C8'),background:on?'#5514B4':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},on&&ic('M20 6 9 17l-5-5',{s:11,c:'#fff',w:2.8})),
                        h('span',{style:{fontSize:'12px',fontWeight:on?700:400,color:on?'#5514B4':'#434343'}},s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())))})))))),
              roleWiz.step===3&&h('div',null,
                h('div',{style:{background:'#F7F7F7',borderRadius:'12px',padding:'16px 20px',marginBottom:'16px'}},
                  h('div',{style:{fontWeight:700,fontSize:'16px',marginBottom:'4px'}},roleWiz.name||'(unnamed)'),
                  roleWiz.desc&&h('div',{style:{fontSize:'13px',color:'#808080',marginBottom:'12px'}},roleWiz.desc),
                  h('div',{style:{fontSize:'12px',fontWeight:700,color:'#808080',marginBottom:'6px'}},'Permission sets included'),
                  Object.keys(roleWiz.permSets).filter(k=>roleWiz.permSets[k]).length===0
                    ?h('div',{style:{fontSize:'13px',color:'#C8C8C8'}},'No permission sets selected')
                    :h('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px'}},
                        Object.keys(roleWiz.permSets).filter(k=>roleWiz.permSets[k]).map(k=>
                          h('span',{key:k,style:{background:'#EDE8FA',color:'#5514B4',borderRadius:'1000px',padding:'3px 10px',fontSize:'12px',fontWeight:600}},k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))))),
                h('div',{style:{fontSize:'13px',color:'#808080',lineHeight:1.5}},'Once created, this role will appear in the role list and can be assigned to users. You can edit permission sets from the Roles & permissions tab.')))),
            h('div',{style:{padding:'20px 28px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center'}},
              h('button',{onClick:()=>setRoleWiz(w=>({...w,step:Math.max(1,w.step-1)})),style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'32px',padding:'12px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',visibility:roleWiz.step===1?'hidden':'visible',fontFamily:'inherit'}},'Back'),
              h('button',{onClick:()=>{
                if(roleWiz.step<3){setRoleWiz(w=>({...w,step:w.step+1}));return;}
                const sets=Object.keys(roleWiz.permSets).filter(k=>roleWiz.permSets[k]);
                const newRole={key:'custom_'+Date.now(),label:roleWiz.name||'Custom role',desc:roleWiz.desc,grants:sets.map(s=>s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())),custom:true};
                setCustomRoles(r=>[...r,newRole]);setRoleWiz(null);showToast('success','Custom role "'+newRole.label+'" created.');
              },style:{background:'#5514B4',color:'#fff',border:0,borderRadius:'32px',padding:'12px 24px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},roleWiz.step===3?'Create role':'Next →')))),

        // Toast
        toast&&h('div',{style:{position:'fixed',bottom:'24px',right:'24px',zIndex:80,display:'flex',alignItems:'center',gap:'12px',padding:'15px 18px',borderRadius:'14px',background:'#fff',border:'1px solid #E3E3E3',boxShadow:'0 12px 32px rgba(20,10,40,0.18)',maxWidth:'420px'}},
          h('span',{style:{width:'34px',height:'34px',borderRadius:'999px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',background:toast.kind==='success'?'#357E3C':toast.kind==='error'?'#DA020F':'#5514B4'}},
            toast.kind==='success'?ic('M20 6 9 17l-5-5',{s:18,c:'#fff',w:2.6}):toast.kind==='error'?lockEl('#fff'):ic(['M12 16v-4','M12 8h.01'],{s:18,c:'#fff'})),
          h('div',{style:{fontSize:'14px',color:'#2A2A2A',lineHeight:1.4,flex:1}},toast.msg),
          h('button',{onClick:()=>setToast(null),style:{border:0,background:'transparent',cursor:'pointer',color:'#AAAAAA',display:'flex',padding:'2px',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:16}))))));}




ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();

