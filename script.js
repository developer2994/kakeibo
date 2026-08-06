//HTML要素を取得する
const recordForm = document.querySelector("#recordForm");
const recordDateInput = document.querySelector("#recordDate");
const recordTypeSelect = document.querySelector("#recordType");
const recordCategorySelect = document.querySelector("#recordCategory");
const recordAmountInput = document.querySelector("#recordAmount");
const recordMemoInput = document.querySelector("#recordMemo");

const formTitle = document.querySelector("#formTitle");
const submitButton = document.querySelector("#submitButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const formMessage = document.querySelector("#formMessage");

const incomeTotalElement = document.querySelector("#incomeTotal");
const expenseTotalElement = document.querySelector("#expenseTotal");
const balanceTotalElement = document.querySelector("#balanceTotal");

const monthFilterInput = document.querySelector("#monthFilter");
const typeFilterSelect = document.querySelector("#typeFilter");

const recordTableBody = document.querySelector("#recordTableBody");
const emptyMessage = document.querySelector("#emptyMessage");

//ローカルに保存するデータの箱の名前を定義する
const STORAGE_KEY = "householdBudgetRecords";

//カテゴリーの一覧を作成する
const categoryOption = {
    expense: [
        "食費",
        "日用品",
        "交通費",
        "住居費",
        "水道・光熱費",
        "通信費",
        "趣味",
        "その他"
    ],
    income: [
        "給与",
        "副業",
        "臨時収入",
        "その他"
    ]
};


let records = loadRecords(); //データを入れておく配列（空）
let editingRecordID = null; //現在、編集中のデータはなし

//日付を作成する関数
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth()+ 1).padStart(2, "0"); //月を二桁で表示する
    const date = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
}

//アプリの初期表示関数
function initializeApp() {
    const today = getTodayString();

    recordDateInput.value = today;
    //今日の日付から「年と月」だけを取り出して、月の絞り込み欄に入れる処理
    //7番目以降が切り取られる
    monthFilterInput.value = today.slice(0, 7);

    updateCategoryOptions();
    renderRecords();
    updateSummary(records);
}

initializeApp();

//支出と収入でカテゴリーを切り替える処理
function updateCategoryOptions() {
    const selectedType = recordTypeSelect.value;
    const categories = categoryOption[selectedType];

    //カテゴリーを空にする
    recordCategorySelect.innerHTML = "";

    categories.forEach((category) => {
        const optionElement = document.createElement("option"); //option要素の作成

        optionElement.value = category; //<option value="食費"></option>
        optionElement.textContent = category;

        //recordCategorySelectの下にoptionElementを配置する
        recordCategorySelect.append(optionElement);        
    });
}

//カテゴリーを変更した時に関数を発動する
recordTypeSelect.addEventListener("change", updateCategoryOptions);

recordForm.addEventListener("submit", (event) => {
    event.preventDefault(); //ページの再読み込みをさせない

    const date = recordDateInput.value;
    const type = recordTypeSelect.value;
    const category = recordCategorySelect.value;
    const amount = Number(recordAmountInput.value);
    const memo = recordMemoInput.value.trim();

    //入力チェックをする
    if (!date || !category || amount <= 0 || !memo) { //データが数字の場合はfalseは０を表す
        showFormMessage("入力内容を確認してください。", true);
        return;
    }

    //新しい収支データを配列に登録する
    //
    //この配列はrecordsに複数データを入れるために必要
    const newRecord = {
        id: crypto.randomUUID(),
        date,
        type,
        category,
        amount,
        memo
    };

    records.push(newRecord);

    renderRecords();

    updateSummary(records);

    resetForm();

    saveRecords();
})

//入力に誤りがあった時の処理
function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", isError);
}

//金額を日本円表示にする
function formatCurrency(amount) {
    return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        minimumFractionDigits: 0
        }).format(amount);
    }

//表を一行作成する
function createRecordRow(record) {
    const rowElement = document.createElement("tr");

    const typeText = record.type === "income" ? "収入" : "支出";
    const amountSign = record.type === "income" ? "+" : "-";

    rowElement.innerHTML = `
    <td>${record.date}</td>
    <td>${typeText}</td>
    <td>${record.category}</td>
    <td>${record.memo}</td>
    <td>${amountSign}${formatCurrency(record.amount)}</td>
    `;
    return rowElement;
}

//収支一覧を表示する
function renderRecords() {
    recordTableBody.innerHTML = "";

    records.forEach((record) => {
        const showRowElement = createRecordRow(record);
        recordTableBody.append(showRowElement);
    });
}

//データ登録後の入力欄を初期状態に戻す
function resetForm() {
    recordDateInput.value = getTodayString();
    recordTypeSelect.value = "expense";

    updateCategoryOptions();

    recordAmountInput.value = "";
    recordMemoInput.value = "";
}

//収支・支出・残高を集計する
function updateSummary(targetRecords) {
    const incomeTotal = targetRecords
    .filter((record) => record.type === "income")
    .reduce((total, record) => total + record.amount, 0)

    const expenseTotal = targetRecords
    .filter((record) => record.type === "expense")
    .reduce((total, record) => total + record.amount, 0)

    const balanceTotal = incomeTotal - expenseTotal;

    incomeTotalElement.textContent = formatCurrency(incomeTotal);
    expenseTotalElement.textContent = formatCurrency(expenseTotal);
    balanceTotalElement.textContent = formatCurrency(balanceTotal);
}

//ローカルストレージに保存する
function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); //配列を文字列に変換する
}

//読み込む関数
function loadRecords() {
    const loadData = localStorage.getItem(STORAGE_KEY);

    if (!loadData) {
        return [];
    }

    try {
    return JSON.parse(loadData); //文字列を元の配列に戻す
    } catch (error) {
        console.log("保存データの読み込みに失敗しました", error);
        return [];
    }
}



















