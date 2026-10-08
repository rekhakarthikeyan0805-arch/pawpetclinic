/* PawCare demo app
   Replace the storage functions with fetch('/api/...') calls when connecting
   a real Node/Express + MongoDB backend.
*/
const SERVICES = [
  {id:"checkup",name:"General Checkup",icon:"🩺",desc:"Routine wellness exams, health checks and early issue detection.",price:500},
  {id:"vaccination",name:"Vaccination",icon:"💉",desc:"Core and lifestyle vaccination plans tailored to your pet.",price:700},
  {id:"grooming",name:"Grooming",icon:"🛁",desc:"Gentle bathing, coat care, nail trimming and hygiene support.",price:800},
  {id:"dental",name:"Dental Care",icon:"🦷",desc:"Oral examinations and professional dental health support.",price:1000},
  {id:"surgery",name:"Surgery",icon:"🏥",desc:"Planned procedures with careful monitoring and aftercare.",price:5000},
  {id:"emergency",name:"Emergency Care",icon:"🚑",desc:"Urgent veterinary assessment and immediate supportive care.",price:1500}
];
const DEFAULT_DOCTORS = [
  {id:"d1",name:"Dr. Priya Menon",spec:"Small Animal Medicine",exp:"10 years",days:"Mon, Wed, Fri",emoji:"👩🏻‍⚕️"},
  {id:"d2",name:"Dr. Arjun Rao",spec:"Surgery & Emergency",exp:"12 years",days:"Tue, Thu, Sat",emoji:"👨🏽‍⚕️"},
  {id:"d3",name:"Dr. Meera Shah",spec:"Dermatology & Wellness",exp:"8 years",days:"Mon, Tue, Thu",emoji:"👩🏽‍⚕️"}
];
const SLOTS=["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM"];
const key="pawcare_appointments";
const doctorsKey="pawcare_doctors";
let doctors=JSON.parse(localStorage.getItem(doctorsKey)||"null")||DEFAULT_DOCTORS;
let appointments=JSON.parse(localStorage.getItem(key)||"[]");

const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem(key,JSON.stringify(appointments));localStorage.setItem(doctorsKey,JSON.stringify(doctors));};
const toast=(msg)=>{const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)};
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function renderServices(){
  $("servicesGrid").innerHTML=SERVICES.map(s=>`<article class="service-card"><div class="service-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p><span class="price">Starting at ₹${s.price.toLocaleString("en-IN")}</span></article>`).join("");
  $("service").innerHTML='<option value="">Select service</option>'+SERVICES.map(s=>`<option value="${s.id}">${s.name} — ₹${s.price}</option>`).join("");
}
function renderDoctors(){
  $("doctorsGrid").innerHTML=doctors.map(d=>`<article class="doctor-card"><div class="doctor-photo">${d.emoji||"👩🏻‍⚕️"}</div><div class="doctor-info"><h3>${esc(d.name)}</h3><p><b>${esc(d.spec)}</b></p><p>Experience: ${esc(d.exp)}</p><p>Available: ${esc(d.days)}</p></div></article>`).join("");
  $("doctor").innerHTML='<option value="">Select doctor</option>'+doctors.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join("");
  $("filterDoctor").innerHTML='<option value="">All doctors</option>'+doctors.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join("");
}
function normalizePhone(v){return String(v).replace(/\D/g,"").slice(-10)}
function dateDays(date){return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(date+"T00:00:00").getDay()]}
function updateSlots(){
  const d=$("doctor").value,date=$("date").value,sel=$("time");
  if(!d||!date){sel.disabled=true;sel.innerHTML='<option value="">Choose doctor and date first</option>';return}
  const doctor=doctors.find(x=>x.id===d);
  const day=dateDays(date);
  const works=doctor.days.split(", ").includes(day);
  if(!works){sel.disabled=true;sel.innerHTML=`<option value="">${doctor.name} is not available on ${day}</option>`;return}
  const taken=appointments.filter(a=>a.doctorId===d&&a.date===date&&a.status!=="Cancelled"&&a.status!=="Rejected").map(a=>a.time);
  const available=SLOTS.filter(x=>!taken.includes(x));
  sel.disabled=!available.length;
  sel.innerHTML=available.length?'<option value="">Select time</option>'+available.map(x=>`<option>${x}</option>`).join(""):'<option>No slots available</option>';
}
function renderConfirmation(a){
  $("confirmation").classList.remove("hidden");
  $("confirmation").innerHTML=`<h3>🎉 Appointment request received!</h3><p>Your booking ID is <b>${esc(a.id)}</b>. A production version would send email/SMS confirmation here.</p><div class="summary"><b>${esc(a.petName)}</b> with ${esc(a.doctorName)}<br>${esc(a.serviceName)} • ${esc(a.date)} • ${esc(a.time)}<br>Owner: ${esc(a.ownerName)} • ${esc(a.phone)}<br>Status: <b>${esc(a.status)}</b></div>`;
  $("confirmation").scrollIntoView({behavior:"smooth",block:"center"});
}
function validPhone(p){return /^\d{10}$/.test(normalizePhone(p))}
function submitBooking(e){
  e.preventDefault();
  const phone=normalizePhone($("phone").value);
  if(!validPhone(phone)){toast("Enter a valid 10-digit phone number.");$("phone").focus();return}
  if(new Date($("date").value+"T00:00:00")<new Date(new Date().toDateString())){toast("Please choose today or a future date.");return}
  const d=doctors.find(x=>x.id===$("doctor").value),s=SERVICES.find(x=>x.id===$("service").value);
  const conflict=appointments.some(a=>a.doctorId===d.id&&a.date===$("date").value&&a.time===$("time").value&&a.status!=="Cancelled"&&a.status!=="Rejected");
  if(conflict){toast("That slot was just booked. Please choose another.");updateSlots();return}
  const a={id:"PC-"+Date.now().toString().slice(-7),ownerName:$("ownerName").value.trim(),phone,email:$("email").value.trim(),petName:$("petName").value.trim(),petType:$("petType").value,breed:$("breed").value.trim(),age:$("age").value,serviceId:s.id,serviceName:s.name,doctorId:d.id,doctorName:d.name,date:$("date").value,time:$("time").value,notes:$("notes").value.trim(),status:"Pending",createdAt:new Date().toISOString()};
  appointments.push(a);save();renderConfirmation(a);e.target.reset();$("time").disabled=true;$("time").innerHTML='<option value="">Choose doctor and date first</option>';toast("Appointment booked successfully!");
}
function lookup(){
  const p=normalizePhone($("lookupPhone").value);
  if(!validPhone(p)){toast("Enter the same 10-digit phone used for booking.");return}
  const rows=appointments.filter(a=>a.phone===p);
  $("appointmentsResult").innerHTML=rows.length?rows.sort((a,b)=>b.date.localeCompare(a.date)).map(a=>`<div class="appointment-item"><div><b>${esc(a.petName)}</b> — ${esc(a.serviceName)}<br>👨‍⚕️ ${esc(a.doctorName)}<br>📅 ${esc(a.date)} at ${esc(a.time)}<br><span class="status ${esc(a.status)}">${esc(a.status)}</span></div><div class="item-actions">${a.status!=="Cancelled"&&a.status!=="Completed"?`<button class="small-btn" onclick="reschedule('${a.id}')">Reschedule</button><button class="small-btn" onclick="cancelBooking('${a.id}')">Cancel</button>`:""}</div></div>`).join(""):'<p>No appointments found for this phone number.</p>';
}
window.cancelBooking=id=>{if(confirm("Cancel this appointment?")){const a=appointments.find(x=>x.id===id);if(a){a.status="Cancelled";save();lookup();toast("Appointment cancelled.");}}};
window.reschedule=id=>{const a=appointments.find(x=>x.id===id);if(!a)return;const date=prompt("Enter new date (YYYY-MM-DD):",a.date);if(!date)return;const time=prompt("Enter new time exactly, e.g. 03:00 PM:",a.time);if(!time)return;const conflict=appointments.some(x=>x.id!==id&&x.doctorId===a.doctorId&&x.date===date&&x.time===time&&x.status!=="Cancelled"&&x.status!=="Rejected");if(conflict){toast("That doctor/time is already booked.");return}a.date=date;a.time=time;a.status="Pending";save();lookup();toast("Appointment rescheduled.");};

function adminTable(){
  let rows=[...appointments];
  const fd=$("filterDoctor").value,fs=$("filterStatus").value,fx=$("filterDate").value;
  if(fd)rows=rows.filter(a=>a.doctorId===fd);if(fs)rows=rows.filter(a=>a.status===fs);if(fx)rows=rows.filter(a=>a.date===fx);
  $("adminTable").innerHTML=rows.length?rows.map(a=>`<tr><td><b>${esc(a.petName)}</b><br>${esc(a.ownerName)}<br>${esc(a.phone)}</td><td>${esc(a.doctorName)}</td><td>${esc(a.date)}</td><td>${esc(a.time)}</td><td>${esc(a.serviceName)}</td><td><span class="status ${esc(a.status)}">${esc(a.status)}</span></td><td><button class="small-btn" onclick="setStatus('${a.id}','Approved')">Approve</button> <button class="small-btn" onclick="setStatus('${a.id}','Rejected')">Reject</button> <button class="small-btn" onclick="setStatus('${a.id}','Completed')">Complete</button></td></tr>`).join(""):'<tr><td colspan="7">No appointments found.</td></tr>';
}
window.setStatus=(id,status)=>{const a=appointments.find(x=>x.id===id);if(a){a.status=status;save();adminTable();toast("Status updated.");}};
function adminLogin(){
  if($("adminUser").value==="admin"&&$("adminPass").value==="admin123"){$("adminLogin").classList.add("hidden");$("adminPanel").classList.remove("hidden");adminTable();sessionStorage.setItem("pawcare_admin","1");toast("Welcome, admin.");}else toast("Invalid demo login.");
}
function init(){
  renderServices();renderDoctors();
  const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());$("date").min=today.toISOString().slice(0,10);
  $("navToggle").onclick=()=>$("mainNav").classList.toggle("open");
  document.querySelectorAll("#mainNav a").forEach(a=>a.onclick=()=>$("mainNav").classList.remove("open"));
  $("themeToggle").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("pawcare_dark",document.body.classList.contains("dark"));};
  if(localStorage.getItem("pawcare_dark")==="true")document.body.classList.add("dark");
  $("doctor").onchange=updateSlots;$("date").onchange=updateSlots;$("appointmentForm").onsubmit=submitBooking;$("lookupBtn").onclick=lookup;
  $("adminLoginBtn").onclick=adminLogin;$("logoutAdmin").onclick=()=>{sessionStorage.removeItem("pawcare_admin");$("adminPanel").classList.add("hidden");$("adminLogin").classList.remove("hidden")};
  ["filterDoctor","filterStatus","filterDate"].forEach(id=>$(id).onchange=adminTable);
  if(sessionStorage.getItem("pawcare_admin")==="1"){$("adminLogin").classList.add("hidden");$("adminPanel").classList.remove("hidden");adminTable();}
  $("addDoctorBtn").onclick=()=>{const name=prompt("Doctor name:");if(!name)return;const spec=prompt("Specialization:")||"Veterinary Medicine";const exp=prompt("Experience:")||"5 years";const days=prompt("Available days (e.g. Mon, Wed, Fri):")||"Mon, Wed, Fri";doctors.push({id:"d"+Date.now(),name,spec,exp,days,emoji:"👩🏻‍⚕️"});save();renderDoctors();adminTable();toast("Doctor added.");};
  $("addServiceBtn").onclick=()=>toast("Edit SERVICES in js/app.js to add or change services.");
}
document.addEventListener("DOMContentLoaded",init);
