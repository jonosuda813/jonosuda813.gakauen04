'use strict'

 // index.html 用スクリプト（簡潔に）
  document.getElementById('btn').addEventListener('click', () => {
    // collect selections from each .dropdown
    const dropdowns = document.querySelectorAll('.dropdown');
    const data = {};

    dropdowns.forEach((drop, idx) => {
      const key = (drop.getAttribute('data-placeholder') || ('category' + idx)).replace(/[^0-9A-Za-z\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '');
      const checked = Array.from(drop.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.parentElement.textContent.trim());
      data[key] = checked;
    });

    // 身長・体重・目標
    const height = document.getElementById('height').value.trim();
    const weight = document.getElementById('weight').value.trim();
    const goal = document.getElementById('goal').value;

    // まとめてクエリにする（JSON を encodeURIComponent）
    const payload = {
      data: data,
      height: height,
      weight: weight,
      goal: goal
    };

    const q = encodeURIComponent(JSON.stringify(payload));

    // result.html にクエリを付けて遷移
    location.href = `result.html?payload=${q}`;
  });

  const foodData = {
  fish: { name: '焼き魚', kcal:180, protein:22, fat:9, carbs:0, salt:0.6, veg:0 },
  chicken: { name: '鶏の照り焼き', kcal:320, protein:25, fat:18, carbs:10, salt:1.2, veg:0 },
  mabodouhu: { name:'麻婆豆腐', kcal:380, protein:20, fat:28, carbs:8, salt:2.0, veg:20 },
  hannbagu: { name:'ハンバーグ', kcal:420, protein:26, fat:30, carbs:8, salt:1.6, veg:0 },
  touhu: { name:'豆腐（小鉢）', kcal:80, protein:6, fat:4, carbs:4, salt:0.2, veg:0 },
  daikonn: { name:'大根の煮物', kcal:70, protein:1, fat:0.5, carbs:16, salt:0.6, veg:60 },
  goma: { name:'ほうれん草のごま和え', kcal:90, protein:3, fat:6, carbs:6, salt:0.4, veg:70 },
  hijiki: { name:'ひじき煮', kcal:100, protein:4, fat:4, carbs:12, salt:0.8, veg:40 },
  rice: { name:'ごはん(茶碗1杯)', kcal:240, protein:4, fat:0.5, carbs:53, salt:0, veg:0 },
  sekihann: { name:'赤飯（小盛）', kcal:260, protein:5, fat:1.0, carbs:56, salt:0.2, veg:0 },
  juurokukokumai: { name:'十六穀米', kcal:230, protein:5, fat:1.5, carbs:49, salt:0, veg:0 },
  mugigohann: { name:'麦ごはん', kcal:235, protein:4.5, fat:0.8, carbs:50, salt:0, veg:0 },
  miso: { name:'味噌汁(赤)', kcal:50, protein:3, fat:2, carbs:3, salt:1.2, veg:20 },
  clear: { name:'澄まし汁', kcal:20, protein:1, fat:0, carbs:2, salt:0.6, veg:10 },
  tonjiru: { name:'豚汁', kcal:140, protein:6, fat:8, carbs:8, salt:1.8, veg:60 },
  corn: { name:'味噌汁（白）', kcal:45, protein:2, fat:1.5, carbs:4, salt:1.0, veg:15 }
};
 
// ドロップダウン表示の簡易ロジック（ボタンに選択ラベルを表示）
document.querySelectorAll('.dropdown').forEach(dropdown => {
  const btn = dropdown.querySelector('.dropdown-button');
  const panel = dropdown.querySelector('.dropdown-panel');
  const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
  const placeholder = dropdown.getAttribute('data-placeholder') || '選択してください';
 
  function setButtonText(text) {
    btn.textContent = text + ' ▾';
  }
  setButtonText(placeholder);
 
  function updateButtonText() {
    const checked = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.parentElement.textContent.trim());
    setButtonText(checked.length ? checked.join(', ') : placeholder);
  }
 
  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  checkboxes.forEach(cb => cb.addEventListener('change', updateButtonText));
  document.addEventListener('click', e => { if (!dropdown.contains(e.target)) panel.classList.remove('open'); });
});
 
// ヘルパー：選択のみをカテゴリごとに収集
function collectSelectionsRaw() {
  const dropdowns = document.querySelectorAll('.dropdown');
  return Array.from(dropdowns).map(drop => {
    const title = drop.getAttribute('data-placeholder') || '';
    const items = Array.from(drop.querySelectorAll('input[type="checkbox"]:checked')).map(cb => ({
      value: cb.value,
      label: cb.parentElement.textContent.trim()
    }));
    return { title, items };
  });
}
 
// 「選択項目を表示」ボタン（栄養データは含めない）
document.getElementById('showSelected').addEventListener('click', () => {
  const resultBox = document.querySelector('.a');
  const details = collectSelectionsRaw();
  const any = details.some(d => d.items.length > 0);
  if (!any) {
    resultBox.innerHTML = '<p style="padding:1rem;">選択された項目はありません。</p>';
    return;
  }
  let html = '<div style="padding:1rem;"><h3>選択内容</h3>';
  details.forEach(d => {
    html += `<h4 style="margin:0.3rem 0;">${d.title}</h4>`;
    if (d.items.length) {
      html += '<ul>';
      d.items.forEach(it => html += `<li>${it.label}</li>`);
      html += '</ul>';
    } else {
      html += '<p style="color:#666;">（未選択）</p>';
    }
  });
  html += '</div>';
  resultBox.innerHTML = html;
  resultBox.scrollIntoView({ behavior: 'smooth' });
});
 
// 「測定」ボタン（個別栄養と合計を表示）
document.getElementById('measureBtn').addEventListener('click', () => {
  const resultBox = document.querySelector('.a');
  const details = collectSelectionsRaw();
  const any = details.some(d => d.items.length > 0);
  if (!any) {
    resultBox.innerHTML = '<p style="padding:1rem;">選択された項目はありません（測定不可）。</p>';
    return;
  }
 
  const warnings = [];
  const picked = [];
  details.forEach(cat => {
    cat.items.forEach(it => {
      const fd = foodData[it.value];
      if (!fd) warnings.push(`未登録: ${it.label} (value="${it.value}")`);
      else picked.push({ category: cat.title, label: fd.name, nutrition: fd });
    });
  });
 
  if (!picked.length) {
    resultBox.innerHTML = '<p style="padding:1rem;color:#c33;">測定できる項目がありません（すべて未登録）。</p>';
    return;
  }
 
  const totals = picked.reduce((acc, p) => {
    const n = p.nutrition;
    acc.kcal += n.kcal || 0;
    acc.protein += n.protein || 0;
    acc.fat += n.fat || 0;
    acc.carbs += n.carbs || 0;
    acc.salt += n.salt || 0;
    acc.veg += n.veg || 0;
    return acc;
  }, { kcal:0, protein:0, fat:0, carbs:0, salt:0, veg:0 });
 
  // 表示整形
  totals.kcal = Math.round(totals.kcal);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.salt = Math.round(totals.salt * 10) / 10;
  totals.veg = Math.round(totals.veg);
 
  let html = '<div style="padding:1rem;">';
  html += '<h3>個別栄養（項目ごと）</h3>';
  html += '<table><thead><tr><th>カテゴリ</th><th>項目</th><th>kcal</th><th>たんぱく質(g)</th><th>脂質(g)</th><th>炭水化物(g)</th><th>塩分(g)</th><th>野菜(g)</th></tr></thead><tbody>';
  picked.forEach(p => {
    const n = p.nutrition;
    html += `<tr><td>${p.category}</td><td>${p.label}</td><td>${n.kcal}</td><td>${n.protein}</td><td>${n.fat}</td><td>${n.carbs}</td><td>${n.salt}</td><td>${n.veg}</td></tr>`;
  });
  html += '</tbody></table>';
 
  html += '<h3>合計</h3>';
  html += '<table><tbody>';
  html += `<tr class="totals"><td>合計エネルギー</td><td>${totals.kcal} kcal</td></tr>`;
  html += `<tr class="totals"><td>合計たんぱく質</td><td>${totals.protein} g</td></tr>`;
  html += `<tr class="totals"><td>合計脂質</td><td>${totals.fat} g</td></tr>`;
  html += `<tr class="totals"><td>合計炭水化物</td><td>${totals.carbs} g</td></tr>`;
  html += `<tr class="totals"><td>合計塩分</td><td>${totals.salt} g</td></tr>`;
  html += `<tr class="totals"><td>合計野菜相当量</td><td>${totals.veg} g</td></tr>`;
  html += '</tbody></table>';
 
  if (warnings.length) {
    html += '<h4 style="color:#c33">警告（未登録）</h4><ul>';
    warnings.forEach(w => html += `<li>${w}</li>`);
    html += '</ul>';
  }
 
  html += '</div>';
  resultBox.innerHTML = html;
  resultBox.scrollIntoView({ behavior: 'smooth' });
});

// リセット処理（既存スクリプトの下に追加）
document.getElementById('resetBtn').addEventListener('click', () => {
  // すべてのドロップダウンについてチェックを外し、ボタン表示をプレースホルダに戻す
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    // チェックボックスをすべてオフ
    dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    // パネルを閉じる
    const panel = dropdown.querySelector('.dropdown-panel');
    if (panel) panel.classList.remove('open');
    // ボタン表示をプレースホルダに戻す（既存のボタン表示ロジックに合わせる）
    const btn = dropdown.querySelector('.dropdown-button');
    const placeholder = dropdown.getAttribute('data-placeholder') || '選択してください';
    if (btn) btn.textContent = placeholder + ' ▾';
  });
  // 結果表示エリアをクリア（任意の初期メッセージに差し替え可能）
  const resultBox = document.querySelector('.a');
  if (resultBox) {
    resultBox.innerHTML = '<p style="padding:1rem;color:#666;">選択はリセットされました。</p>';
    resultBox.scrollIntoView({ behavior: 'smooth' });
  }
});