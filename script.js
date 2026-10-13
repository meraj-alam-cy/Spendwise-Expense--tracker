(() => {
  "use strict";
  const EXPENSES_KEY = "spendwise-expenses-v1";
  const BUDGET_KEY = "spendwise-budget-v1";
  const DEFAULT_BUDGET = 15000;
  const categories = {Food:"🍜",Travel:"🚌",Shopping:"🛍️",Bills:"🧾",Health:"💊",Education:"📚",Other:"📌"};
  const $ = (s) => document.querySelector(s);
  const expenseDialog = $("#expense-dialog"), budgetDialog = $("#budget-dialog");
  const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);
  const today = () => { const d = new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function loadExpenses(){try{const a=JSON.parse(localStorage.getItem(EXPENSES_KEY)||"[]");return Array.isArray(a)?a.filter(x=>x&&typeof x.id==="string"&&typeof x.title==="string"&&Number(x.amount)>0&&Number.isFinite(Number(x.amount))&&categories[x.category]&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)):[]}catch{return[]}}
  let expenses=loadExpenses(), budget=Number(localStorage.getItem(BUDGET_KEY));
  if(!Number.isFinite(budget)||budget<1)budget=DEFAULT_BUDGET;
  let toastTimer;
  function save(){try{localStorage.setItem(EXPENSES_KEY,JSON.stringify(expenses));localStorage.setItem(BUDGET_KEY,String(budget))}catch{toast("Could not save. Check browser storage settings.")}}
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2500)}
  const thisMonth=()=>today().slice(0,7);
  const monthly=()=>expenses.filter(e=>e.date.slice(0,7)===thisMonth());
  const total=a=>a.reduce((s,e)=>s+Number(e.amount),0);
  const dateLabel=d=>new Date(d+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  function renderSummary(){
    const spent=total(monthly()), remaining=budget-spent, pct=Math.round(spent/budget*100);
    $("#total-spent").textContent=money(spent);$("#budget-value").textContent=money(budget);$("#remaining-value").textContent=money(remaining);
    $("#remaining-value").style.color=remaining<0?"#fca5a5":"#55d6a0";
    $("#remaining-caption").textContent=remaining<0?money(-remaining)+" over budget":remaining===0?"Budget fully used":"Still available to spend";
    $("#budget-used").textContent=money(spent);$("#budget-percent").textContent=pct+"%";
    $("#budget-progress").style.width=Math.min(pct,100)+"%";
    $("#budget-progress").style.background=pct>100?"#fb7185":pct>=80?"#fbbf24":"linear-gradient(90deg,#818cf8,#a5b4fc)";
    $("#budget-tip").textContent=pct>100?"⚠️ You've exceeded your monthly budget. Review recent expenses.":pct>=80?"👀 You've used most of your budget. Keep an eye on spending.":spent===0?"✨ Add your first expense to see your budget insights.":"✨ You have "+money(remaining)+" left in your budget this month.";
  }
  function renderCategories(){
    const sums={};monthly().forEach(e=>sums[e.category]=(sums[e.category]||0)+Number(e.amount));
    const entries=Object.entries(sums).sort((a,b)=>b[1]-a[1]), el=$("#category-list");
    if(!entries.length){el.innerHTML='<p class="empty-inline">Your category breakdown will appear here.</p>';return}
    const max=entries[0][1]||1, all=total(monthly());
    el.innerHTML=entries.map(([c,n])=>`<div class="category-entry"><span class="category-name">${categories[c]} ${escapeHTML(c)}</span><div class="category-track" role="img" aria-label="${escapeHTML(c)}: ${Math.round(n/all*100)} percent"><div class="category-fill" style="width:${Math.max(2,n/max*100)}%"></div></div><span class="category-amount">${money(n)}</span></div>`).join("");
  }
  function renderTransactions(){
    const filter=$("#category-filter").value;
    const list=expenses.filter(e=>filter==="all"||e.category===filter).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
    $("#transaction-list").innerHTML=list.map(e=>`<tr><td><span class="expense-name"><span class="expense-icon">${categories[e.category]}</span>${escapeHTML(e.title)}</span></td><td><span class="category-pill">${escapeHTML(e.category)}</span></td><td>${dateLabel(e.date)}</td><td class="amount-value">${money(Number(e.amount))}</td><td><button class="delete-btn" data-delete="${escapeHTML(e.id)}" aria-label="Delete ${escapeHTML(e.title)}" title="Delete expense">×</button></td></tr>`).join("");
    $("#empty-state").classList.toggle("visible",list.length===0);
    document.querySelector(".table-wrap").style.display=list.length?"block":"none";
    $("#empty-state").querySelector("h3").textContent=list.length?"":"No "+(filter==="all"?"expenses yet":"matching expenses");
    $("#empty-state").querySelector("p").textContent=filter!=="all"&&list.length===0?"Try another category or add a new expense.":"Add an expense to start understanding your spending.";
  }
  function render(){renderSummary();renderCategories();renderTransactions()}
  function openExpense(){ $("#expense-form").reset();$("#expense-date").value=today();$("#form-error").textContent="";expenseDialog.showModal();$("#expense-title").focus() }
  $("#open-expense").addEventListener("click",openExpense);$("#empty-add").addEventListener("click",openExpense);
  $("#close-expense").addEventListener("click",()=>expenseDialog.close());
  $("#edit-budget").addEventListener("click",()=>{$("#budget-input").value=budget;budgetDialog.showModal()});
  $("#close-budget").addEventListener("click",()=>budgetDialog.close());
  $("#category-filter").addEventListener("change",renderTransactions);
  $("#expense-form").addEventListener("submit",ev=>{
    ev.preventDefault();const title=$("#expense-title").value.trim(),amount=Number($("#expense-amount").value),category=$("#expense-category").value,date=$("#expense-date").value;
    if(!title||title.length>70||!Number.isFinite(amount)||amount<=0||amount>1e8||!categories[category]||!date){$("#form-error").textContent="Enter a valid title, amount, category, and date.";return}
    expenses.push({id:globalThis.crypto?.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),title,amount:Math.round(amount*100)/100,category,date});
    save();render();expenseDialog.close();toast("Expense added successfully");
  });
  $("#budget-form").addEventListener("submit",ev=>{ev.preventDefault();const n=Number($("#budget-input").value);if(!Number.isFinite(n)||n<1||n>1e8){$("#budget-input").reportValidity();return}budget=Math.round(n*100)/100;save();render();budgetDialog.close();toast("Monthly budget updated")});
  $("#transaction-list").addEventListener("click",ev=>{const b=ev.target.closest("[data-delete]");if(!b)return;const item=expenses.find(e=>e.id===b.dataset.delete);if(!item||!confirm(`Delete "${item.title}"? This cannot be undone.`))return;expenses=expenses.filter(e=>e.id!==item.id);save();render();toast("Expense deleted")});
  [expenseDialog,budgetDialog].forEach(d=>d.addEventListener("click",ev=>{if(ev.target===d)d.close()}));
  render();
})();