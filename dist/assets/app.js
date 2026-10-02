const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Open menu');nav?.classList.remove('open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menuButton.focus();}});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
const quoteForm=document.querySelector('#quote-form');
if(quoteForm){
 const review=document.querySelector('#enquiry-review');
 const error=document.querySelector('#form-error');
 const cleanFields=document.querySelector('#cleaning-fields');
 const moveFields=document.querySelector('#removal-fields');
 const dateInput=document.querySelector('#preferred-date');
 const now=new Date();
 const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 dateInput.min=today;
 function toggleFields(){
  const choice=quoteForm.elements.service.value;
  const cleaning=choice==='cleaning'||choice==='both';
  const moving=choice==='removals'||choice==='both';
  cleanFields.hidden=!cleaning;moveFields.hidden=!moving;
  cleanFields.querySelectorAll('input,select').forEach(el=>{el.disabled=!cleaning;el.required=cleaning&&el.name==='cleanPostcode';});
  moveFields.querySelectorAll('input,textarea').forEach(el=>{el.disabled=!moving;el.required=moving;});
 }
 const params=new URLSearchParams(location.search);
 const requestedService=params.get('service');
 if(['cleaning','removals','both'].includes(requestedService)){quoteForm.querySelector(`input[value="${requestedService}"]`).checked=true;}
 const requestedType=params.get('type');
 if([...quoteForm.elements.cleanType.options].some(o=>o.value===requestedType)){quoteForm.elements.cleanType.value=requestedType;}
 quoteForm.elements.service.forEach(input=>input.addEventListener('change',toggleFields));toggleFields();
 quoteForm.addEventListener('input',event=>{event.target.removeAttribute('aria-invalid');error.hidden=true;});
 function fail(message,field){error.textContent=message;error.hidden=false;field.setAttribute('aria-invalid','true');field.focus();}
 let enquiry='';
 quoteForm.addEventListener('submit',event=>{
  event.preventDefault();
  quoteForm.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  const fields=Array.from(quoteForm.querySelectorAll('input,select,textarea')).filter(el=>!el.disabled&&el.type!=='radio');
  for(const field of fields){
   if(field.required&&!field.value.trim()){fail('Please complete the required fields so we can understand your enquiry.',field);return;}
   if(field.type==='email'&&field.value&&!field.validity.valid){fail('Please enter a valid email address.',field);return;}
  }
  if(dateInput.value&&dateInput.value<today){fail('Please choose today or a future date, or leave the date blank.',dateInput);return;}
  const data=new FormData(quoteForm);
  const value=key=>String(data.get(key)||'').trim();
  if(!value('phone')&&!value('email')){fail('Please add a phone number or email address so we can reply.',quoteForm.elements.phone);return;}
  if(value('phone')&&value('phone').replace(/\D/g,'').length<7){fail('Please check your phone number, or leave it blank and use an email address.',quoteForm.elements.phone);return;}
  const service=value('service');
  const lines=['Hello Spotless Vibes! I’d like a quote.','',`Service: ${service==='both'?'Cleaning + removals':service==='cleaning'?'Cleaning':'Removals'}`];
  if(service!=='removals'){
   lines.push(`Cleaning: ${quoteForm.elements.cleanType.selectedOptions[0].text}`,`Frequency: ${value('frequency')}`,`Cleaning postcode: ${value('cleanPostcode').toUpperCase()}`);
   if(value('size'))lines.push(`Property size: ${value('size')}`);
  }
  if(service!=='cleaning')lines.push(`Collection postcode: ${value('pickup').toUpperCase()}`,`Delivery postcode: ${value('dropoff').toUpperCase()}`,`Items and access: ${value('items')}`);
  const selectedDate=value('date');
  lines.push(`Preferred date: ${selectedDate?new Date(selectedDate+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Flexible / to discuss'}`,'',`Name: ${value('name')}`);
  if(value('phone'))lines.push(`Phone: ${value('phone')}`);
  if(value('email'))lines.push(`Email: ${value('email')}`);
  if(value('notes'))lines.push('',`Additional details: ${value('notes')}`);
  lines.push('','Please let me know your availability and quote.');
  enquiry=lines.join('\n');
  document.querySelector('#enquiry-text').textContent=enquiry;
  document.querySelector('#whatsapp-send').href='https://wa.me/447881655298?text='+encodeURIComponent(enquiry);
  document.querySelector('#email-send').href='mailto:Spotlessvibes@yahoo.com?subject='+encodeURIComponent('Quote request: '+(service==='both'?'Cleaning and removals':service))+'&body='+encodeURIComponent(enquiry);
  error.hidden=true;quoteForm.hidden=true;review.hidden=false;review.focus();review.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 });
 document.querySelector('#edit-enquiry').addEventListener('click',()=>{review.hidden=true;quoteForm.hidden=false;quoteForm.querySelector('input[name=service]:checked').focus();});
 document.querySelector('#copy-enquiry').addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(enquiry);status.textContent='Copied to clipboard';}catch{const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(document.querySelector('#enquiry-text'));selection.removeAllRanges();selection.addRange(range);status.textContent='Text selected. Use your device’s copy option.';}});
 const modelContext=document.modelContext;
 if(modelContext?.registerTool){
  const lifecycle=new AbortController();
  const supported={service:['cleaning','removals','both'],cleanType:['regular','deep','moving-clean','office','laundry','carpet']};
  try{Promise.resolve(modelContext.registerTool({
   name:'stage_service_enquiry',title:'Prepare service enquiry details',
   description:'Fill the visible cleaning or removals enquiry form for review. Does not send a message, make a booking, or open an external service.',
   inputSchema:{type:'object',properties:{service:{type:'string',enum:supported.service},cleanType:{type:'string',enum:supported.cleanType},cleanPostcode:{type:'string',maxLength:12},pickup:{type:'string',maxLength:12},dropoff:{type:'string',maxLength:12},items:{type:'string',maxLength:1500},date:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},name:{type:'string',maxLength:100},phone:{type:'string',maxLength:30},email:{type:'string',maxLength:150},notes:{type:'string',maxLength:2000}},required:['service'],additionalProperties:false},
   annotations:{readOnlyHint:false,untrustedContentHint:true},
   execute(input){
    const limits={service:10,cleanType:20,cleanPostcode:12,pickup:12,dropoff:12,items:1500,date:10,name:100,phone:30,email:150,notes:2000};
    if(!input||typeof input!=='object'||Array.isArray(input)||!supported.service.includes(input.service))throw new Error('Choose cleaning, removals, or both.');
    for(const [key,value]of Object.entries(input)){
     if(!(key in limits)||typeof value!=='string'||value.length>limits[key])throw new Error('Invalid enquiry field: '+key);
     if(supported[key]&&!supported[key].includes(value))throw new Error('Invalid selection: '+key);
     if(key==='date'&&value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<today))throw new Error('Use today or a future date in YYYY-MM-DD format.');
    }
    review.hidden=true;quoteForm.hidden=false;error.hidden=true;
    quoteForm.querySelector('input[name="service"][value="'+input.service+'"]').checked=true;toggleFields();
    for(const [key,value]of Object.entries(input)){if(key!=='service')quoteForm.elements[key].value=value;}
    quoteForm.querySelector('input[name="service"]:checked').focus();
    return{status:'draft_staged',service:input.service,sent:false,bookingConfirmed:false};
   }
  },{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 }

}
