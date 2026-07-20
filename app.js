
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
const ROLES=[
  {key:'admin',label:'Administrator',desc:'Full control of the organisation, its users and entitlements.',grants:['Manage organisation settings','Create, edit & remove users','Assign & change roles','Manage product entitlements','Billing, invoices & reporting','Support & API key management']},
  {key:'orderManager',label:'Order Manager',desc:'Places and manages product orders and faults.',grants:['View & place product orders','Modify & track orders','Raise & manage faults','Dashboard access']},
  {key:'billingManager',label:'Billing Manager',desc:'Manages invoices and billing reports.',grants:['View & download invoices','Run billing reports','Reporting & exports','View orders (read-only)']},
  {key:'support',label:'Support Agent',desc:'Handles faults and support tickets.',grants:['Raise, track & escalate tickets','Full fault management','View orders & products']},
  {key:'reporting',label:'Reporting Analyst',desc:'Read-only access to dashboards and reports.',grants:['Dashboard access','Export reports','View billing reports']},
  {key:'readonly',label:'Read-only User',desc:'Can view but never change anything.',grants:['View orders, products & invoices','View reports','No create, edit or delete']},
  {key:'apiDev',label:'API Developer',desc:'Integrates via API and manages keys.',grants:['API & sandbox access','Manage API keys','View products & orders']},
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
  bt:{key:'bt',name:'BT Wholesale Administrator',signedInAs:'BT Wholesale Administrator',crumb:'BT Wholesale · Platform administration',title:'Dashboard',
    person:{name:'Alex Morgan',meta:'BT Wholesale',avatar:'AM',photo:'https://randomuser.me/api/portraits/men/32.jpg'},accent:'#2A1C4A',
    desc:'You set up and govern the reseller network. Everything your resellers and their downstream organisations can do on the platform is based on what you define and grant here.',
    can:['Create and manage reseller organisations','Assign products and entitlements to resellers','Set up reseller administrators','Define platform-wide access rules for the whole network'],
    cannot:["Carry out a reseller's day-to-day order management"]},
  reseller:{key:'reseller',name:'Reseller Administrator',signedInAs:'Northgate Telecom Administrator',crumb:'Northgate Telecom · Reseller administration',title:'Dashboard',
    person:{name:'Sarah Whitfield',meta:'Northgate Telecom · Admin',avatar:'SW',photo:'https://randomuser.me/api/portraits/women/44.jpg'},accent:'#5514B4',
    desc:'You run the Northgate Telecom account. You manage your team, invite users, assign their roles, and build out your downstream network of sub-resellers, child resellers and dealers.',
    can:['Create sub-reseller, child reseller & dealer organisations','Invite team members and assign them roles','Control what downstream organisations can access','Set permissions for your downstream network'],
    cannot:["Access products Northgate Telecom hasn't been granted","Change BT platform-level settings"]},
  user:{key:'user',name:'Standard User',signedInAs:'Northgate Telecom Order Manager',crumb:'Northgate Telecom · Standard user',title:'Dashboard',
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
  ['Operations & orders','y','y','p','p','p','p','p'],
  ['Fault management','y','p','n','y','n','p','n'],
  ['Billing & invoices','y','n','y','n','p','p','n'],
  ['Reporting','y','p','y','p','y','p','n'],
  ['Support tickets','y','p','n','y','n','p','n'],
  ['API access','y','n','n','n','n','n','y'],
];
const INIT_ORGS=[
  {id:'btw',name:'BT Wholesale',typeKey:'root',parentId:null,contact:'platform@btwholesale.com',primaryName:'Claire Ashton',primaryEmail:'claire.ashton@btwholesale.com',primaryPhone:'+44 800 345 6789',billingName:'Richard Fenn',billingEmail:'richard.fenn@btwholesale.com',billingPhone:'+44 800 345 6790',address:'81 Newgate Street, London, EC1A 7AJ',website:'www.btwholesale.com',entitlements:['broadband','digitalVoice','strategicBroadband','ukFabric','hardware','kci','businessZone','fmsEmpirix','support','branding']},
  {id:'northgate',name:'Northgate Telecom',typeKey:'reseller',parentId:'btw',contact:'partners@northgate.co.uk',primaryName:'Sarah Whitfield',primaryEmail:'sarah.whitfield@northgate.co.uk',primaryPhone:'+44 1234 567 890',billingName:'Priya Nair',billingEmail:'priya.nair@northgate.co.uk',billingPhone:'+44 1234 567 891',address:'14 Commerce Park, Milton Keynes, MK9 2EA',website:'www.northgatetelecom.co.uk',entitlements:['broadband','digitalVoice','strategicBroadband','hardware','kci','businessZone','fmsEmpirix','support','branding']},
  {id:'beacon',name:'Beacon Wholesale Ltd',typeKey:'reseller',parentId:'btw',contact:'admin@beaconwholesale.co.uk',primaryName:'Tom Elsworth',primaryEmail:'tom.elsworth@beaconwholesale.co.uk',primaryPhone:'+44 208 900 1122',billingName:'Anna Kovacs',billingEmail:'anna.kovacs@beaconwholesale.co.uk',billingPhone:'+44 208 900 1123',address:'6 Beacon House, Bristol, BS1 4RN',website:'www.beaconwholesale.co.uk',entitlements:['broadband','digitalVoice','hardware','kci','support','branding']},
  {id:'metro',name:'Metro Connect',typeKey:'subReseller',parentId:'northgate',contact:'ops@metroconnect.co.uk',primaryName:'Marcus Webb',primaryEmail:'marcus.webb@metroconnect.co.uk',primaryPhone:'+44 161 234 5678',billingName:'Marcus Webb',billingEmail:'billing@metroconnect.co.uk',billingPhone:'+44 161 234 5679',address:'22 Northern Quarter, Manchester, M4 1HQ',website:'www.metroconnect.co.uk',entitlements:['broadband','digitalVoice','kci','branding']},
  {id:'halo',name:'Halo Networks',typeKey:'childReseller',parentId:'northgate',contact:'support@halonetworks.co.uk',primaryName:'Joanna Park',primaryEmail:'joanna.park@halonetworks.co.uk',primaryPhone:'+44 113 456 7890',billingName:'Finance Team',billingEmail:'finance@halonetworks.co.uk',billingPhone:'+44 113 456 7891',address:'Halo House, 5 Innovation Drive, Leeds, LS1 5AE',website:'www.halonetworks.co.uk',entitlements:['broadband','digitalVoice','strategicBroadband','hardware','kci','businessZone','fmsEmpirix','branding']},
  {id:'riverside',name:'Riverside Comms',typeKey:'subReseller',parentId:'northgate',contact:'hello@riverside-comms.co.uk',primaryName:'Dan Osei',primaryEmail:'dan.osei@riverside-comms.co.uk',primaryPhone:'+44 117 890 1234',billingName:'Dan Osei',billingEmail:'billing@riverside-comms.co.uk',billingPhone:'+44 117 890 1235',address:'Unit 3, Riverside Business Park, Bath, BA1 1RW',website:'www.riverside-comms.co.uk',entitlements:['broadband','kci','branding']},
  {id:'apex',name:'Apex Telecom',typeKey:'dealer',parentId:'northgate',contact:'sales@apextelecom.co.uk',primaryName:'Fatima Al-Rashid',primaryEmail:'fatima.alrashid@apextelecom.co.uk',primaryPhone:'+44 1908 123 456',billingName:'Accounts Dept',billingEmail:'accounts@apextelecom.co.uk',billingPhone:'+44 1908 123 457',address:'12 Apex Way, Northampton, NN1 2BP',website:'www.apextelecom.co.uk',entitlements:['broadband','branding']},
];
const INIT_USERS=[
  {id:'u1',name:'Sarah Whitfield',email:'sarah.whitfield@northgate.co.uk',roleKey:'admin',orgId:'northgate',status:'Active',roleDate:'Jan 2024',photo:'https://randomuser.me/api/portraits/women/44.jpg'},
  {id:'u2',name:'James Okafor',email:'james.okafor@northgate.co.uk',roleKey:'orderManager',orgId:'northgate',status:'Active',roleDate:'Mar 2024',photo:'https://randomuser.me/api/portraits/men/75.jpg'},
  {id:'u3',name:'Priya Nair',email:'priya.nair@northgate.co.uk',roleKey:'billingManager',orgId:'northgate',status:'Active',roleDate:'Mar 2024'},
  {id:'u4',name:'Tom Reeves',email:'tom.reeves@metroconnect.co.uk',roleKey:'support',orgId:'metro',status:'Active',roleDate:'Jun 2024',photo:'https://randomuser.me/api/portraits/men/41.jpg'},
  {id:'u5',name:'Lucy Chen',email:'lucy.chen@northgate.co.uk',roleKey:'reporting',orgId:'northgate',status:'Invited',roleDate:'May 2025',photo:'https://randomuser.me/api/portraits/women/63.jpg'},
  {id:'u6',name:'Daniel Frost',email:'daniel.frost@northgate.co.uk',roleKey:'apiDev',orgId:'northgate',status:'Active',roleDate:'Sep 2024'},
  {id:'u7',name:'Aisha Bello',email:'aisha.bello@apextelecom.co.uk',roleKey:'readonly',orgId:'apex',status:'Suspended',roleDate:'Nov 2023',photo:'https://randomuser.me/api/portraits/women/26.jpg'},
  {id:'u8',name:'Robert Haines',email:'robert.haines@beaconwholesale.co.uk',roleKey:'admin',orgId:'beacon',status:'Active',roleDate:'Feb 2024'},
];

function initials(n){ return (n||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?'; }
function badgeSt(typeKey){
  const base='font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;white-space:nowrap;';
  const m={root:'background:#5514B4;color:#fff',reseller:'background:#F3EBFE;color:#3F187F',childReseller:'background:rgba(46,66,127,0.12);color:#2E427F',subReseller:'background:#F7F7F7;color:#434343;border:1px solid #D9D9D9',dealer:'background:#fff;color:#6B6B6B;border:1px solid #E3E3E3'};
  return base+(m[typeKey]||m.subReseller);
}
function dotSt(typeKey){
  const c={root:'#2A2A2A',reseller:'#5514B4',childReseller:'#2E427F',subReseller:'#AAAAAA',dealer:'#C8C8C8'}[typeKey]||'#AAAAAA';
  return {width:'8px',height:'8px',borderRadius:'999px',flexShrink:0,background:c,display:'inline-block'};
}
function CellMark({v}){
  if(v==='y') return h('span',{style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'24px',height:'24px',borderRadius:'999px',background:'#F0F8EF'}},
    h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'#357E3C',strokeWidth:2.6,strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M20 6 9 17l-5-5'})));
  if(v==='p') return h('span',{style:{display:'inline-block',width:'9px',height:'9px',borderRadius:'999px',background:'#D88C00'}});
  return h('span',{style:{display:'inline-block',width:'14px',height:'2px',borderRadius:'2px',background:'#D9D9D9'}});
}

const BT_LOGO = h('svg',{width:34,height:34,viewBox:'0 0 40 40',fill:'currentColor'},
  h('path',{d:'M20.98 13.18h9.96v2.92h-3.34v10.68h-3.28V16.1h-3.34v-2.92zm-.98 24.36C10.32 37.54 2.46 29.68 2.46 20S10.32 2.46 20 2.46 37.54 10.32 37.54 20 29.68 37.54 20 37.54zM20 40c11.04 0 20-8.96 20-20S31.04 0 20 0 0 8.96 0 20s8.96 20 20 20zM16.62 22.62c0-.86-.54-1.44-1.46-1.44h-2.2v2.84h2.2c.92 0 1.46-.58 1.46-1.4zm-.4-5.46c0-.72-.46-1.22-1.24-1.22h-2.02v2.48h2.02c.78 0 1.24-.5 1.24-1.26zM19.94 22.78c0 2.58-1.82 4-4.42 4H9.72V13.18h5.42c2.62 0 4.4 1.34 4.4 3.8 0 1.12-.5 2.12-1.3 2.72.92.54 1.7 1.58 1.7 3.08z'}));

function NavBtn({id,icon,label,screen,setScreen,collapsed}){
  const active=screen===id;
  return h('button',{onClick:()=>setScreen(id),title:collapsed?label:undefined,
    style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:collapsed?'11px 0':'11px 12px',justifyContent:collapsed?'center':'flex-start',border:0,borderRadius:'11px',cursor:'pointer',fontSize:'14.5px',fontWeight:700,marginBottom:'3px',background:active?'rgba(255,255,255,0.18)':'transparent',color:'#fff',fontFamily:"inherit"}},
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
  const [rolesTab,setRolesTab]=useState('orgProfiles');
  const [userDrawer,setUserDrawer]=useState(null);
  const [auditCat,setAuditCat]=useState('Organisation management');
  const [menuOpen,setMenuOpen]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [bannerOpen,setBannerOpen]=useState(false);
  const [personaCardOpen,setPersonaCardOpen]=useState(false);
  const [overviewTab,setOverviewTab]=useState('network');
  const [userSearch,setUserSearch]=useState('');
  const [filterRole,setFilterRole]=useState('');
  const [filterOrg,setFilterOrg]=useState('');
  const [filterStatus,setFilterStatus]=useState('');
  const [orgSearch,setOrgSearch]=useState('');
  const [drawerPendingRole,setDrawerPendingRole]=useState(null);
  const [editingContact,setEditingContact]=useState(false);
  const [settingsTab,setSettingsTab]=useState('profile');
  const [avatarMenuOpen,setAvatarMenuOpen]=useState(false);
  const [contactDraft,setContactDraft]=useState(null);
  const [orgTypeFilter,setOrgTypeFilter]=useState('');
  const [orgSort,setOrgSort]=useState({col:'',dir:1});
  const [userSort,setUserSort]=useState({col:'',dir:1});

  function openUserDrawer(id){setUserDrawer(id);setDrawerPendingRole(null);}
  function closeUserDrawer(){setUserDrawer(null);setDrawerPendingRole(null);}
  const isBt=persona==='bt';
  const canAdmin=persona!=='user';
  const home=isBt?'btw':'northgate';
  const P=PERSONAS[persona];

  const orgById=id=>orgs.find(o=>o.id===id);
  const roleLabel=k=>{const r=ROLES.find(r=>r.key===k);return r?r.label:k;};
  const childrenOf=id=>orgs.filter(o=>o.parentId===id);
  const userCountFor=id=>users.filter(u=>u.orgId===id).length;
  const wizParent=()=>isBt?orgById('btw'):orgById('northgate');
  const childTypes=()=>isBt?['reseller']:['subReseller','childReseller','dealer'];
  const typeAllows=(tk,key)=>{
    if(tk==='reseller') return true;
    if(tk==='subReseller') return PRODUCT_KEYS.includes(key)||key==='kci'||key==='branding';
    if(tk==='childReseller') return key!=='support';
    if(tk==='dealer') return PRODUCT_KEYS.includes(key)||key==='branding';
    return true;
  };
  const defEnt=type=>{const p=wizParent(),e={};ENT.forEach(x=>{if(p.entitlements.includes(x.key)&&typeAllows(type,x.key))e[x.key]=true;});return e;};

  function setPsn(p){setPersonaState(p);setOrgWiz(null);setUserWiz(null);setSelOrgId(null);setSelRole(null);setUserDrawer(null);setPersonaCardOpen(false);setOverviewTab('network');}
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
  const statusMap={Active:['#1F5A26','#EAF6EA'],Invited:['#8A5A00','#FEF6DE'],Suspended:['#A0121B','#FDECEC']};

  function mkActionBtn(kind){
    const isOrg=kind==='org';
    const label=isOrg?(isBt?'Create reseller':'Create organisation'):'Invite user';
    const hint=isOrg?(isBt?'Set up a new reseller organisation':'Delegate access to a downstream org'):(isBt?'Add a user & assign them a role':'Add a team member & assign a role');
    const onClick=isOrg
      ?()=>{if(!canAdmin)return deny();const t=childTypes()[0];setOrgWiz({step:1,name:'',email:'',type:t,ent:defEnt(t)});}
      :()=>{if(!canAdmin)return deny();setUserWiz({step:1,name:'',email:'',orgId:'northgate',role:'orderManager'});};
    return {label,hint,onClick,
      rowStyle:{display:'flex',alignItems:'center',gap:'12px',width:'100%',borderRadius:'12px',padding:'13px 14px',marginBottom:'10px',textAlign:'left',border:'1px solid #E3E3E3',background:canAdmin?'#fff':'#F7F7F7',cursor:canAdmin?'pointer':'not-allowed',fontFamily:'inherit'},
      ctaStyle:{display:'inline-flex',alignItems:'center',gap:'8px',border:0,borderRadius:'999px',padding:'11px 18px',fontWeight:700,fontSize:'14px',whiteSpace:'nowrap',background:canAdmin?'#5514B4':'#EDEDED',color:canAdmin?'#fff':'#AAAAAA',cursor:canAdmin?'pointer':'not-allowed',fontFamily:'inherit'},
      iconBg:canAdmin?'#F3EBFE':'#EDEDED',iconFg:canAdmin?'#5514B4':'#AAAAAA'};
  }
  const createOrg=mkActionBtn('org');
  const inviteUser=mkActionBtn('user');

  function OrgChip({entKey}){
    const owned=sel.entitlements.includes(entKey);
    const e=ENT.find(x=>x.key===entKey);
    const owned_st={display:'inline-flex',alignItems:'center',gap:'6px',background:'#F0F8EF',border:'1px solid #BFE0BF',color:'#1F5A26',borderRadius:'7px',padding:'6px 11px',fontSize:'13px',fontWeight:700};
    const off_st={display:'inline-flex',alignItems:'center',gap:'6px',background:'#F7F7F7',border:'1px solid #E3E3E3',color:'#AAAAAA',borderRadius:'7px',padding:'6px 11px',fontSize:'13px',fontWeight:600};
    return h('span',{style:owned?owned_st:off_st},markEl(owned),e.label);
  }

  // pre-compute role detail + drawer data
  const selRoleObj=selRole?ROLES.find(r=>r.key===selRole):null;
  const selRoleUsers=selRole?users.filter(u=>u.roleKey===selRole):[];
  const selRoleColIdx=selRole?(ROLE_COL_MAP[selRole]??-1):-1;
  const drawerUser=userDrawer?users.find(u=>u.id===userDrawer):null;
  const drawerRole=drawerUser?ROLES.find(r=>r.key===drawerUser.roleKey):null;
  const drawerOrg=drawerUser?orgById(drawerUser.orgId):null;

  return h('div',{style:{display:'flex',flexDirection:'column',height:'100vh',width:'100%',overflow:'hidden',fontFamily:"'BT Curve',system-ui,sans-serif",color:'#2A2A2A',background:'#F0F0F0',fontSize:'16px',lineHeight:1.4,WebkitFontSmoothing:'antialiased'}},

    // Body row
    h('div',{style:{display:'flex',flex:1,overflow:'hidden'}},

      // Sidebar
      h('aside',{style:{width:sidebarOpen?'252px':'64px',flexShrink:0,background:'#5514B4',borderRight:'none',display:'flex',flexDirection:'column',padding:sidebarOpen?'22px 16px':'16px 8px',transition:'width 200ms ease',overflow:'hidden'}},
        // Toggle button — always at top, same position collapsed or expanded
        h('div',{style:{display:'flex',justifyContent:sidebarOpen?'flex-end':'center',marginBottom:'14px'}},
          h('button',{onClick:()=>setSidebarOpen(o=>!o),title:sidebarOpen?'Collapse menu':'Expand menu',
            style:{flexShrink:0,width:'28px',height:'28px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.12)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}},
            ic(sidebarOpen?'m15 18-6-6 6-6':'m9 18 6-6-6-6',{s:15,c:'#fff'}))),
        // Logo row
        sidebarOpen
          ?h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'22px',minWidth:0}},
              h('span',{style:{color:'#fff',display:'flex',flexShrink:0}},BT_LOGO),
              h('div',{style:{lineHeight:1.1,minWidth:0}},
                h('div',{style:{fontWeight:700,fontSize:'14px',whiteSpace:'nowrap',letterSpacing:'-0.01em',color:'#fff'}},'BT Wholesale'),
                h('div',{style:{fontSize:'11.5px',color:'rgba(255,255,255,0.65)',fontWeight:600,letterSpacing:'0.01em'}},'Platform Administration')))
          :h('div',null,
              h('span',{style:{color:'#fff',display:'flex',justifyContent:'center',marginBottom:'16px'}},BT_LOGO)),

        h('div',{style:{height:'1px',background:'rgba(255,255,255,0.15)',margin:'0 0 16px'}}),
        sidebarOpen&&h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',padding:'0 10px 8px'}},'Manage'),
        h(NavBtn,{id:'overview',screen,setScreen,label:'Dashboard',collapsed:!sidebarOpen,icon:h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},h('rect',{x:3,y:3,width:7,height:7,rx:'1.5'}),h('rect',{x:14,y:3,width:7,height:7,rx:'1.5'}),h('rect',{x:14,y:14,width:7,height:7,rx:'1.5'}),h('rect',{x:3,y:14,width:7,height:7,rx:'1.5'}))}),
        persona!=='user'&&h(NavBtn,{id:'orgs',screen,setScreen,label:'Organisations',collapsed:!sidebarOpen,icon:ic(['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18','M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2','M10 6h4M10 10h4M10 14h4'],{s:19})}),
        h(NavBtn,{id:'users',screen,setScreen,label:'Users',collapsed:!sidebarOpen,icon:ic([{el:'circle',cx:9,cy:7,r:4},'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],{s:19})}),
        h(NavBtn,{id:'roles',screen,setScreen,label:'Roles & permissions',collapsed:!sidebarOpen,icon:ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:19})}),
        h('div',{style:{marginTop:'auto'}}),
        h('div',{style:{height:'1px',background:'rgba(255,255,255,0.15)',margin:'8px 0'}}),
        sidebarOpen&&h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',padding:'0 10px 8px'}},'Switch view'),
        ...(['bt','reseller','user'].map(k=>{
          const labels={bt:'BT Wholesale Admin',reseller:'Reseller Admin',user:'Standard User'};
          const icons={bt:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',reseller:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',user:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8'};
          const active=persona===k;
          return h('button',{key:k,onClick:()=>setPsn(k),title:!sidebarOpen?labels[k]:undefined,
            style:{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:!sidebarOpen?'10px 0':'10px 12px',justifyContent:!sidebarOpen?'center':'flex-start',border:0,borderRadius:'11px',cursor:'pointer',fontSize:'13.5px',fontWeight:active?700:500,marginBottom:'3px',background:active?'rgba(255,255,255,0.18)':'transparent',color:active?'#fff':'rgba(255,255,255,0.6)',fontFamily:'inherit',transition:'background 150ms'}},
            ic(icons[k],{s:17,c:active?'#fff':'rgba(255,255,255,0.6)'}),
            sidebarOpen&&h('span',{style:{flex:1,textAlign:'left'}},labels[k]));
        }))),

      // Main
      h('main',{style:{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}},

        // Header
        h('header',{style:{height:'74px',flexShrink:0,background:'#fff',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',gap:'24px'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:'10px',minWidth:0}},
            h('div',{style:{width:'28px',height:'28px',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',background:isBt?'#2A1C4A':P.accent}},
              isBt?h('span',{style:{fontWeight:900,fontSize:'11px',letterSpacing:'-0.02em'}},'BT'):ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:14})),
            h('span',{style:{fontSize:'14px',color:'#434343',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},
              'Signed in as ',
              h('span',{style:{fontWeight:700,color:'#5514B4'}},P.signedInAs))),
          h('div',{style:{position:'relative',flexShrink:0}},
            h('button',{onClick:()=>setAvatarMenuOpen(o=>!o),style:{width:'40px',height:'40px',borderRadius:'999px',border:'none',cursor:'pointer',padding:0,overflow:'hidden',background:'#F3EBFE',color:'#5514B4',fontWeight:700,fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},
              P.person.photo?h('img',{src:P.person.photo,alt:P.person.name,style:{width:'100%',height:'100%',objectFit:'cover',display:'block'}}):P.person.avatar),
            avatarMenuOpen&&h('div',{style:{position:'absolute',top:'48px',right:0,background:'#fff',border:'1px solid #E3E3E3',borderRadius:'12px',boxShadow:'0 8px 24px rgba(20,10,40,0.14)',minWidth:'200px',zIndex:50,padding:'6px'}},
              h('div',{style:{padding:'12px 14px 10px',borderBottom:'1px solid #F0F0F0',marginBottom:'4px'}},
                h('div',{style:{fontWeight:700,fontSize:'13.5px',color:'#1A1A1A'}},P.person.name),
                h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},P.person.meta)),
              [{icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',label:'Profile & settings',screen:'accountSettings'},
               {icon:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',label:'Preferences',screen:'accountSettings'},
               {icon:'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',label:'Help & support',screen:'helpSupport'},
              ].map(item=>h('button',{key:item.label,onClick:()=>{setAvatarMenuOpen(false);if(item.screen==='accountSettings'){setSettingsTab('profile');}setScreen(item.screen);},style:{display:'flex',alignItems:'center',gap:'10px',width:'100%',padding:'9px 12px',border:0,borderRadius:'8px',background:'transparent',cursor:'pointer',fontFamily:'inherit',textAlign:'left',color:'#2A2A2A'}},
                ic(item.icon,{s:15,c:'#555555'}),
                h('span',{style:{fontSize:'13.5px',fontWeight:500}},item.label))),
              h('div',{style:{borderTop:'1px solid #F0F0F0',marginTop:'4px',padding:'6px 6px 2px'}},
                h('button',{onClick:()=>setAvatarMenuOpen(false),style:{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'9px 12px',border:'1.5px solid #5514B4',borderRadius:'8px',background:'transparent',cursor:'pointer',fontFamily:'inherit',color:'#5514B4',fontWeight:700,fontSize:'13.5px'}},
                  'Log out')))))
,


        // Content
        h('div',{style:{flex:1,overflowY:'auto',padding:'30px 32px 48px'}},

          screen!=='orgs'&&screen!=='users'&&h('div',{style:{fontSize:'22px',fontWeight:700,letterSpacing:'-0.01em',marginBottom:'24px'}},
            screen==='orgDetail'?(orgById(selOrgId)||{name:'Organisation'}).name:
            screen==='roles'&&overviewTab!=='roles'?'Roles & permissions':
            screen==='helpSupport'?'Help & support':
            screen==='accountSettings'?'Profile & settings':P.title),

          screen==='overview'&&persona==='user'&&(()=>{
            const me=users.find(u=>u.id==='u2')||users[0];
            const myRole=ROLES.find(r=>r.key===me.roleKey)||ROLES[0];
            const myOrg=orgById(me.orgId)||orgById('northgate');
            const myColIdx=ROLE_COL_MAP[me.roleKey]??0;
            const sc=statusMap[me.status]||statusMap.Active;
            return h('div',{style:{maxWidth:'900px'}},
              h('div',{style:{marginBottom:'28px'}},
                h('div',{style:{fontSize:'24px',fontWeight:700,letterSpacing:'-0.01em',marginBottom:'4px'}},'Welcome back, '+me.name.split(' ')[0]),
                h('div',{style:{fontSize:'14px',color:'#808080'}},'Your access is defined by the '+myRole.label+' role at '+myOrg.name+'.')),
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'24px'}},
                h('div',{style:{background:'#fff',border:'2px solid #5514B4',borderRadius:'16px',padding:'22px'}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}},
                    h('span',{style:{width:'40px',height:'40px',borderRadius:'10px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                      ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:19})),
                    h('div',null,
                      h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'#808080',marginBottom:'2px'}},'Your role'),
                      h('div',{style:{fontSize:'17px',fontWeight:700,color:'#2A2A2A'}},myRole.label),
                      h('div',{style:{fontSize:'12px',color:'#808080',marginTop:'2px'}},'Since '+me.roleDate))),
                  h('div',{style:{display:'flex',flexDirection:'column',gap:'7px'}},
                    myRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'center',fontSize:'13px',color:'#2A2A2A'}},
                      ic('M20 6 9 17l-5-5',{s:13,c:'#357E3C',w:2.4}),g)))),
                h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'22px'}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}},
                    h('span',{style:{width:'40px',height:'40px',borderRadius:'10px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                      ic('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2',{s:18,c:'#5514B4'})),
                    h('div',null,
                      h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'#808080',marginBottom:'2px'}},'Your organisation'),
                      h('div',{style:{fontSize:'17px',fontWeight:700,color:'#2A2A2A'}},myOrg.name),
                      h('div',{style:{display:'flex',alignItems:'center',gap:'5px',marginTop:'4px'}},
                        h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'3px 9px',fontSize:'11px',fontWeight:700,color:sc[0],background:sc[1]}},
                          h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),me.status)))),
                  h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'10px'}},'Products available to you'),
                  h('div',{style:{display:'flex',flexWrap:'wrap',gap:'7px'}},
                    PRODUCT_KEYS.filter(k=>myOrg.entitlements.includes(k)).map(k=>{
                      const e=ENT.find(x=>x.key===k);
                      return h('span',{key:k,style:{display:'inline-flex',alignItems:'center',gap:'5px',background:'#F0F8EF',border:'1px solid #BFE0BF',color:'#1F5A26',borderRadius:'6px',padding:'5px 10px',fontSize:'12px',fontWeight:700}},
                        ic('M20 6 9 17l-5-5',{s:11,c:'#357E3C',w:2.5}),e.label);
                    })))),
              h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'22px'}},
                h('div',{style:{fontWeight:700,fontSize:'15px',marginBottom:'16px'}},'Your permission scope'),
                h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}},
                  ROLE_ROWS.map((row,ri)=>{
                    const v=myColIdx>=0?row[myColIdx+1]:'n';
                    const clr={y:['#1F5A26','#F0F8EF','#BFE0BF'],p:['#8A5A00','#FEF6DE','#F0D494'],n:['#AAAAAA','#F7F7F7','#E3E3E3']};
                    const [fg,bg,bd]=clr[v]||clr.n;
                    return h('div',{key:ri,style:{border:'1px solid '+bd,borderRadius:'10px',padding:'12px 14px',background:bg}},
                      h('div',{style:{display:'flex',alignItems:'center',gap:'7px',marginBottom:'4px'}},
                        h(CellMark,{v}),
                        h('span',{style:{fontWeight:700,fontSize:'13px',color:'#2A2A2A'}},row[0])),
                      h('div',{style:{fontSize:'11.5px',color:fg,fontWeight:600}},v==='y'?'Full access':v==='p'?'Partial access':'No access'));
                  }))));
          })(),

          screen==='overview'&&persona!=='user'&&h('div',{style:{maxWidth:'1120px'}},
            h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}},
              [
                {icon:ic(['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18','M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2','M10 6h4M10 10h4'],{s:18,c:'#5514B4'}),value:String(flat.length-1),label:isBt?'Reseller organisations':'Downstream organisations',sub:isBt?'Across the platform':'Sub-resellers, child & dealers'},
                {icon:ic([{el:'circle',cx:9,cy:7,r:4},{el:'circle',cx:17,cy:9,r:3},'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M22 21v-2a4 4 0 0 0-3-3.87'],{s:18,c:'#5514B4'}),value:String(visibleUsers.length),label:'Users',sub:isBt?'Across all reseller orgs':'In your network'},
                {icon:ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:18,c:'#5514B4'}),value:String(ROLES.length),label:isBt?'Role types':'Assignable roles',sub:isBt?'Across the network':'Role-based access'},
                {icon:ic(['M12 2 2 7l10 5 10-5-10-5Z','M2 17l10 5 10-5','M2 12l10 5 10-5'],{s:18,c:'#5514B4'}),value:String(ENT.length),label:'Products',sub:isBt?'Available to resellers':'Products & services'},
              ].map((k,i)=>h('div',{key:i,style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'20px'}},
                h('span',{style:{width:'38px',height:'38px',borderRadius:'10px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'14px'}},k.icon),
                h('div',{style:{fontSize:'32px',fontWeight:700,letterSpacing:'-0.02em',lineHeight:1,color:'#5514B4'}},k.value),
                h('div',{style:{fontSize:'14px',color:'#434343',marginTop:'5px',fontWeight:700}},k.label),
                h('div',{style:{fontSize:'12.5px',color:'#808080',marginTop:'1px'}},k.sub)))),

            h('div',{style:{borderBottom:'1px solid #E3E3E3',marginBottom:'24px',display:'flex'}},
              [
                {key:'network',label:'Your network'},
                {key:'create',label:isBt?'Create reseller':'Create organisation'},
                {key:'roles',label:'Roles & permissions'},
              ].map(t=>h('button',{key:t.key,
                onClick:()=>{
                  if(t.key==='network'){setOrgWiz(null);setOverviewTab('network');return;}
                  if(t.key==='create'){
                    if(!canAdmin)return deny();
                    const tp=childTypes()[0];
                    setOrgWiz({step:1,name:'',email:'',type:tp,ent:defEnt(tp)});
                    setOverviewTab('create');
                    return;
                  }
                  if(t.key==='roles'){setOverviewTab('roles');return;}
                  setOverviewTab(t.key);
                },
                style:{background:'none',border:'none',borderBottom:'2px solid '+(overviewTab===t.key?'#5514B4':'transparent'),padding:'10px 20px',fontWeight:overviewTab===t.key?700:500,fontSize:'14px',color:overviewTab===t.key?'#5514B4':'#808080',cursor:'pointer',fontFamily:'inherit',marginBottom:'-1px',whiteSpace:'nowrap'}},t.label))),

            overviewTab==='network'&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
              h('div',{style:{padding:'20px 22px',borderBottom:'1px solid #E3E3E3'}},
                h('div',{style:{fontWeight:700,fontSize:'17px'}},'Your organisation network')),
              h('div',{style:{display:'flex',gap:'10px',padding:'12px 22px',borderBottom:'1px solid #E3E3E3',alignItems:'center'}},
                h('div',{style:{position:'relative',flex:1}},
                  h('span',{style:{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',color:'#AAAAAA'}},ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:15})),
                  h('input',{value:orgSearch,onChange:e=>{setOrgSearch(e.target.value);},placeholder:'Search organisations…',style:{width:'100%',padding:'8px 12px 8px 34px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13.5px',fontFamily:'inherit',outline:'none'}})),
                h('select',{value:orgTypeFilter,onChange:e=>setOrgTypeFilter(e.target.value),style:{padding:'8px 12px 8px 12px',paddingRight:'32px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13.5px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#2A2A2A',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}},
                  h('option',{value:''},'All types'),
                  Object.entries(TYPE_LABELS).map(([k,v])=>h('option',{key:k,value:k},v))),
                (orgSearch||orgTypeFilter)&&h('button',{onClick:()=>{setOrgSearch('');setOrgTypeFilter('');},style:{padding:'8px 12px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13px',fontWeight:700,background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#808080',whiteSpace:'nowrap'}},'Clear')),
              h('div',{style:{display:'grid',gridTemplateColumns:'2.4fr 1.2fr 1.8fr 0.6fr 0.8fr 0.7fr',padding:'11px 22px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',fontSize:'12px',fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},
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
                  h('div',{style:{fontSize:'13px',marginTop:'4px'}},'Try adjusting your filters'));
                return filteredFlat.map((row,i)=>{
                  const o=row.org;
                  const isSelected=o.id===selOrgId;
                  return h('div',{key:o.id,onClick:()=>setSelOrgId(isSelected?null:o.id),
                    style:{display:'grid',gridTemplateColumns:'2.4fr 1.2fr 1.8fr 0.6fr 0.8fr 0.7fr',padding:'12px 22px',borderBottom:'1px solid #F0F0F0',alignItems:'center',cursor:'pointer',background:isSelected?'#FAF6FF':'transparent'},
                    onMouseEnter:e=>{if(!isSelected)e.currentTarget.style.background='#FAF6FF';},
                    onMouseLeave:e=>{if(!isSelected)e.currentTarget.style.background='transparent';}},
                    h('div',{style:{display:'flex',alignItems:'center',gap:'6px',minWidth:0}},
                      h('div',{style:{width:(row.depth*20)+'px',flexShrink:0}}),
                      row.depth>0&&h('span',{style:{color:'#D0D0D0',fontSize:'13px',fontFamily:'monospace',flexShrink:0}},'└'),
                      h('span',{style:{...dotSt(o.typeKey),flexShrink:0,marginLeft:row.depth>0?'4px':'0'}}),
                      h('div',{style:{minWidth:0,marginLeft:'8px'}},
                        h('div',{style:{fontWeight:row.depth===0?700:600,fontSize:'14px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isSelected?'#5514B4':'#2A2A2A'}},o.name))),
                    h('div',{style:{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}},
                      h('span',{style:s(badgeSt(o.typeKey))},TYPE_LABELS[o.typeKey]),
                      o.id===home&&h('span',{style:{fontSize:'11px',fontWeight:700,color:'#5514B4',background:'#F3EBFE',padding:'2px 7px',borderRadius:'5px'}},'You')),
                    h('div',{style:{fontSize:'13px',color:'#434343',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},o.primaryName||o.contact),
                    h('div',{style:{fontSize:'14px',fontWeight:700,color:'#5514B4'}},String(userCountFor(o.id))),
                    h('div',{style:{fontSize:'14px',color:'#434343'}},String(childrenOf(o.id).length)),
                    h('div',{style:{display:'flex',justifyContent:'flex-end'}},
                      h('span',{onClick:e=>{e.stopPropagation();setSelOrgId(o.id);setScreen('orgs');},style:{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,color:'#5514B4',cursor:'pointer'}},
                        'View',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))));
                });
              })(),
              h('div',{style:{padding:'16px 22px',borderTop:'1px solid #F0F0F0'}},
                h('button',{onClick:createOrg.onClick,style:createOrg.ctaStyle},
                  canAdmin?ic('M12 5v14M5 12h14',{s:16,c:'#fff'}):lockEl('#AAAAAA'),
                  h('span',null,createOrg.label)))),

            overviewTab==='invite'&&userWiz&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden',maxWidth:'760px'}},
              h('div',{style:{padding:'22px 26px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                h('div',null,
                  h('div',{style:{fontSize:'18px',fontWeight:700}},'Invite a user'),
                  h('div',{style:{fontSize:'13px',color:'#808080',marginTop:'2px'}},'Step '+userWiz.step+' of 3 · '+['Details','Role','Review'][userWiz.step-1])),
                h('button',{onClick:()=>{setUserWiz(null);setOverviewTab('network');},style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
              h('div',{style:{height:'4px',background:'#F0F0F0'}},h('div',{style:{height:'100%',background:'#5514B4',width:Math.round(userWiz.step/3*100)+'%',transition:'width 240ms ease'}})),
              h('div',{style:{padding:'26px'}},
                userWiz.step===1&&h('div',null,
                  h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Full name'),
                  h('input',{value:userWiz.name,onChange:e=>setUserWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Morgan Hale',style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',marginBottom:'20px',fontFamily:'inherit',boxSizing:'border-box'}}),
                  h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Email address'),
                  h('input',{value:userWiz.email,onChange:e=>setUserWiz(w=>({...w,email:e.target.value})),placeholder:'morgan.hale@northgate.co.uk',style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',marginBottom:'20px',fontFamily:'inherit',boxSizing:'border-box'}}),
                  h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Organisation'),
                  h('select',{value:userWiz.orgId,onChange:e=>setUserWiz(w=>({...w,orgId:e.target.value})),style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',background:'#fff',cursor:'pointer',fontFamily:'inherit'}},
                    [orgById(home),...childrenOf(home)].map(o=>h('option',{key:o.id,value:o.id},o.name+' · '+TYPE_LABELS[o.typeKey])))),
                userWiz.step===2&&h('div',{style:{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:'20px'}},
                  h('div',null,
                    h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},'Assign a role'),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'9px'}},
                      ROLES.map(r=>{
                        const active=userWiz.role===r.key;
                        return h('button',{key:r.key,onClick:()=>setUserWiz(w=>({...w,role:r.key})),style:{display:'flex',alignItems:'flex-start',gap:'11px',width:'100%',padding:'12px 13px',borderRadius:'11px',cursor:'pointer',border:'1px solid '+(active?'#5514B4':'#E3E3E3'),background:active?'#FAF6FF':'#fff',fontFamily:'inherit'}},
                          h('span',{style:{width:'19px',height:'19px',borderRadius:'999px',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',background:active?'#5514B4':'#fff',border:'1px solid '+(active?'#5514B4':'#C8C8C8')}},active&&h('span',{style:{width:'10px',height:'10px',borderRadius:'999px',background:'#fff'}})),
                          h('span',{style:{textAlign:'left'}},h('span',{style:{display:'block',fontWeight:700,fontSize:'14px'}},r.label),h('span',{style:{display:'block',fontSize:'12px',color:'#808080',lineHeight:1.35}},r.desc)));
                      }))),
                  h('div',null,
                    h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},'Permissions granted'),
                    h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'16px'}},
                      h('div',{style:{fontWeight:700,fontSize:'14px',marginBottom:'12px'}},(ROLES.find(r=>r.key===userWiz.role)||ROLES[0]).label),
                      (ROLES.find(r=>r.key===userWiz.role)||ROLES[0]).grants.map((pm,i)=>
                        h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'flex-start',fontSize:'12.5px',marginBottom:'7px'}},
                          ic('M20 6 9 17l-5-5',{s:14,c:'#5514B4',w:2.4}),h('span',null,pm)))))),
                userWiz.step===3&&h('div',null,
                  h('div',{style:{display:'flex',alignItems:'center',gap:'14px',marginBottom:'20px'}},
                    h('div',{style:{width:'52px',height:'52px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'18px',flexShrink:0}},initials(userWiz.name||'?')),
                    h('div',null,h('div',{style:{fontWeight:700,fontSize:'17px'}},userWiz.name||'(unnamed)'),h('div',{style:{fontSize:'13px',color:'#808080'}},userWiz.email))),
                  h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'12px'}},
                    [['Role',(ROLES.find(r=>r.key===userWiz.role)||ROLES[0]).label],['Organisation',(orgById(userWiz.orgId)||{name:'—'}).name]].map(([k,v],i)=>
                      h('div',{key:k,style:{display:'flex',justifyContent:'space-between',padding:'13px 16px',borderBottom:'1px solid #F0F0F0'}},
                        h('span',{style:{color:'#808080',fontSize:'13px'}},k),h('span',{style:{fontWeight:700,fontSize:'14px'}},v))),
                    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 16px'}},
                      h('span',{style:{color:'#808080',fontSize:'13px'}},'Status on creation'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#FEF6DE',color:'#8A5A00',borderRadius:'999px',padding:'4px 11px',fontSize:'12px',fontWeight:700}},h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),'Invited'))),
                  h('div',{style:{fontSize:'12.5px',color:'#808080',lineHeight:1.5}},'An invitation email will be sent. The user gains access once they accept and set a password.'))),
              h('div',{style:{padding:'18px 26px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center'}},
                h('button',{onClick:()=>{if(userWiz.step===1){setUserWiz(null);setOverviewTab('network');}else setUserWiz(w=>({...w,step:w.step-1}));},style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'999px',padding:'11px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},userWiz.step===1?'Cancel':'Back'),
                h('button',{onClick:()=>{
                  if(userWiz.step<3){setUserWiz(w=>({...w,step:w.step+1}));return;}
                  const o=orgById(userWiz.orgId);const id='nu'+seq;
                  const user={id,name:userWiz.name.trim()||'New user',email:userWiz.email.trim()||'—',roleKey:userWiz.role,orgId:userWiz.orgId,status:'Invited'};
                  setUsers(us=>[...us,user]);setSeq(n=>n+1);setUserWiz(null);setOverviewTab('network');
                  showToast('success','Invitation sent to '+user.name+' as '+roleLabel(userWiz.role)+' at '+(o?o.name:'Northgate Telecom')+'.');
                },style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'999px',padding:'11px 22px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},userWiz.step===3?'Send invitation':'Continue'))),

            overviewTab==='create'&&orgWiz&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden',width:'100%'}},
              h('div',{style:{maxWidth:'640px',margin:'0 auto',padding:'32px 0 0'}},
              h('div',{style:{padding:'0 24px 20px',borderBottom:'1px solid #E3E3E3'}},
                h('div',{style:{display:'flex',alignItems:'center',gap:'0',maxWidth:'480px',margin:'0 auto'}},
                  ['Details','Contact','Entitlements','Review'].map((label,i)=>{
                    const stepNum=i+1;const done=orgWiz.step>stepNum;const active=orgWiz.step===stepNum;
                    return h('div',{key:label,style:{display:'flex',alignItems:'center',flex:i<3?1:'auto'}},
                      h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px'}},
                        h('div',{style:{width:'28px',height:'28px',borderRadius:'999px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:done?'#5514B4':active?'#5514B4':'#F0F0F0',border:'none',transition:'background 200ms'}},
                          done?ic('M20 6 9 17l-5-5',{s:13,c:'#fff',w:2.5}):h('span',{style:{fontSize:'12px',fontWeight:700,color:active?'#fff':'#808080'}},stepNum)),
                        h('span',{style:{fontSize:'11px',fontWeight:active||done?700:400,color:active?'#5514B4':done?'#5514B4':'#808080',whiteSpace:'nowrap'}},label)),
                      i<3&&h('div',{style:{flex:1,height:'2px',background:done?'#5514B4':'#E3E3E3',margin:'0 6px',marginBottom:'18px',transition:'background 200ms'}}));
                  }))),
              h('div',{style:{padding:'26px'}},
                orgWiz.step===1&&h('div',null,
                  h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Organisation name'),
                  h('input',{value:orgWiz.name,onChange:e=>setOrgWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Beacon Communications',style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',marginBottom:'20px',fontFamily:'inherit'}}),
                  h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Administrator email'),
                  h('input',{value:orgWiz.email,onChange:e=>setOrgWiz(w=>({...w,email:e.target.value})),placeholder:'admin@organisation.co.uk',style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',marginBottom:'22px',fontFamily:'inherit'}}),
                  h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'10px'}},'Organisation type'),
                  h('div',{style:{display:'flex',flexDirection:'column',gap:'10px'}},
                    childTypes().map(tk=>{
                      const active=orgWiz.type===tk;
                      return h('button',{key:tk,onClick:()=>setOrgWiz(w=>{const ent={};const p=wizParent();ENT.forEach(x=>{if(p.entitlements.includes(x.key)&&typeAllows(tk,x.key))ent[x.key]=true;});return{...w,type:tk,ent};}),style:{display:'flex',alignItems:'flex-start',gap:'11px',width:'100%',padding:'13px 14px',borderRadius:'11px',textAlign:'left',cursor:'pointer',border:'1px solid '+(active?'#5514B4':'#E3E3E3'),background:active?'#FAF6FF':'#fff',fontFamily:'inherit'}},
                        h('span',{style:{width:'20px',height:'20px',borderRadius:'999px',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',background:active?'#5514B4':'#fff',border:'1px solid '+(active?'#5514B4':'#C8C8C8')}},active&&h('span',{style:{width:'10px',height:'10px',borderRadius:'999px',background:'#fff'}})),
                        h('span',null,h('span',{style:{display:'block',fontWeight:700,fontSize:'14px'}},TYPE_LABELS[tk]),h('span',{style:{display:'block',fontSize:'12.5px',color:'#808080'}},TYPE_DESC[tk])));
                    }))),
                orgWiz.step===2&&(()=>{
                  const fld=(label,key,placeholder,half)=>h('div',{style:{gridColumn:half?'span 1':'span 2'}},
                    h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},label),
                    h('input',{value:orgWiz[key]||'',onChange:e=>setOrgWiz(w=>({...w,[key]:e.target.value})),placeholder,style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'14px',fontFamily:'inherit'}}));
                  const sec=(title)=>h('div',{style:{gridColumn:'span 2',fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#AAAAAA',paddingTop:'8px',marginBottom:'-4px'}},title);
                  return h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}},
                    sec('Primary contact'),fld('Name','primaryName','e.g. Sarah Whitfield',true),fld('Email','primaryEmail','sarah@organisation.co.uk',true),fld('Phone','primaryPhone','+44 1234 567 890',true),
                    sec('Billing contact'),fld('Name','billingName','e.g. Priya Nair',true),fld('Email','billingEmail','billing@organisation.co.uk',true),fld('Phone','billingPhone','+44 1234 567 891',true),
                    sec('Organisation'),fld('Registered address','address','14 Commerce Park, Milton Keynes, MK9 2EA',false),fld('Website','website','www.organisation.co.uk',false));
                })(),
                orgWiz.step===3&&h('div',null,
                  h('div',{style:{display:'flex',gap:'10px',background:'#F3EBFE',border:'1px solid #E4D3FA',borderRadius:'12px',padding:'13px 15px',marginBottom:'22px'}},
                    h('span',{style:{color:'#5514B4',flexShrink:0}},ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:18})),
                    h('div',{style:{fontSize:'13px',color:'#3F187F',lineHeight:1.4}},'A ',h('b',null,TYPE_LABELS[orgWiz.type]),' can only inherit capabilities that ',h('b',null,wizParent().name),' already holds.')),
                  ['product','service'].map(kind=>h('div',{key:kind},
                    h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},kind==='product'?'Products':'Services & capabilities'),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'9px',marginBottom:'22px'}},
                      ENT.filter(e=>e.kind===kind).map(e=>{
                        const p=wizParent();const held=p.entitlements.includes(e.key);const allowed=typeAllows(orgWiz.type,e.key);const locked=!held||!allowed;const checked=!!orgWiz.ent[e.key]&&!locked;
                        return h('button',{key:e.key,onClick:()=>{if(!locked)setOrgWiz(w=>({...w,ent:{...w.ent,[e.key]:!w.ent[e.key]}}));},style:{display:'flex',alignItems:'center',gap:'11px',width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1px solid '+(checked?'#5514B4':'#E3E3E3'),background:locked?'#F7F7F7':'#fff',cursor:locked?'not-allowed':'pointer',fontFamily:'inherit'}},
                          h('span',{style:{width:'22px',height:'22px',borderRadius:'6px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:checked?'#5514B4':locked?'#EDEDED':'#fff',border:'1px solid '+(checked?'#5514B4':locked?'#E3E3E3':'#C8C8C8')}},checked&&ic('M20 6 9 17l-5-5',{s:13,c:'#fff',w:3})),
                          h('span',{style:{fontWeight:700,fontSize:'14px',color:locked?'#AAAAAA':'#2A2A2A'}},e.label),
                          h('span',{style:{flex:1}}),
                          locked&&h('span',{style:{fontSize:'11.5px',color:'#808080',display:'flex',gap:'4px',alignItems:'center'}},lockEl('#808080'),!held?'Not held by '+p.name:'N/A for '+TYPE_LABELS[orgWiz.type]));
                      }))))),
                orgWiz.step===4&&h('div',null,
                  h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'20px'}},
                    [['Name',orgWiz.name||'(untitled)'],['Type',TYPE_LABELS[orgWiz.type]],['Admin email',orgWiz.email||'(none)'],['Parent',wizParent().name],['Primary contact',orgWiz.primaryName||(orgWiz.primaryEmail||'(none)')],['Billing contact',orgWiz.billingName||(orgWiz.billingEmail||'(none)')],['Website',orgWiz.website||'(none)']].map(([k,v],i,a)=>
                      h('div',{key:k,style:{display:'flex',justifyContent:'space-between',padding:'13px 16px',borderBottom:i<a.length-1?'1px solid #F0F0F0':'none'}},
                        h('span',{style:{color:'#808080',fontSize:'13px'}},k),h('span',{style:{fontWeight:700,fontSize:'14px'}},v)))),
                  h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},'Entitlements granted ('+Object.keys(orgWiz.ent).filter(k=>orgWiz.ent[k]).length+')'),
                  h('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                    Object.keys(orgWiz.ent).filter(k=>orgWiz.ent[k]).length===0
                      ?h('span',{style:{fontSize:'13px',color:'#808080'}},'None selected.')
                      :ENT.filter(e=>orgWiz.ent[e.key]).map(e=>h('span',{key:e.key,style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#F0F8EF',border:'1px solid #BFE0BF',color:'#1F5A26',borderRadius:'5px',padding:'6px 11px',fontSize:'13px',fontWeight:700}},ic('M20 6 9 17l-5-5',{s:12,c:'#357E3C',w:3}),e.label))))),
              h('div',{style:{padding:'18px 26px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center'}},
                h('button',{onClick:()=>{if(orgWiz.step===1){setOrgWiz(null);setOverviewTab('network');}else setOrgWiz(w=>({...w,step:Math.max(1,w.step-1)}));},style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'999px',padding:'11px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},orgWiz.step===1?'Cancel':'Back'),
                h('button',{onClick:()=>{
                  if(orgWiz.step<4){setOrgWiz(w=>({...w,step:w.step+1}));return;}
                  const p=wizParent();const id='org'+seq;const ents=Object.keys(orgWiz.ent).filter(k=>orgWiz.ent[k]);
                  const org={id,name:orgWiz.name.trim()||'New organisation',typeKey:orgWiz.type,parentId:p.id,contact:orgWiz.email.trim()||'—',primaryName:orgWiz.primaryName||'',primaryEmail:orgWiz.primaryEmail||'',primaryPhone:orgWiz.primaryPhone||'',billingName:orgWiz.billingName||'',billingEmail:orgWiz.billingEmail||'',billingPhone:orgWiz.billingPhone||'',address:orgWiz.address||'',website:orgWiz.website||'',entitlements:ents};
                  setOrgs(os=>[...os,org]);setSeq(n=>n+1);setOrgWiz(null);setSelOrgId(id);setScreen('orgs');
                  showToast('success',org.name+' created as a '+TYPE_LABELS[orgWiz.type]+' under '+p.name+'.');
                },style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'999px',padding:'11px 22px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},orgWiz.step===4?'Create organisation':'Continue')))),

            overviewTab==='roles'&&persona!=='user'&&(()=>{
              const tabs=isBt
                ?[{key:'orgProfiles',label:'Organisation types'},{key:'roleDirectory',label:'Available roles'},{key:'resellerAdmins',label:'Reseller admins'},{key:'whoHasAccess',label:'Who has access?'}]
                :[{key:'orgProfiles',label:'Organisation types'},{key:'roleDirectory',label:'Available roles'},{key:'userRoles',label:"Your team's roles"},{key:'whoHasAccess',label:'Who has access?'}];
              const activeTab=rolesTab;
              const tabBtnSt=active=>({background:'none',border:'none',padding:'10px 18px',fontSize:'14px',fontWeight:active?700:500,color:active?'#5514B4':'#808080',cursor:'pointer',borderBottom:active?'2px solid #5514B4':'2px solid transparent',marginBottom:'-1px',fontFamily:'inherit',transition:'color 0.15s'});
              const whoHasAccessPanel=isBt
                ?h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                  h('div',{style:{overflowX:'auto'}},
                    h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'640px'}},
                      h('thead',null,h('tr',null,
                        h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Capability'),
                        PROFILE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 10px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'120px'}},hd)))),
                      h('tbody',null,PROFILE_ROWS.map((row,ri)=>h('tr',{key:ri},
                        h('td',{style:{textAlign:'left',padding:'12px 22px',fontSize:'13.5px',borderBottom:'1px solid #F0F0F0'}},row[0]),
                        row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'12px 10px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))))
                :h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                  h('div',{style:{overflowX:'auto'}},
                    h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'820px'}},
                      h('thead',null,h('tr',null,
                        h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Permission area'),
                        ROLE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 8px',fontSize:'12.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'96px'}},hd)))),
                      h('tbody',null,ROLE_ROWS.map((row,ri)=>h('tr',{key:ri},
                        h('td',{style:{textAlign:'left',padding:'13px 22px',fontSize:'13.5px',fontWeight:700,borderBottom:'1px solid #F0F0F0'}},row[0]),
                        row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'13px 8px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))));
              return h('div',{style:{maxWidth:'1120px'}},
                h('div',{style:{display:'flex',borderBottom:'1px solid #E3E3E3',marginBottom:'24px'}},
                  tabs.map(t=>h('button',{key:t.key,onClick:()=>setRolesTab(t.key),style:tabBtnSt(activeTab===t.key)},t.label))),
                activeTab==='orgProfiles'&&h('div',null,
                  h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},isBt
                    ?'Four organisation types make up the BT Wholesale network. Each is built on a capability profile — this defines what they can do on the platform and what permissions they can pass down to the next tier.'
                    :'Your network includes different types of downstream organisations. This shows what each type is set up to do on the platform.'),
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                    h('div',{style:{overflowX:'auto'}},h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'640px'}},
                      h('thead',null,h('tr',null,
                        h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Capability'),
                        PROFILE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 10px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'120px'}},hd)))),
                      h('tbody',null,PROFILE_ROWS.map((row,ri)=>h('tr',{key:ri},
                        h('td',{style:{textAlign:'left',padding:'12px 22px',fontSize:'13.5px',borderBottom:'1px solid #F0F0F0'}},row[0]),
                        row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'12px 10px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))))),
                activeTab==='roleDirectory'&&h('div',null,
                  h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},isBt
                    ?'These are the roles available to BT Wholesale staff. Each role defines what someone can configure, view, or manage across the platform.'
                    :'Each role controls exactly what a user can see and do in the platform. When you assign someone a role, they get access to everything it covers — no more, no less.'),
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                    h('table',{style:{borderCollapse:'collapse',width:'100%'}},
                      h('thead',null,h('tr',null,
                        h('th',{style:{textAlign:'left',padding:'13px 22px',fontSize:'11.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},'Role'),
                        h('th',{style:{textAlign:'left',padding:'13px 22px',fontSize:'11.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},'Description'),
                        h('th',{style:{textAlign:'right',padding:'13px 22px',fontSize:'11.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080',whiteSpace:'nowrap'}},'Users assigned'))),
                      h('tbody',null,(isBt?BT_ROLES:ROLES).map((r,i,arr)=>
                        h('tr',{key:r.key,style:{cursor:'pointer',background:selRole===r.key?'#FAF6FF':'transparent'},
                          onClick:()=>setSelRole(selRole===r.key?null:r.key),
                          onMouseEnter:e=>{if(selRole!==r.key)e.currentTarget.style.background='#FAF6FF';},
                          onMouseLeave:e=>{if(selRole!==r.key)e.currentTarget.style.background='transparent';}},
                          h('td',{style:{padding:'14px 22px',fontSize:'14px',fontWeight:700,borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none'}},r.label),
                          h('td',{style:{padding:'14px 22px',fontSize:'13.5px',color:'#434343',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none'}},r.desc),
                          h('td',{style:{padding:'14px 22px',fontSize:'14px',fontWeight:700,color:'#5514B4',textAlign:'right',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none'}},String(users.filter(u=>u.roleKey===r.key).length)))))))
                ));
            })()),

          screen==='orgs'&&h('div',null,
            h('div',{style:{display:'flex',alignItems:'center',justifyContent:'flex-end',marginBottom:'20px'}},
              h('button',{onClick:createOrg.onClick,style:createOrg.ctaStyle},canAdmin?ic('M12 5v14M5 12h14',{s:16,c:'#fff'}):lockEl('#AAAAAA'),h('span',null,createOrg.label))),
            h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
              h('div',{style:{display:'grid',gridTemplateColumns:'2.4fr 1.2fr 1.8fr 0.6fr 0.8fr 0.7fr',padding:'13px 22px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',fontSize:'12px',fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},
                h('div',null,'Organisation'),
                h(SortHdr,{label:'Type',col:'type',sort:orgSort,setSort:setOrgSort}),
                h(SortHdr,{label:'Primary contact',col:'contact',sort:orgSort,setSort:setOrgSort}),
                h(SortHdr,{label:'Users',col:'users',sort:orgSort,setSort:setOrgSort}),
                h(SortHdr,{label:'Sub-orgs',col:'suborgs',sort:orgSort,setSort:setOrgSort}),
                h('div',null,'')),
              (()=>{
                let sortedFlat=[...flat];
                if(orgSort.col){
                  sortedFlat.sort((a,b)=>{
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
                return sortedFlat.map((row,i)=>{
                const o=row.org;const parent=o.parentId?orgById(o.parentId):null;
                const isSelected=o.id===selOrgId;
                return h('div',{key:o.id,onClick:()=>setSelOrgId(isSelected?null:o.id),
                  style:{display:'grid',gridTemplateColumns:'2.4fr 1.2fr 1.8fr 0.6fr 0.8fr 0.7fr',padding:'13px 22px',borderBottom:'1px solid #F0F0F0',alignItems:'center',cursor:'pointer',background:isSelected?'#FAF6FF':'transparent'},
                  onMouseEnter:e=>{if(!isSelected)e.currentTarget.style.background='#FAF6FF';},
                  onMouseLeave:e=>{if(!isSelected)e.currentTarget.style.background='transparent';}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:'6px',minWidth:0}},
                    h('div',{style:{width:(row.depth*20)+'px',flexShrink:0}}),
                    row.depth>0&&h('span',{style:{color:'#D0D0D0',fontSize:'13px',fontFamily:'monospace',flexShrink:0}},'└'),
                    h('span',{style:{...dotSt(o.typeKey),flexShrink:0,marginLeft:row.depth>0?'4px':'0'}}),
                    h('div',{style:{minWidth:0,marginLeft:'8px'}},
                      h('div',{style:{fontWeight:o.depth===0||o.id===home?700:600,fontSize:'14px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:isSelected?'#5514B4':'#2A2A2A'}},o.name),
                      parent&&o.typeKey!=='reseller'&&h('div',{style:{fontSize:'12px',color:'#AAAAAA',marginTop:'1px'}},'via '+parent.name))),
                  h('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
                    h('span',{style:s(badgeSt(o.typeKey))},TYPE_LABELS[o.typeKey]),
                    o.id===home&&h('span',{style:{fontSize:'11px',fontWeight:700,color:'#5514B4',background:'#F3EBFE',padding:'2px 7px',borderRadius:'5px'}},'You')),
                  h('div',{style:{fontSize:'13px',color:'#434343',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},o.primaryName||o.contact),
                  h('div',{style:{fontSize:'14px',fontWeight:700,color:'#5514B4'}},String(userCountFor(o.id))),
                  h('div',{style:{fontSize:'14px',color:'#434343'}},String(childrenOf(o.id).length)),
                  h('div',{style:{display:'flex',justifyContent:'flex-end'}},
                    h('span',{onClick:e=>{e.stopPropagation();setSelOrgId(o.id);},style:{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,color:'#5514B4',cursor:'pointer'}},
                      'View',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))));
                });
              })())),

            // Org detail drawer
            selOrgId&&screen==='orgs'&&(()=>{
              const dSel=orgById(selOrgId);
              if(!dSel) return null;
              const dParent=dSel.parentId?orgById(dSel.parentId):null;
              function EntRow({entKey}){
                const owned=dSel.entitlements.includes(entKey);
                const parentHas=dParent?dParent.entitlements.includes(entKey):true;
                const e=ENT.find(x=>x.key===entKey);
                return h('div',{style:{display:'flex',alignItems:'center',gap:'10px',padding:'7px 0',borderBottom:'1px solid #F3F3F3'}},
                  parentHas&&owned
                    ?ic('M20 6 9 17l-5-5',{s:14,c:'#357E3C',w:2.4})
                    :parentHas&&!owned
                      ?h('span',{style:{width:14,height:14,display:'flex',alignItems:'center',justifyContent:'center'}},ic('M5 12h14',{s:14,c:'#D88C00',w:2}))
                      :h('span',{style:{width:14,height:14,display:'flex',alignItems:'center',justifyContent:'center'}},ic('M5 12h14',{s:14,c:'#E0E0E0',w:2})),
                  h('span',{style:{fontSize:'13.5px',fontWeight:owned?600:400,color:!parentHas?'#CCCCCC':owned?'#1A1A1A':'#808080',flex:1}},e.label),
                  parentHas&&!owned&&h('span',{style:{fontSize:'11px',color:'#D88C00',fontWeight:700,flexShrink:0}},'Available'),
                  !parentHas&&h('span',{style:{fontSize:'11px',color:'#C8C8C8',fontWeight:600,flexShrink:0}},'Not in parent'));
              }
              return h('div',{style:{position:'fixed',inset:0,zIndex:60,display:'flex'}},
                h('div',{onClick:()=>setSelOrgId(null),style:{flex:1,background:'rgba(20,10,40,0.42)'}}),
                h('div',{style:{width:'480px',background:'#fff',display:'flex',flexDirection:'column',overflowY:'auto',boxShadow:'-16px 0 40px rgba(20,10,40,0.18)'}},
                  h('div',{style:{padding:'22px 24px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}},
                    h('div',null,
                      h('div',{style:{fontSize:'18px',fontWeight:700}},dSel.name),
                      h('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginTop:'6px'}},
                        h('span',{style:s(badgeSt(dSel.typeKey))},TYPE_LABELS[dSel.typeKey]),
                        h('span',{style:{fontSize:'13px',color:'#808080'}},dSel.id===home?'Your organisation':dParent?'Reports to '+dParent.name:'Platform root'))),
                    h('button',{onClick:()=>setSelOrgId(null),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},
                      ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
                  h('div',{style:{padding:'24px',flex:1}},
                    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'12px'}},
                      [['Primary contact',dSel.primaryName||dSel.contact||'—'],['Users',String(userCountFor(dSel.id))],['Sub-orgs',String(childrenOf(dSel.id).length)]].map(([label,val])=>
                        h('div',{key:label,style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px'}},
                          h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'6px'}},label),
                          h('div',{style:{fontWeight:700,fontSize:'14px',wordBreak:'break-all',color:'#5514B4'}},val)))),
                    h('div',{style:{marginBottom:'24px'}},
                      h('button',{onClick:()=>{setSelOrgId(dSel.id);setScreen('orgDetail');},style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:0,color:'#5514B4',fontWeight:700,fontSize:'13px',cursor:'pointer',padding:'0 0 16px 0',fontFamily:'inherit'}},
                        'View full profile',ic('m9 18 6-6-6-6',{s:14,c:'#5514B4'}))),
                    h('div',{style:{marginBottom:'24px'}},
                      dParent&&h('div',{style:{display:'flex',gap:'12px',marginBottom:'12px',flexWrap:'wrap'}},
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'11.5px',color:'#357E3C',fontWeight:700}},ic('M20 6 9 17l-5-5',{s:11,c:'#357E3C',w:2.5}),'Granted'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'11.5px',color:'#D88C00',fontWeight:700}},h('span',{style:{width:'11px',height:'2px',borderRadius:'1px',background:'#D88C00',display:'inline-block'}}),'Available'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'11.5px',color:'#AAAAAA',fontWeight:600}},h('span',{style:{width:'11px',height:'2px',borderRadius:'1px',background:'#CCCCCC',display:'inline-block'}}),'Not in parent')),
                    h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'4px',paddingBottom:'6px',borderBottom:'1px solid #E3E3E3'}},'Product entitlements'),
                      PRODUCT_KEYS.map(k=>h(EntRow,{key:k,entKey:k})),
                      h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'4px',paddingBottom:'6px',borderBottom:'1px solid #E3E3E3',marginTop:'20px'}},'Services & capabilities'),
                      ENT.filter(e=>e.kind==='service').map(e=>h(EntRow,{key:e.key,entKey:e.key}))),
                    canAdmin&&dSel.id!=='btw'&&dSel.id!==home&&h('button',{onClick:()=>showToast('info','Entitlements are edited with the same picker used when creating an organisation.'),style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'999px',padding:'11px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},ic('M12 5v14M5 12h14',{s:15,c:'#fff'}),'Assign entitlements'),
                    h('div',null))));
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
              return h('div',{style:{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:'1px solid #F3F3F3'}},
                owned?ic('M20 6 9 17l-5-5',{s:14,c:'#357E3C',w:2.4}):h('span',{style:{display:'flex'}},ic('M5 12h14',{s:14,c:'#C8C8C8',w:2})),
                h('span',{style:{fontSize:'13.5px',fontWeight:owned?600:400,color:owned?'#1A1A1A':'#AAAAAA'}},e.label));
            }
            return h('div',{style:{maxWidth:'1120px'}},
              h('button',{onClick:()=>{setScreen('orgs');setSelOrgId(null);},style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'none',border:0,color:'#5514B4',fontWeight:700,fontSize:'13px',cursor:'pointer',padding:'0 0 20px 0',fontFamily:'inherit'}},
                ic('m15 18-6-6 6-6',{s:15,c:'#5514B4'}),'Organisations'),
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr 320px',gap:'24px',alignItems:'start'}},

                h('div',null,
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'24px',marginBottom:'20px'}},
                    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}},
                      h('div',{style:{width:'48px',height:'48px',borderRadius:'12px',background:'#F3EBFE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2',{s:22,c:'#5514B4'})),
                      h('div',null,
                        h('div',{style:{fontSize:'20px',fontWeight:700,letterSpacing:'-0.01em'}},od.name),
                        h('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginTop:'5px'}},
                          h('span',{style:s(badgeSt(od.typeKey))},TYPE_LABELS[od.typeKey]),
                          odParent&&h('span',{style:{fontSize:'13px',color:'#808080'}},'Reports to ',h('b',null,odParent.name))))),
                    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'#E3E3E3',borderRadius:'10px',overflow:'hidden'}},
                      [['Primary contact',od.primaryName||od.contact||'—'],['Users',String(userCountFor(od.id))],['Sub-orgs',String(odChildren.length)]].map(([label,val])=>
                        h('div',{key:label,style:{background:'#F7F7F7',padding:'14px 16px'}},
                          h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'5px'}},label),
                          h('div',{style:{fontWeight:700,fontSize:'14px',color:'#5514B4',wordBreak:'break-all'}},val))))),

                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden',marginBottom:'20px'}},
                    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid #E3E3E3'}},
                      h('div',{style:{fontWeight:700,fontSize:'15px'}},'Contact details'),
                      canAdmin&&!editingContact&&h('button',{
                        onClick:()=>{setContactDraft({primaryName:od.primaryName||'',primaryEmail:od.primaryEmail||'',primaryPhone:od.primaryPhone||'',billingName:od.billingName||'',billingEmail:od.billingEmail||'',billingPhone:od.billingPhone||'',address:od.address||'',contact:od.contact||'',website:od.website||''});setEditingContact(true);},
                        title:'Edit contact details',
                        style:{display:'inline-flex',alignItems:'center',background:'none',border:'none',padding:'4px',cursor:'pointer',borderRadius:'6px',lineHeight:0}},
                        ic('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',{s:16,c:'#5514B4'}))),
                    h('div',{style:{padding:'4px 22px 22px'}},
                    editingContact&&contactDraft?(()=>{
                      const inputSt={fontSize:'14px',border:'1px solid #C8C8C8',borderRadius:'6px',padding:'6px 10px',fontFamily:'inherit',outline:'none',color:'#1A1A1A',width:'100%'};
                      const lbl=(txt)=>h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'#808080',marginBottom:'4px'}},txt);
                      const inp=(key,type)=>h('input',{value:contactDraft[key]||'',onChange:e=>setContactDraft(d=>({...d,[key]:e.target.value})),type:type||'text',style:inputSt});
                      const section=(title)=>h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#AAAAAA',padding:'12px 0 6px',borderBottom:'1px solid #F0F0F0',marginBottom:'8px'}},title);
                      return h('div',null,
                        section('Primary contact'),
                        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}},
                          h('div',null,lbl('Name'),inp('primaryName')),
                          h('div',null,lbl('Email'),inp('primaryEmail','email'))),
                        h('div',{style:{marginBottom:'16px'}},lbl('Phone'),inp('primaryPhone','tel')),
                        section('Billing contact'),
                        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}},
                          h('div',null,lbl('Name'),inp('billingName')),
                          h('div',null,lbl('Email'),inp('billingEmail','email'))),
                        h('div',{style:{marginBottom:'16px'}},lbl('Phone'),inp('billingPhone','tel')),
                        section('Organisation'),
                        h('div',{style:{marginBottom:'10px'}},lbl('Registered address'),inp('address')),
                        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}},
                          h('div',null,lbl('Contact email'),inp('contact','email')),
                          h('div',null,lbl('Website'),inp('website'))),
                        h('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},
                          h('button',{
                            onClick:()=>{setOrgs(os=>os.map(o=>o.id===od.id?{...o,...contactDraft}:o));setEditingContact(false);setContactDraft(null);showToast('success','Contact details updated.');},
                            style:{background:'#5514B4',color:'#fff',border:0,borderRadius:'999px',padding:'9px 20px',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}
                          },'Save changes'),
                          h('button',{
                            onClick:()=>{setEditingContact(false);setContactDraft(null);},
                            style:{background:'none',border:'1px solid #D0D0D0',color:'#434343',borderRadius:'999px',padding:'9px 20px',fontWeight:600,fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}
                          },'Cancel')));
                    })()
                    :(()=>{
                      const row=(label,val,type,displayText)=>h('div',{style:{display:'grid',gridTemplateColumns:'160px 1fr',gap:'8px',padding:'9px 0',borderBottom:'1px solid #F3F3F3',alignItems:'center'}},
                        h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'#808080'}},label),
                        type==='email'&&val
                          ?h('a',{href:'mailto:'+val,style:{fontSize:'14px',color:'#5514B4',textDecoration:'none'}},displayText||val)
                          :type==='url'&&val
                          ?h('a',{href:val,target:'_blank',rel:'noopener noreferrer',style:{fontSize:'14px',color:'#5514B4',textDecoration:'none'}},displayText||val)
                          :h('div',{style:{fontSize:'14px',color:'#434343'}},val||'—'));
                      const sec=(title)=>h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#AAAAAA',padding:'12px 0 4px',marginTop:'4px'}},title);
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

                  odUsers.length>0&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden',marginBottom:'20px'}},
                    h('div',{style:{padding:'18px 22px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                      h('div',{style:{fontWeight:700,fontSize:'15px'}},'Users (',odUsers.length,')'),
                      h('button',{onClick:()=>{setFilterOrg(od.id);setScreen('users');},style:{background:'none',border:0,color:'#5514B4',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:'4px'}},'View all',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))),
                    odUsers.slice(0,5).map(u=>h('div',{key:u.id,style:{display:'flex',alignItems:'center',gap:'12px',padding:'12px 22px',borderBottom:'1px solid #F0F0F0',cursor:'pointer'},onClick:()=>openUserDrawer(u.id)},
                      h('div',{style:{width:'34px',height:'34px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'12px',flexShrink:0}},initials(u.name)),
                      h('div',{style:{flex:1,minWidth:0}},
                        h('div',{style:{fontWeight:700,fontSize:'13.5px'}},u.name),
                        h('div',{style:{fontSize:'12px',color:'#808080'}},roleLabel(u.roleKey))))))),

                  odChildren.length>0&&h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                    h('div',{style:{padding:'18px 22px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                      h('div',{style:{fontWeight:700,fontSize:'15px'}},'Sub-organisations (',odChildren.length,')'),
                      h('button',{onClick:()=>setScreen('orgs'),style:{background:'none',border:0,color:'#5514B4',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:'4px'}},'View in tree',ic('m9 18 6-6-6-6',{s:13,c:'#5514B4'}))),
                    odChildren.map(c=>h('div',{key:c.id,style:{display:'flex',alignItems:'center',gap:'10px',padding:'12px 22px',borderBottom:'1px solid #F0F0F0',cursor:'pointer'},onClick:()=>setSelOrgId(c.id)},
                      h('span',{style:dotSt(c.typeKey)}),
                      h('div',{style:{flex:1}},
                        h('div',{style:{fontWeight:600,fontSize:'13.5px'}},c.name),
                        h('div',{style:{fontSize:'12px',color:'#808080'}},TYPE_LABELS[c.typeKey])),
                      h('div',{style:{fontSize:'13px',color:'#808080'}},userCountFor(c.id),' users')))),  // close text, row, map, sub-orgs card

                h('div',null,
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'20px',marginBottom:'16px'}},
                    h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'4px',paddingBottom:'8px',borderBottom:'1px solid #E3E3E3'}},'Product entitlements'),
                    PROD_KEYS.map(k=>h(OdEntRow,{key:k,entKey:k})),
                    h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'4px',paddingBottom:'8px',borderBottom:'1px solid #E3E3E3',marginTop:'20px'}},'Services & capabilities'),
                    ENT.filter(e=>e.kind==='service').map(e=>h(OdEntRow,{key:e.key,entKey:e.key})),
                    canAdmin&&od.id!=='btw'&&od.id!==home&&h('button',{onClick:()=>showToast('info','Entitlements are edited with the same picker used when creating an organisation.'),style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'8px',padding:'10px 16px',fontWeight:700,fontSize:'13px',cursor:'pointer',fontFamily:'inherit',marginTop:'16px',width:'100%',justifyContent:'center'}},ic('M12 5v14M5 12h14',{s:14,c:'#fff'}),'Edit entitlements')))));
          })(),

          screen==='users'&&h('div',{style:{maxWidth:'1120px'}},
            h('div',{style:{display:'flex',alignItems:'center',justifyContent:'flex-end',marginBottom:'20px'}},
              h('button',{onClick:inviteUser.onClick,style:inviteUser.ctaStyle},canAdmin?ic('M12 5v14M5 12h14',{s:16,c:'#fff'}):lockEl('#AAAAAA'),h('span',null,inviteUser.label))),

            h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
              // Filter bar inside card
              h('div',{style:{display:'flex',gap:'10px',padding:'12px 22px',borderBottom:'1px solid #E3E3E3',flexWrap:'wrap',alignItems:'center',background:'#fff'}},
                h('div',{style:{position:'relative',flex:'1',minWidth:'200px'}},
                  h('span',{style:{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',color:'#AAAAAA'}},
                    ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:15})),
                  h('input',{value:userSearch,onChange:e=>setUserSearch(e.target.value),placeholder:'Search by name or email…',
                    style:{width:'100%',padding:'8px 12px 8px 34px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13.5px',fontFamily:'inherit',outline:'none'}})),
                h('select',{value:filterRole,onChange:e=>setFilterRole(e.target.value),style:{padding:'8px 12px 8px 12px',paddingRight:'32px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13.5px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#2A2A2A',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}},
                  h('option',{value:''},'All roles'),
                  ROLES.map(r=>h('option',{key:r.key,value:r.key},r.label))),
                h('select',{value:filterOrg,onChange:e=>setFilterOrg(e.target.value),style:{padding:'8px 12px 8px 12px',paddingRight:'32px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13.5px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#2A2A2A',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}},
                  h('option',{value:''},'All organisations'),
                  [...new Set(visibleUsers.map(u=>u.orgId))].map(id=>{const o=orgById(id);return o?h('option',{key:id,value:id},o.name):null;})),
                h('select',{value:filterStatus,onChange:e=>setFilterStatus(e.target.value),style:{padding:'8px 12px 8px 12px',paddingRight:'32px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13.5px',background:'#fff',fontFamily:'inherit',cursor:'pointer',color:'#2A2A2A',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23808080%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}},
                  h('option',{value:''},'All statuses'),
                  ['Active','Invited','Suspended'].map(s=>h('option',{key:s,value:s},s))),
                (userSearch||filterRole||filterOrg||filterStatus)&&h('button',{
                  onClick:()=>{setUserSearch('');setFilterRole('');setFilterOrg('');setFilterStatus('');},
                  style:{padding:'8px 12px',border:'1px solid #E3E3E3',borderRadius:'8px',fontSize:'13px',fontWeight:700,background:'#fff',cursor:'pointer',fontFamily:'inherit',color:'#808080',whiteSpace:'nowrap'}},
                  'Clear')),
              h('div',{style:{display:'grid',gridTemplateColumns:'2.2fr 1.5fr 1.4fr 1fr',padding:'14px 22px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',fontSize:'12px',fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},
                h(SortHdr,{label:'User',col:'name',sort:userSort,setSort:setUserSort}),
                h(SortHdr,{label:'Role',col:'role',sort:userSort,setSort:setUserSort}),
                h(SortHdr,{label:'Organisation',col:'org',sort:userSort,setSort:setUserSort}),
                h(SortHdr,{label:'Status',col:'status',sort:userSort,setSort:setUserSort})),
              (()=>{
                const q=userSearch.toLowerCase();
                const filtered=visibleUsers.filter(u=>{
                  if(q&&!u.name.toLowerCase().includes(q)&&!u.email.toLowerCase().includes(q)) return false;
                  if(filterRole&&u.roleKey!==filterRole) return false;
                  if(filterOrg&&u.orgId!==filterOrg) return false;
                  if(filterStatus&&u.status!==filterStatus) return false;
                  return true;
                });
                if(userSort.col){
                  filtered=[...filtered].sort((a,b)=>{
                    let v1,v2;
                    if(userSort.col==='name'){v1=a.name||'';v2=b.name||'';}
                    else if(userSort.col==='role'){v1=roleLabel(a.roleKey)||'';v2=roleLabel(b.roleKey)||'';}
                    else if(userSort.col==='org'){const oa=orgById(a.orgId),ob=orgById(b.orgId);v1=oa?oa.name:'';v2=ob?ob.name:'';}
                    else if(userSort.col==='status'){v1=a.status||'';v2=b.status||'';}
                    else{v1='';v2='';}
                    return userSort.dir*v1.localeCompare(v2);
                  });
                }
                if(filtered.length===0) return h('div',{style:{padding:'48px 22px',textAlign:'center'}},
                  h('div',{style:{color:'#AAAAAA',marginBottom:'8px',display:'flex',justifyContent:'center'}},ic('M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0',{s:32,c:'#D9D9D9'})),
                  h('div',{style:{fontWeight:700,fontSize:'15px',color:'#808080',marginBottom:'4px'}},'No users match your filters'),
                  h('div',{style:{fontSize:'13px',color:'#AAAAAA'}},'Try adjusting your search or filter criteria.'));
                return filtered.map(u=>{
                  const o=orgById(u.orgId);
                  const sc=statusMap[u.status]||statusMap.Active;
                  return h('div',{key:u.id,onClick:()=>openUserDrawer(u.id),style:{display:'grid',gridTemplateColumns:'2.2fr 1.5fr 1.4fr 1fr',padding:'14px 22px',borderBottom:'1px solid #F0F0F0',alignItems:'center',cursor:'pointer'},
                    onMouseEnter:e=>e.currentTarget.style.background='#FAF6FF',
                    onMouseLeave:e=>e.currentTarget.style.background=''},
                    h('div',{style:{display:'flex',alignItems:'center',gap:'12px',minWidth:0}},
                      h('div',{style:{width:'36px',height:'36px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'13px',flexShrink:0}},initials(u.name)),
                      h('div',{style:{minWidth:0}},
                        h('div',{style:{fontWeight:700,fontSize:'14px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},u.name),
                        h('div',{style:{fontSize:'12.5px',color:'#808080',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},u.email))),
                    h('div',null,h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'5px',padding:'5px 11px',fontSize:'13px',fontWeight:700}},roleLabel(u.roleKey))),
                    h('div',{style:{fontSize:'14px',color:'#434343'}},o?o.name:'—'),
                    h('div',null,h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',borderRadius:'999px',padding:'4px 11px',fontSize:'12px',fontWeight:700,color:sc[0],background:sc[1]}},
                      h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),u.status)));
                });
              })())),

          screen==='roles'&&persona==='user'&&(()=>{
            const me=users.find(u=>u.id==='u2')||users[0];
            const myRole=ROLES.find(r=>r.key===me.roleKey)||ROLES[0];
            const myColIdx=ROLE_COL_MAP[me.roleKey]??0;
            return h('div',{style:{maxWidth:'860px'}},
              h('div',{style:{background:'#fff',border:'2px solid #5514B4',borderRadius:'16px',padding:'26px',marginBottom:'20px'}},
                h('div',{style:{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:'20px'}},
                  h('span',{style:{width:'52px',height:'52px',borderRadius:'12px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                    ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:24})),
                  h('div',null,
                    h('div',{style:{fontSize:'22px',fontWeight:700,letterSpacing:'-0.01em'}},myRole.label),
                    h('div',{style:{fontSize:'13px',color:'#808080',marginTop:'3px'}},'Your assigned role — since '+me.roleDate),
                    h('div',{style:{fontSize:'14px',color:'#434343',marginTop:'8px',lineHeight:1.5,maxWidth:'600px'}},myRole.desc))),
                h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'12px'}},'Permissions granted'),
                h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
                  myRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'10px',alignItems:'center',background:'#F0F8EF',border:'1px solid #BFE0BF',borderRadius:'9px',padding:'10px 14px',fontSize:'13px',color:'#1F5A26',fontWeight:600}},
                    ic('M20 6 9 17l-5-5',{s:13,c:'#357E3C',w:2.6}),g)))),
              h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'24px',marginBottom:'20px'}},
                h('div',{style:{fontWeight:700,fontSize:'15px',marginBottom:'6px'}},'Your permission scope'),
                h('div',{style:{fontSize:'13px',color:'#808080',marginBottom:'16px'}},'What you can access across the platform capabilities.'),
                h('div',{style:{display:'flex',gap:'14px',marginBottom:'14px',fontSize:'12px',color:'#6B6B6B'}},
                  h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'y'}),'Full'),
                  h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'p'}),'Partial'),
                  h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'n'}),'None')),
                h('div',{style:{display:'flex',flexDirection:'column',gap:'0'}},
                  ROLE_ROWS.map((row,ri)=>{
                    const v=myColIdx>=0?row[myColIdx+1]:'n';
                    return h('div',{key:ri,style:{display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom:ri<ROLE_ROWS.length-1?'1px solid #F0F0F0':'none'}},
                      h(CellMark,{v}),
                      h('span',{style:{fontSize:'13.5px',fontWeight:v==='y'?700:v==='p'?600:400,color:v==='n'?'#AAAAAA':'#2A2A2A'}},row[0]));
                  }))),
              h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px 18px',display:'flex',gap:'10px',alignItems:'flex-start'}},
                ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:16,c:'#808080'}),
                h('div',{style:{fontSize:'13px',color:'#808080',lineHeight:1.5}},'To request a role change, contact your organisation administrator (Sarah Whitfield).')));
          })(),

          screen==='roles'&&persona!=='user'&&h('div',{style:{maxWidth:'1180px'}},
            selRole
            ?h('div',null,
              h('button',{onClick:()=>setSelRole(null),style:{display:'inline-flex',alignItems:'center',gap:'7px',background:'none',border:0,color:'#5514B4',fontWeight:700,fontSize:'14px',cursor:'pointer',padding:'0 0 20px 0',fontFamily:'inherit'}},
                ic('m15 18-6-6 6-6',{s:16,c:'#5514B4'}),'All roles'),
              selRoleObj&&h('div',null,
                h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'26px',marginBottom:'20px'}},
                  h('div',{style:{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:'20px'}},
                    h('span',{style:{width:'52px',height:'52px',borderRadius:'12px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                      ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:24})),
                    h('div',null,
                      h('div',{style:{fontSize:'22px',fontWeight:700,letterSpacing:'-0.01em'}},selRoleObj.label),
                      h('div',{style:{fontSize:'14px',color:'#434343',marginTop:'6px',lineHeight:1.5,maxWidth:'600px'}},selRoleObj.desc))),
                  h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'12px'}},'Permissions granted'),
                  h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
                    selRoleObj.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'10px',alignItems:'center',background:'#F0F8EF',border:'1px solid #BFE0BF',borderRadius:'9px',padding:'10px 14px',fontSize:'13px',color:'#1F5A26',fontWeight:600}},
                      ic('M20 6 9 17l-5-5',{s:13,c:'#357E3C',w:2.6}),g)))),
                h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}},
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'24px'}},
                    h('div',{style:{fontWeight:700,fontSize:'16px',marginBottom:'16px'}},'Permission categories'),
                    h('div',{style:{display:'flex',gap:'14px',marginBottom:'14px',fontSize:'12px',color:'#6B6B6B'}},
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'y'}),'Full'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'p'}),'Partial'),
                      h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px'}},h(CellMark,{v:'n'}),'None')),
                    ROLE_ROWS.map((row,ri)=>{
                      const v=selRoleColIdx>=0?row[selRoleColIdx+1]:'n';
                      return h('div',{key:ri,style:{display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom:ri<ROLE_ROWS.length-1?'1px solid #F0F0F0':'none'}},
                        h(CellMark,{v}),
                        h('span',{style:{fontSize:'13.5px',fontWeight:v==='y'?700:v==='p'?600:400,color:v==='n'?'#AAAAAA':'#2A2A2A'}},row[0]));
                    })),
                  h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',padding:'24px'}},
                    h('div',{style:{fontWeight:700,fontSize:'16px',marginBottom:'16px'}},'Users holding this role (',selRoleUsers.length,')'),
                    selRoleUsers.length===0
                    ?h('div',{style:{fontSize:'14px',color:'#808080',padding:'10px 0'}},'No users currently hold this role.')
                    :h('div',{style:{display:'flex',flexDirection:'column'}},
                      selRoleUsers.map(u=>{
                        const o=orgById(u.orgId);const sc=statusMap[u.status]||statusMap.Active;
                        return h('div',{key:u.id,onClick:()=>{setScreen('users');setUserDrawer(u.id);},style:{display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom:'1px solid #F0F0F0',cursor:'pointer'},
                          onMouseEnter:e=>e.currentTarget.style.background='#FAF6FF',
                          onMouseLeave:e=>e.currentTarget.style.background=''},
                          h('div',{style:{width:'36px',height:'36px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'13px',flexShrink:0}},initials(u.name)),
                          h('div',{style:{flex:1,minWidth:0}},
                            h('div',{style:{fontWeight:700,fontSize:'14px'}},u.name),
                            h('div',{style:{fontSize:'12px',color:'#808080'}},o?o.name:'')),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'3px 10px',fontSize:'12px',fontWeight:700,color:sc[0],background:sc[1]}},
                            h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),u.status));
                      }))))))

            :h('div',null,
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr',gap:'16px',marginBottom:'34px'}},
                [persona].map(k=>{
                  const pp=PERSONAS[k];const active=k===persona;
                  return h('div',{key:k,style:{background:'#fff',borderRadius:'16px',border:active?'2px solid #5514B4':'1px solid #E3E3E3',overflow:'hidden'}},
                    h('div',{style:{display:'flex',alignItems:'center',gap:'10px',padding:'20px',cursor:'pointer'},
                      onClick:()=>setPersonaCardOpen(o=>!o)},
                      h('span',{style:{width:'34px',height:'34px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',background:k==='bt'?'#5514B4':pp.accent}},k==='bt'?h('span',{style:{fontWeight:900,fontSize:'13px',letterSpacing:'-0.02em'}},'BT'):ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:17})),
                      h('div',{style:{fontWeight:700,fontSize:'15px'}},pp.name),
                      active&&h('span',{style:{marginLeft:'auto',fontSize:'10.5px',fontWeight:700,color:'#fff',background:'#5514B4',padding:'3px 8px',borderRadius:'5px'}},'ACTIVE'),
                      h('span',{style:{marginLeft:active?'10px':'auto',color:'#808080',display:'flex',flexShrink:0,transform:personaCardOpen?'rotate(180deg)':'rotate(0deg)',transition:'transform 200ms'}},
                        ic('m6 9 6 6 6-6',{s:18}))),
                    personaCardOpen&&h('div',{style:{padding:'0 20px 20px'}},
                      h('div',{style:{fontSize:'13px',color:'#434343',lineHeight:1.45,marginBottom:'14px'}},pp.desc),
                      pp.can.map((c,i)=>h('div',{key:i,style:{display:'flex',gap:'7px',alignItems:'flex-start',fontSize:'12.5px',color:'#434343',marginBottom:'5px'}},
                        ic('M20 6 9 17l-5-5',{s:14,c:'#357E3C',w:2.4}),h('span',null,c)))));
                })),

              (()=>{
                const tabs=isBt
                  ?[{key:'orgProfiles',label:'Organisation types'},{key:'roleDirectory',label:'Available roles'},{key:'resellerAdmins',label:'Reseller admins'},{key:'whoHasAccess',label:'Who has access?'}]
                  :[{key:'orgProfiles',label:'Organisation types'},{key:'roleDirectory',label:'Available roles'},{key:'userRoles',label:'Your team\'s roles'},{key:'whoHasAccess',label:'Who has access?'}];
                const activeTab=rolesTab;
                const tabBtnSt=active=>({background:'none',border:'none',padding:'10px 18px',fontSize:'14px',fontWeight:active?700:500,color:active?'#5514B4':'#808080',cursor:'pointer',borderBottom:active?'2px solid #5514B4':'2px solid transparent',marginBottom:'-1px',fontFamily:'inherit',transition:'color 0.15s'});
                const whoHasAccessPanel=isBt
                  ?h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                    h('div',{style:{overflowX:'auto'}},
                      h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'640px'}},
                        h('thead',null,h('tr',null,
                          h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Capability'),
                          PROFILE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 10px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'120px'}},hd)))),
                        h('tbody',null,PROFILE_ROWS.map((row,ri)=>h('tr',{key:ri},
                          h('td',{style:{textAlign:'left',padding:'12px 22px',fontSize:'13.5px',borderBottom:'1px solid #F0F0F0'}},row[0]),
                          row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'12px 10px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))))
                  :h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                    h('div',{style:{overflowX:'auto'}},
                      h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'820px'}},
                        h('thead',null,h('tr',null,
                          h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Permission area'),
                          ROLE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 8px',fontSize:'12.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'96px'}},hd)))),
                        h('tbody',null,ROLE_ROWS.map((row,ri)=>h('tr',{key:ri},
                          h('td',{style:{textAlign:'left',padding:'13px 22px',fontSize:'13.5px',fontWeight:700,borderBottom:'1px solid #F0F0F0'}},row[0]),
                          row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'13px 8px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))));
                return h('div',null,
                  h('div',{style:{display:'flex',borderBottom:'1px solid #E3E3E3',marginBottom:'24px'}},
                    tabs.map(t=>h('button',{key:t.key,onClick:()=>setRolesTab(t.key),style:tabBtnSt(activeTab===t.key)},t.label))),
                  activeTab==='orgProfiles'&&h('div',null,
                    h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},isBt
                      ?'Four organisation types make up the BT Wholesale network. Each is built on a capability profile — this defines what they can do on the platform and what permissions they can pass down to the next tier.'
                      :'Your network includes different types of downstream organisations. This shows what each type is set up to do on the platform.'),
                    h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                      h('div',{style:{overflowX:'auto'}},h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'640px'}},
                        h('thead',null,h('tr',null,
                          h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Capability'),
                          PROFILE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 10px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'120px'}},hd)))),
                        h('tbody',null,PROFILE_ROWS.map((row,ri)=>h('tr',{key:ri},
                          h('td',{style:{textAlign:'left',padding:'12px 22px',fontSize:'13.5px',borderBottom:'1px solid #F0F0F0'}},row[0]),
                          row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'12px 10px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v})))))))))),
                  activeTab==='roleDirectory'&&h('div',null,
                    h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},isBt
                      ?'These are the roles available to BT Wholesale staff. Each role defines what someone can configure, view, or manage across the platform.'
                      :'Each role controls exactly what a user can see and do in the platform. When you assign someone a role, they get access to everything it covers — no more, no less.'),
                    h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                      h('table',{style:{borderCollapse:'collapse',width:'100%'}},
                        h('thead',null,h('tr',null,
                          h('th',{style:{textAlign:'left',padding:'13px 22px',fontSize:'11.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},'Role'),
                          h('th',{style:{textAlign:'left',padding:'13px 22px',fontSize:'11.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},'Description'),
                          h('th',{style:{textAlign:'right',padding:'13px 22px',fontSize:'11.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080',whiteSpace:'nowrap'}},'Users assigned'))),
                        h('tbody',null,(isBt?BT_ROLES:ROLES).map((r,i,arr)=>h('tr',{key:r.key,
                          style:{cursor:'pointer'},
                          onClick:()=>isBt?null:setSelRole(r.key),
                          onMouseEnter:e=>{e.currentTarget.style.background='#FAF6FF';},
                          onMouseLeave:e=>{e.currentTarget.style.background='';} },
                          h('td',{style:{padding:'14px 22px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none',fontWeight:700,fontSize:'13.5px',whiteSpace:'nowrap'}},r.label),
                          h('td',{style:{padding:'14px 22px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none',fontSize:'13px',color:'#6B6B6B',lineHeight:1.45}},r.desc),
                          h('td',{style:{padding:'14px 22px',borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none',textAlign:'right',fontSize:'13px',color:'#5514B4',fontWeight:700}},
                            isBt?String(r.users):String(users.filter(u=>u.roleKey===r.key).length)))))))),
                  (activeTab==='userRoles'||activeTab==='resellerAdmins')&&(isBt
                    ?h('div',null,
                        h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},'These are the named administrators across your reseller network. Each reseller needs an active administrator before their users and downstream organisations can be managed.'),
                        h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden',marginBottom:'12px'}},
                          h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 120px',padding:'11px 20px',background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',fontSize:'11.5px',fontWeight:700,letterSpacing:'0.05em',textTransform:'uppercase',color:'#808080'}},'Organisation','Administrator','Email','Status'),
                          orgs.filter(o=>o.typeKey==='reseller').map(o=>{
                            const admin=users.find(u=>u.orgId===o.id&&u.roleKey==='admin');
                            const sc=admin?statusMap[admin.status]||statusMap.Active:null;
                            return h('div',{key:o.id,style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 120px',padding:'13px 20px',borderBottom:'1px solid #F0F0F0',alignItems:'center'}},
                              h('div',{style:{fontWeight:700,fontSize:'13.5px'}},o.name),
                              admin
                                ?h('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
                                    h('div',{style:{width:'28px',height:'28px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'11px',flexShrink:0}},initials(admin.name)),
                                    h('div',{style:{fontSize:'13px',fontWeight:600}},admin.name))
                                :h('div',{style:{fontSize:'13px',color:'#AAAAAA'}},'No admin set'),
                              h('div',{style:{fontSize:'12.5px',color:'#808080'}},admin?admin.email:'—'),
                              admin&&sc
                                ?h('span',{style:{display:'inline-flex',alignItems:'center',gap:'5px',borderRadius:'999px',padding:'3px 9px',fontSize:'11.5px',fontWeight:700,color:sc[0],background:sc[1]}},
                                    h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),admin.status)
                                :h('span',null,'—'));
                          })),
                        h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px 18px',display:'flex',gap:'10px',alignItems:'flex-start'}},
                          h('span',{style:{color:'#808080',flexShrink:0,marginTop:'1px'}},ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:15,c:'#808080'})),
                          h('div',{style:{fontSize:'13px',color:'#808080',lineHeight:1.5}},'Day-to-day user roles within each reseller — such as Order Manager, Billing Manager and Support — are set and managed by each reseller\'s own administrator. You don\'t configure those from here.')))
                    :h('div',null,
                        h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},'This shows what each role in your organisation can access. Use it when deciding which role to assign to a new team member, or to check what someone currently has access to.'),
                        h('div',{style:{display:'flex',gap:'18px',alignItems:'center',marginBottom:'12px',fontSize:'12.5px',color:'#6B6B6B'}},
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'7px'}},h(CellMark,{v:'y'}),'Full access'),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'7px'}},h(CellMark,{v:'p'}),'Partial access'),
                          h('span',{style:{display:'inline-flex',alignItems:'center',gap:'7px'}},h(CellMark,{v:'n'}),'No access')),
                        h('div',{style:{background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',overflow:'hidden'}},
                          h('div',{style:{overflowX:'auto'}},h('table',{style:{borderCollapse:'collapse',width:'100%',minWidth:'820px'}},
                            h('thead',null,h('tr',null,
                              h('th',{style:{textAlign:'left',padding:'15px 22px',fontSize:'13px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3'}},'Permission area'),
                              ROLE_HEADERS.map((hd,i)=>h('th',{key:i,style:{padding:'15px 8px',fontSize:'12.5px',fontWeight:700,background:'#F7F7F7',borderBottom:'1px solid #E3E3E3',textAlign:'center',minWidth:'96px'}},hd)))),
                            h('tbody',null,ROLE_ROWS.map((row,ri)=>h('tr',{key:ri},
                              h('td',{style:{textAlign:'left',padding:'13px 22px',fontSize:'13.5px',fontWeight:700,borderBottom:'1px solid #F0F0F0'}},row[0]),
                              row.slice(1).map((v,ci)=>h('td',{key:ci,style:{textAlign:'center',padding:'13px 8px',borderBottom:'1px solid #F0F0F0'}},h(CellMark,{v}))))))))))),
                  activeTab==='whoHasAccess'&&h('div',null,
                    h('p',{style:{fontSize:'13.5px',color:'#6B6B6B',lineHeight:1.55,marginBottom:'16px',marginTop:0}},isBt
                      ?'A complete breakdown of which platform capabilities each organisation type in your network can access.'
                      :'A complete breakdown of which permission areas each role in your organisation can access. Use this to understand what you\'re granting when you assign someone a role.'),
                    whoHasAccessPanel));
              })()))),


        // User Wizard
        userWiz&&h('div',{onClick:()=>setUserWiz(null),style:{position:'fixed',inset:0,background:'rgba(20,10,40,0.42)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px',zIndex:50}},
          h('div',{onClick:e=>e.stopPropagation(),style:{background:'#fff',borderRadius:'16px',width:'680px',maxWidth:'100%',maxHeight:'90vh',display:'flex',flexDirection:'column',overflow:'hidden'}},
            h('div',{style:{padding:'22px 26px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between'}},
              h('div',null,
                h('div',{style:{fontSize:'18px',fontWeight:700}},'Invite a user'),
                h('div',{style:{fontSize:'13px',color:'#808080',marginTop:'2px'}},'Step '+userWiz.step+' of 3 · '+['Details','Role','Review'][userWiz.step-1])),
              h('button',{onClick:()=>setUserWiz(null),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
            h('div',{style:{height:'4px',background:'#F0F0F0'}},h('div',{style:{height:'100%',background:'#5514B4',width:Math.round(userWiz.step/3*100)+'%',transition:'width 240ms ease'}})),
            h('div',{style:{padding:'26px',overflowY:'auto',flex:1}},
              userWiz.step===1&&h('div',null,
                h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Full name'),
                h('input',{value:userWiz.name,onChange:e=>setUserWiz(w=>({...w,name:e.target.value})),placeholder:'e.g. Morgan Hale',style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',marginBottom:'20px',fontFamily:'inherit'}}),
                h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Email address'),
                h('input',{value:userWiz.email,onChange:e=>setUserWiz(w=>({...w,email:e.target.value})),placeholder:'morgan.hale@northgate.co.uk',style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',marginBottom:'20px',fontFamily:'inherit'}}),
                h('label',{style:{display:'block',fontSize:'13px',fontWeight:700,marginBottom:'7px'}},'Organisation'),
                h('select',{value:userWiz.orgId,onChange:e=>setUserWiz(w=>({...w,orgId:e.target.value})),style:{width:'100%',padding:'12px 14px',border:'1px solid #C8C8C8',borderRadius:'8px',fontSize:'15px',background:'#fff',cursor:'pointer',fontFamily:'inherit'}},
                  [orgById('northgate'),...childrenOf('northgate')].map(o=>h('option',{key:o.id,value:o.id},o.name+' · '+TYPE_LABELS[o.typeKey])))),
              userWiz.step===2&&h('div',{style:{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:'20px'}},
                h('div',null,
                  h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},'Assign a role'),
                  h('div',{style:{display:'flex',flexDirection:'column',gap:'9px',maxHeight:'344px',overflowY:'auto',paddingRight:'4px'}},
                    ROLES.map(r=>{
                      const active=userWiz.role===r.key;
                      return h('button',{key:r.key,onClick:()=>setUserWiz(w=>({...w,role:r.key})),style:{display:'flex',alignItems:'flex-start',gap:'11px',width:'100%',padding:'12px 13px',borderRadius:'11px',cursor:'pointer',border:'1px solid '+(active?'#5514B4':'#E3E3E3'),background:active?'#FAF6FF':'#fff',fontFamily:'inherit'}},
                        h('span',{style:{width:'19px',height:'19px',borderRadius:'999px',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',background:active?'#5514B4':'#fff',border:'1px solid '+(active?'#5514B4':'#C8C8C8')}},active&&h('span',{style:{width:'10px',height:'10px',borderRadius:'999px',background:'#fff'}})),
                        h('span',{style:{textAlign:'left'}},h('span',{style:{display:'block',fontWeight:700,fontSize:'14px'}},r.label),h('span',{style:{display:'block',fontSize:'12px',color:'#808080',lineHeight:1.35}},r.desc)));
                    }))),
                h('div',null,
                  h('div',{style:{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},'Permissions granted'),
                  h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'16px',maxHeight:'344px',overflowY:'auto'}},
                    h('div',{style:{fontWeight:700,fontSize:'14px',marginBottom:'12px'}},(ROLES.find(r=>r.key===userWiz.role)||ROLES[0]).label),
                    (ROLES.find(r=>r.key===userWiz.role)||ROLES[0]).grants.map((pm,i)=>
                      h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'flex-start',fontSize:'12.5px',marginBottom:'7px'}},
                        ic('M20 6 9 17l-5-5',{s:14,c:'#5514B4',w:2.4}),h('span',null,pm)))))),
              userWiz.step===3&&h('div',null,
                h('div',{style:{display:'flex',alignItems:'center',gap:'14px',marginBottom:'20px'}},
                  h('div',{style:{width:'52px',height:'52px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'18px',flexShrink:0}},initials(userWiz.name||'?')),
                  h('div',null,h('div',{style:{fontWeight:700,fontSize:'17px'}},userWiz.name||'(unnamed)'),h('div',{style:{fontSize:'13px',color:'#808080'}},userWiz.email))),
                h('div',{style:{border:'1px solid #E3E3E3',borderRadius:'12px',overflow:'hidden',marginBottom:'12px'}},
                  [['Role',(ROLES.find(r=>r.key===userWiz.role)||ROLES[0]).label],['Organisation',(orgById(userWiz.orgId)||{name:'—'}).name]].map(([k,v],i)=>
                    h('div',{key:k,style:{display:'flex',justifyContent:'space-between',padding:'13px 16px',borderBottom:'1px solid #F0F0F0'}},
                      h('span',{style:{color:'#808080',fontSize:'13px'}},k),h('span',{style:{fontWeight:700,fontSize:'14px'}},v))),
                  h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 16px'}},
                    h('span',{style:{color:'#808080',fontSize:'13px'}},'Status on creation'),
                    h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'#FEF6DE',color:'#8A5A00',borderRadius:'999px',padding:'4px 11px',fontSize:'12px',fontWeight:700}},h('span',{style:{width:'6px',height:'6px',borderRadius:'999px',background:'currentColor'}}),'Invited'))),
                h('div',{style:{fontSize:'12.5px',color:'#808080',lineHeight:1.5}},'An invitation email will be sent. The user gains access once they accept and set a password.'))),
            h('div',{style:{padding:'18px 26px',borderTop:'1px solid #E3E3E3',display:'flex',justifyContent:'space-between',alignItems:'center'}},
              h('button',{onClick:()=>setUserWiz(w=>({...w,step:Math.max(1,w.step-1)})),style:{background:'#fff',border:'1px solid #C8C8C8',borderRadius:'999px',padding:'11px 20px',fontWeight:700,fontSize:'14px',cursor:'pointer',visibility:userWiz.step===1?'hidden':'visible',fontFamily:'inherit'}},'Back'),
              h('button',{onClick:()=>{
                if(userWiz.step<3){setUserWiz(w=>({...w,step:w.step+1}));return;}
                const o=orgById(userWiz.orgId);const id='nu'+seq;
                const user={id,name:userWiz.name.trim()||'New user',email:userWiz.email.trim()||'—',roleKey:userWiz.role,orgId:userWiz.orgId,status:'Invited'};
                setUsers(us=>[...us,user]);setSeq(n=>n+1);setUserWiz(null);setScreen('users');
                showToast('success','Invitation sent to '+user.name+' as '+roleLabel(userWiz.role)+' at '+(o?o.name:'Northgate Telecom')+'.');
              },style:{display:'inline-flex',alignItems:'center',gap:'8px',background:'#5514B4',color:'#fff',border:0,borderRadius:'999px',padding:'11px 22px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit'}},userWiz.step===3?'Send invitation':'Continue')))),

        // User profile drawer
        userDrawer&&drawerUser&&h('div',{style:{position:'fixed',inset:0,zIndex:60,display:'flex'}},
          h('div',{onClick:()=>closeUserDrawer(),style:{flex:1,background:'rgba(20,10,40,0.42)'}}),
          h('div',{style:{width:'420px',background:'#fff',display:'flex',flexDirection:'column',overflowY:'auto',boxShadow:'-16px 0 40px rgba(20,10,40,0.18)'}},
            h('div',{style:{padding:'22px 24px',borderBottom:'1px solid #E3E3E3',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}},
              h('div',{style:{fontWeight:700,fontSize:'18px'}},'User profile'),
              h('button',{onClick:()=>closeUserDrawer(),style:{width:'34px',height:'34px',borderRadius:'999px',border:'1px solid #E3E3E3',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:17}))),
            h('div',{style:{padding:'26px',flex:1}},
              h('div',{style:{display:'flex',alignItems:'center',gap:'16px',marginBottom:'24px'}},
                h('div',{style:{width:'60px',height:'60px',borderRadius:'999px',background:'#F3EBFE',color:'#5514B4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'20px',flexShrink:0}},initials(drawerUser.name)),
                h('div',null,
                  h('div',{style:{fontWeight:700,fontSize:'19px'}},drawerUser.name),
                  h('div',{style:{fontSize:'14px',color:'#808080',marginTop:'3px'}},drawerUser.email))),
              h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'24px'}},
                h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px'}},
                  h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'8px'}},'Status'),
                  h('span',{style:{display:'inline-flex',alignItems:'center',gap:'6px',borderRadius:'999px',padding:'5px 12px',fontSize:'13px',fontWeight:700,color:(statusMap[drawerUser.status]||statusMap.Active)[0],background:(statusMap[drawerUser.status]||statusMap.Active)[1]}},
                    h('span',{style:{width:'7px',height:'7px',borderRadius:'999px',background:'currentColor'}}),drawerUser.status)),
                h('div',{style:{background:'#F7F7F7',border:'1px solid #E3E3E3',borderRadius:'12px',padding:'14px'}},
                  h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'8px'}},'Organisation'),
                  h('div',{style:{fontWeight:700,fontSize:'14px'}},drawerOrg?drawerOrg.name:'—'))),
              drawerRole&&(()=>{
                const previewKey=drawerPendingRole??drawerUser.roleKey;
                const previewRole=ROLES.find(r=>r.key===previewKey)||drawerRole;
                const isPreviewing=previewKey!==drawerUser.roleKey;
                return h('div',null,
                  h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'11px'}},
                    h('div',null,
                      h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080'}},
                        isPreviewing?'Role preview':'Current role'),
                      !isPreviewing&&drawerUser.roleDate&&h('div',{style:{fontSize:'11px',color:'#AAAAAA',marginTop:'2px'}},'Since '+drawerUser.roleDate)),
                    isPreviewing&&h('span',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'#5514B4',background:'#F3EBFE',padding:'3px 8px',borderRadius:'6px'}},'Preview')),
                  h('div',{style:{background:'#FAF6FF',border:'2px solid '+(isPreviewing?'#8B44D4':'#5514B4'),borderRadius:'14px',padding:'18px',marginBottom:'16px',transition:'border-color 0.15s'}},
                    h('div',{style:{display:'flex',gap:'12px',alignItems:'center',marginBottom:'12px'}},
                      h('span',{style:{width:'36px',height:'36px',borderRadius:'9px',background:'#5514B4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                        ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',{s:17})),
                      h('div',null,
                        h('div',{style:{fontWeight:700,fontSize:'15px'}},previewRole.label),
                        h('div',{style:{fontSize:'12.5px',color:'#808080',marginTop:'2px'}},previewRole.desc))),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'6px'}},
                      previewRole.grants.map((g,i)=>h('div',{key:i,style:{display:'flex',gap:'8px',alignItems:'center',fontSize:'12.5px',color:'#3F187F'}},
                        ic('M20 6 9 17l-5-5',{s:13,c:'#5514B4',w:2.4}),g)))),
                  canAdmin&&h('div',null,
                    h('div',{style:{fontSize:'11px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'#808080',marginBottom:'11px'}},'Change role'),
                    h('div',{style:{display:'flex',flexDirection:'column',gap:'7px'}},
                      ROLES.map(r=>h('button',{key:r.key,
                        onClick:()=>setDrawerPendingRole(r.key===drawerUser.roleKey&&!isPreviewing?null:r.key),
                        style:{display:'flex',alignItems:'center',gap:'10px',width:'100%',padding:'10px 12px',border:'1px solid '+(r.key===previewKey?'#5514B4':'#E3E3E3'),borderRadius:'9px',background:r.key===previewKey?'#FAF6FF':'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}},
                        h('span',{style:{width:'18px',height:'18px',borderRadius:'999px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:r.key===previewKey?'#5514B4':'#fff',border:'1px solid '+(r.key===previewKey?'#5514B4':'#C8C8C8')}},
                          r.key===previewKey&&h('span',{style:{width:'9px',height:'9px',borderRadius:'999px',background:'#fff'}})),
                        h('div',{style:{flex:1,minWidth:0}},
                          h('span',{style:{fontWeight:700,fontSize:'13.5px',color:r.key===previewKey?'#5514B4':'#2A2A2A'}},r.label),
                          r.key===drawerUser.roleKey&&h('span',{style:{marginLeft:'8px',fontSize:'11px',fontWeight:700,color:'#808080',background:'#F0F0F0',padding:'2px 6px',borderRadius:'5px'}},'Current'))))),
                    h('button',{
                      onClick:()=>{
                        if(!isPreviewing)return;
                        setUsers(us=>us.map(u=>u.id===drawerUser.id?{...u,roleKey:previewKey}:u));
                        closeUserDrawer();
                        showToast('success',drawerUser.name+' changed to '+previewRole.label+'.');
                      },
                      style:{width:'100%',padding:'11px',marginTop:'12px',background:isPreviewing?'#5514B4':'#E3E3E3',color:isPreviewing?'#fff':'#AAAAAA',border:0,borderRadius:'10px',fontWeight:700,fontSize:'14px',cursor:isPreviewing?'pointer':'default',fontFamily:'inherit'}},
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
              h('div',{style:{display:'flex',gap:'4px',borderBottom:'2px solid #E3E3E3',marginBottom:'28px'}},
                STABS.map(t=>h('button',{key:t.key,onClick:()=>setSettingsTab(t.key),style:{display:'inline-flex',alignItems:'center',gap:'7px',padding:'10px 16px',background:'none',border:'none',borderBottom:settingsTab===t.key?'2px solid #5514B4':'2px solid transparent',marginBottom:'-2px',color:settingsTab===t.key?'#5514B4':'#808080',fontWeight:settingsTab===t.key?700:500,fontSize:'13.5px',cursor:'pointer',fontFamily:'inherit',transition:'color 150ms',whiteSpace:'nowrap'}},
                  ic(t.icon,{s:15,c:settingsTab===t.key?'#5514B4':'#808080'}),t.label))),
              h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'52vh'}},
                h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',textAlign:'center',maxWidth:'440px',width:'100%'}},
                  h('div',{style:{width:'52px',height:'52px',borderRadius:'14px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'18px',color:'#5514B4'}},
                    ic(cur.icon,{s:24})),
                  h('div',{style:{fontWeight:700,fontSize:'17px',color:'#1A1A1A',marginBottom:'8px'}},cur.title),
                  h('div',{style:{fontSize:'13.5px',color:'#808080',lineHeight:1.6,marginBottom:'6px'}},cur.desc),
                  h('div',{style:{fontSize:'12px',color:'#AAAAAA',marginTop:'4px'}},'Content coming soon'))));
          })(),

          screen==='helpSupport'&&h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}},
            h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 40px',background:'#fff',border:'1px solid #E3E3E3',borderRadius:'16px',textAlign:'center',maxWidth:'440px',width:'100%'}},
              h('div',{style:{width:'56px',height:'56px',borderRadius:'16px',background:'#F0EBF9',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',color:'#5514B4'}},
                ic(['M3 18v-6a9 9 0 0 1 18 0v6','M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'],{s:26})),
              h('div',{style:{fontWeight:700,fontSize:'18px',color:'#1A1A1A',marginBottom:'10px'}},'Coming soon'),
              h('div',{style:{fontSize:'14px',color:'#808080',lineHeight:1.6,maxWidth:'340px'}},'Help and support resources are on their way. In the meantime, contact your BT Wholesale account manager for assistance.'))),

        // Toast
        toast&&h('div',{style:{position:'fixed',bottom:'24px',right:'24px',zIndex:80,display:'flex',alignItems:'center',gap:'12px',padding:'15px 18px',borderRadius:'14px',background:'#fff',border:'1px solid #E3E3E3',boxShadow:'0 12px 32px rgba(20,10,40,0.18)',maxWidth:'420px'}},
          h('span',{style:{width:'34px',height:'34px',borderRadius:'999px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',background:toast.kind==='success'?'#357E3C':toast.kind==='error'?'#DA020F':'#5514B4'}},
            toast.kind==='success'?ic('M20 6 9 17l-5-5',{s:18,c:'#fff',w:2.6}):toast.kind==='error'?lockEl('#fff'):ic(['M12 16v-4','M12 8h.01'],{s:18,c:'#fff'})),
          h('div',{style:{fontSize:'13.5px',color:'#2A2A2A',lineHeight:1.4,flex:1}},toast.msg),
          h('button',{onClick:()=>setToast(null),style:{border:0,background:'transparent',cursor:'pointer',color:'#AAAAAA',display:'flex',padding:'2px',fontFamily:'inherit'}},ic(['M18 6 6 18','M6 6l12 12'],{s:16}))))));}



ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();

