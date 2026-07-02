"use strict";
/*
  説明（概要）:
  - eatnum1..6: 実績（例: 前ページから受け取った数値を代入する）
  - eatgoal1..6: 目標（例: ユーザーが設定した目標）
  - createFoodChart() を実行するとチャートを描画し、合致率を計算して画面に表示します。
  - このファイルは index.html から読み込まれます。Chart.js は index.html 内で先に読み込まれている必要があります。
*/
/* -----------------
   ここを実際の数値で変更してください（例として現在の数値）
   実際のアプリでは前ページから取得してここに代入するか、
   localStorage/APIで読み込んで `createFoodChart()` に渡してください。
   ----------------- */
const eatnum1 = 1000;
const eatnum2 = 60;
const eatnum3 = 40;
const eatnum4 = 20;
const eatnum5 = 5;
const eatnum6 = 19;
const eatgoal1 = 2000;
const eatgoal2 = 65;
const eatgoal3 = 25;
const eatgoal4 = 60;
const eatgoal5 = 7.5;
const eatgoal6 = 19;
/* -----------------
   ラベル・単位の定義（必要なら編集）
   labels と units の順序は実績/目標配列と一致させてください
   ----------------- */
const labels = ['エネルギー','タンパク質','脂質','炭水化物','塩分','野菜量'];
const units  = ['kcal','g','g','g','g','皿'];
/* -----------------
   DEFAULTS: 規定値（目標・実績のフォールバック）
   - defaultTargets: 目標が未指定のときに使う値
   - defaultActuals: 実績が未指定のときに使う値
   ----------------- */
const DEFAULTS = {
  defaultTargets: [eatgoal1, eatgoal2, eatgoal3, eatgoal4, eatgoal5, eatgoal6],
  defaultActuals: [eatnum1, eatnum2, eatnum3, eatnum4, eatnum5, eatnum6]
};
// Chart.js 全体フォント（任意）
Chart.defaults.font.family = "japanese, 'Noto Sans JP', sans-serif";
/* -----------------
   ユーティリティ関数
   ----------------- */
// 安全に配列を取得する（不足分は DEFAULTS で埋める）
function resolveArray(inputArray, fallbackArray) {
  const result = [];
  for (let i = 0; i < fallbackArray.length; i++) {
    const v = inputArray?.[i];
    result.push((v === undefined || v === null) ? fallbackArray[i] : v);
  }
  return result;
}
// 各項目の達成率 (%) を計算する（小数1桁で丸める）
// actuals / targets * 100
function toPercentArray(actuals, targets) {
  return actuals.map((v, i) => {
    const t = targets[i];
    if (!t) return 0; // 目標が0または不正な場合は0%
    const raw = (v / t) * 100;
    // 小数1桁で丸めて返す
    return Math.round(raw * 10) / 10;
  });
}
// 合致率を計算する（あなたの指定方式）
// 手順:
// 1) 各項目の%を計算
// 2) 平均% を求める (sum / N)
// 3) abs(avg - 100) を取る
// 4) matchRate = 100 - absDiff （0〜100にクリップ）
function computeMatchRate(actuals, targets) {
  const perItem = toPercentArray(actuals, targets);
  const sum = perItem.reduce((a, b) => a + b, 0);
  const avg = sum / perItem.length; // 平均 %
  const absDiff = Math.abs(avg - 100);
  let matchRate = 100 - absDiff;
  if (matchRate < 0) matchRate = 0;
  if (matchRate > 100) matchRate = 100;
  return {
    perItemPercent: perItem,
    sumPercent: sum,
    avgPercent: avg,
    matchRate: Math.round(matchRate * 10) / 10 // 小数1桁
  };
}
/* -----------------
   メイン: チャートを作る関数
   options:
     - targets: 配列で目標を渡せる（省略可）
     - actuals: 配列で実績を渡せる（省略可）
     - canvasId: 描画先 canvas の id（デフォルト 'foodChart'）
   ----------------- */
function createFoodChart(options = {}) {
  const canvasId = options.canvasId ?? 'foodChart';
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error('Canvas not found:', canvasId);
    return null;
  }
  const ctx = canvas.getContext('2d');
  // 1) 目標と実績を決める（外部から渡されたものを優先、無ければ DEFAULTS）
  const targetsInput = options.targets ?? null;
  const actualsInput = options.actuals ?? null;
  const targets = resolveArray(targetsInput, DEFAULTS.defaultTargets);
  const actuals = resolveArray(actualsInput, DEFAULTS.defaultActuals);
  // 2) 合致率を計算して画面に反映（数値を出す）
  const stats = computeMatchRate(actuals, targets);
  const infoEl = document.getElementById('info');
  if (infoEl) {
    infoEl.textContent = `合致率: ${stats.matchRate}%（平均達成率 ${Math.round(stats.avgPercent * 10) / 10}%）`;
  }const tableBody = document.querySelector('#resultTable tbody');
  if (tableBody) {
    tableBody.innerHTML = ''; // 既存の行をクリア
    // 各項目の達成率を表示
    stats.perItemPercent.forEach((p, i) => {
      const tr = document.createElement('tr');
      const nameTd = document.createElement('td');
      const valTd  = document.createElement('td');
      nameTd.style.padding = '6px';
      valTd.style.padding = '6px';
      nameTd.textContent = labels[i];
      valTd.textContent  = `${p}% (${actuals[i]}${units[i] ? ' ' + units[i] : ''} / ${targets[i]}${units[i] ? ' ' + units[i] : ''})`;
      tr.appendChild(nameTd);
      tr.appendChild(valTd);
      tableBody.appendChild(tr);
    });
    // 合計行（合致率と平均）
    const trSum = document.createElement('tr');
    trSum.innerHTML = `<td style="padding:6px;">合致率</td><td style="padding:6px;">${stats.matchRate}%</td>`;
    tableBody.appendChild(trSum);
    const trAvg = document.createElement('tr');
    trAvg.innerHTML = `<td style="padding:6px;">平均達成率</td><td style="padding:6px;">${Math.round(stats.avgPercent*10)/10}%</td>`;
    tableBody.appendChild(trAvg);
  }
  // 3) レーダーチャート用データ: 「%」で表現する（各項目の達成率）
  const dataTargetsPercent = toPercentArray(targets, targets); // 目標/目標 = 100%（ただし丸め）
  const dataActualPercent  = toPercentArray(actuals, targets);
  // 4) 既存チャートがあれば破棄（再描画に備える）
  if (ctx.chart) {
    ctx.chart.destroy();
  }
  // 5) Chart.js でレーダーチャートを描画
  //    ツールチップで元の値（単位つき）を表示するように設定
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '目標（%）',
          data: dataTargetsPercent,
          borderColor: 'rgba(255,0,0,1)',
          backgroundColor: 'rgba(255,0,0,0.15)',
          borderWidth: 2,
          // 元データを保持しておく（ツールチップで表示するため）
          _original: targets
        },
        {
          label: '実績（%）',
          data: dataActualPercent,
          borderColor: 'rgba(0,0,255,1)',
          backgroundColor: 'rgba(0,0,255,0.15)',
          borderWidth: 2,
          _original: actuals
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 120, // 表示の余裕として 120 にしています（必要なら 100 に）
          ticks: {
            // 目盛りのラベル表示を消したい場合は display: false に変更してください
            // display: false
            stepSize: 20,
            callback: function(value) {
              return value + '%'; // 目盛りに % を付ける
            }
          },
          pointLabels: {
            // 項目ラベル (エネルギー等) のスタイル
            font: { size: 12 }
          }
        }
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            // ツールチップに "実績（%）: 90% (1700 kcal)" の形式で表示する例
            label: function(context) {
              const ds = context.dataset;
              const idx = context.dataIndex;
              const percentText = context.formattedValue; // 表示されている %（文字列）
              const origArr = ds._original || [];
              const origVal = origArr[idx];
              const unit = units[idx] ? ` ${units[idx]}` : '';
              return `${ds.label}: ${percentText}% (${origVal !== undefined ? origVal + unit : 'N/A'})`;
            }
          }
        }
      }
    }
  });
  // canvas に chart を参照として保存（後で破棄するため）
  ctx.chart = chart;
  // 返り値として便利な情報を返す
  return {
    chart,
    targets,
    actuals,
    stats // perItemPercent / sumPercent / avgPercent / matchRate
  };
}
/* -----------------
   実行例
   - ここを編集せずとも index.html を開くと下の createFoodChart() が実行され、
     canvas にチャートが描画され、合致率を #info に表示します。
   - 目標・実績を外部から渡したければ createFoodChart({ targets: [...], actuals: [...] })
   ----------------- */
// DOM が読み込まれてから実行する（念のため）
document.addEventListener('DOMContentLoaded', function() {
  // そのままデフォルト値（上で定義した eatnum / eatgoal）で表示
const created = createFoodChart();
 
if (created && created.stats) {
  const comment = generateComment(created.stats, created.targets, created.actuals, labels, units);
  const el = document.getElementById('aiComment');
  if (el) el.textContent = comment;
}
// 再生成ボタンの処理
const btn = document.getElementById('regenerateComment');
if (btn) {
  btn.addEventListener('click', function() {
    if (created && created.stats) {
      const comment2 = generateComment(created.stats, created.targets, created.actuals, labels, units);
      const el2 = document.getElementById('aiComment');
      if (el2) el2.textContent = comment2;
    }
  });
}
// -------------------------
// コメント生成ロジック（ルールベース）
// -------------------------
function generateComment(stats, targets, actuals, labels, units) {
  // stats: { perItemPercent: [...], avgPercent, matchRate }
  // simple templates
  const introPos = [
    "良い調子です！全体のバランスが良く、継続が期待できます。",
    "まずまずの結果です。いくつか改善ポイントがあります。"
  ];
  const introNeg = [
    "改善の余地があります。特に不足している項目に注意しましょう。",
    "全体的に目標に届いていない部分があります。対策を検討しましょう。"
  ];
  // 基本判定
  const match = stats.matchRate;
  let comment = "";
  if (match >= 90) {
    comment += introPos[0] + "\n\n";
  } else if (match >= 70) {
    comment += introPos[1] + "\n\n";
  } else {
    comment += introNeg[0] + "\n\n";
  }
  // 各項目ごとのコメント（過不足を判定）
  const per = stats.perItemPercent;
  const lines = [];
  for (let i = 0; i < labels.length; i++) {
    const p = per[i]; // 達成率%
    const label = labels[i];
    const val = actuals[i];
    const tgt = targets[i];
    const unit = units[i] ? ` ${units[i]}` : "";
    if (p >= 110) {
      // 110%以上は過剰
      lines.push(`${label}：目標を大きく上回っています（${Math.round(p*10)/10}%）。過剰摂取に注意しましょう。現在 ${val}${unit}（目標 ${tgt}${unit}）。`);
    } else if (p >= 95 && p <= 110) {
      // 良好
      lines.push(`${label}：目標にほぼ到達しています（${Math.round(p*10)/10}%）。維持を心がけましょう。`);
    } else if (p >= 80 && p < 95) {
      // わずかに不足
      lines.push(`${label}：やや不足（${Math.round(p*10)/10}%）。あと少しで目標です。${label}を少し増やす工夫を。`);
    } else {
      // 大きく不足
      lines.push(`${label}：不足しています（${Math.round(p*10)/10}%）。目標 ${tgt}${unit} に対して現在 ${val}${unit} です。改善プランを検討してください。`);
    }
  }
  // 重要度の高い改善ポイントを上位3件抽出（不足か過剰の絶対偏差でソート）
  const diffs = per.map((pv, i) => ({ idx:i, diff: Math.abs(pv - 100), p: pv }));
  diffs.sort((a,b) => b.diff - a.diff);
  const top = diffs.slice(0, 3).map(d => {
    const i = d.idx;
    const p = Math.round(per[i]*10)/10;
    if (per[i] < 100) {
      return `改善優先：${labels[i]}（達成率 ${p}%）。目標に届くよう${labels[i]}を増やす工夫を。`;
    } else {
      return `改善優先：${labels[i]}（達成率 ${p}%）。過剰のため量を調整してください。`;
    }
  });
  // 最終まとめ文
  const summary = `合致率は ${stats.matchRate}%、平均達成率は ${Math.round(stats.avgPercent*10)/10}% です。`;
  const advice = ["総合アドバイス：バランス重視で、上の優先項目から改善してください。", "ワンポイント：タンパク質は筋肉の維持に重要、野菜量は食物繊維摂取に直結します。"];
  // 組み立て
  comment += lines.join("\n") + "\n\n";
  comment += "優先して着手すべき項目：\n" + top.join("\n") + "\n\n";
  comment += summary + "\n" + advice[Math.floor(Math.random()*advice.length)];
  return comment;
}
// -------------------------
// createFoodChart 実行後にコメント生成・表示を行う（script.js の該当箇所に追加）
// -------------------------
// createFoodChart() を呼んだ後に返り値 (created) がある想定
// 例：const created = createFoodChart();
//      const stats = created.stats;
//      const comment = generateComment(stats, created.targets, created.actuals, labels, units);
//      document.getElementById('aiComment').textContent = comment;
// 実際の組み込み例：DOMContentLoaded 内の createFoodChart 呼び出し部分に以下を追加してください
/*
document.addEventListener('DOMContentLoaded', function() {
  const created = createFoodChart();
  if (created && created.stats) {
    const comment = generateComment(created.stats, created.targets, created.actuals, labels, units);
    const el = document.getElementById('aiComment');
    if (el) el.textContent = comment;
  }
  // 再生成ボタン
  const btn = document.getElementById('regenerateComment');
  if (btn) {
    btn.addEventListener('click', function() {
      if (created && created.stats) {
        const comment2 = generateComment(created.stats, created.targets, created.actuals, labels, units);
        document.getElementById('aiComment').textContent = comment2;
      }
    });
  }
});
*/
});
 
// ----- デバッグ用の簡易チェック -----
// これを既存の script.js の末尾（DOMContentLoaded の内側が安全）に貼って実行してください。
// document.addEventListener('DOMContentLoaded', function() {
//   // 1) コメント領域が存在するか確認
//   const aiEl = document.getElementById('aiComment');
//   if (!aiEl) {
//     console.error('[デバッグ] aiComment 要素が見つかりません。index.html に <div id="aiComment"></div> を追加してください。');
//   } else {
//     aiEl.textContent = 'コメント領域は見つかりました（テスト表示）。';
//     console.log('[デバッグ] aiComment 要素は OK');
//   }
//   // 2) チャート関数が存在しているか・戻り値を確認
//   if (typeof createFoodChart !== 'function') {
//     console.error('[デバッグ] createFoodChart 関数が定義されていません。script.js に createFoodChart があるか確認してください。');
//     return;
//   }
 
//   const created = createFoodChart();
//    // 既存の処理でチャートを生成（重複生成でもOK）
//   console.log('[デバッグ] createFoodChart の戻り値:', created);
//   if (!created) {
//     console.error('[デバッグ] createFoodChart が null を返しました。チャート生成に失敗しています。console エラーを確認してください。');
//     return;
//   }
//   // 3) stats があるか確認
//   if (!created.stats) {
//     console.error('[デバッグ] created.stats が見つかりません。createFoodChart が stats を返すようにしてください。');
//     return;
//   }
//   console.log('[デバッグ] stats:', created.stats);
//   // 4) 簡易コメントを表示（これで表示されれば要素と値は問題なし）
//   const simple = `合致率（テスト）: ${created.stats.matchRate}%\n平均: ${Math.round(created.stats.avgPercent*10)/10}%`;
//   if (aiEl) aiEl.textContent = simple;
// });
 
 