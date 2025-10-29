"use strict";

const labelSumIn = document.querySelector(".op__in");
const labelSumOut = document.querySelector(".op__out");
const labelSumTot = document.querySelector(".op__tot");
const labelWelcome = document.querySelector(".greet-user");

const inputExpenseName = document.querySelector(".expense_name");
const inputExpenseValue = document.querySelector(".expense_value");
const inputExpenseType = document.querySelector(".form__input--type");
const inputExpenseName2 = document.querySelector(".expense_name-2");
const inputExpenseValue2 = document.querySelector(".expense_value-2");
const inputExpenseType2 = document.querySelector(".form__input--type-2");

const inputExpenseTypeIn = document.querySelector(".check_in");
const inputExpenseTypeOut = document.querySelector(".check_out");
const inputLoginUser = document.querySelector(".user-input");
const inputLoginPassword = document.querySelector(".password-input");
const inputCreateName = document.querySelector(".input-create-name");
const inputCreateUser = document.querySelector(".input-create-user");
const inputCreatePassword = document.querySelector(".password-create");

const btnAddExpense = document.querySelector(".add");
const btnAddExpenseMobile = document.querySelector(".btn-add-mobile");
const btnLogin = document.querySelector(".btn-login");
const btnLoginAcc = document.querySelector(".login-acc");
const btnSeePassword = document.querySelectorAll(".btn-see-password");
const btnCreate = document.querySelector(".btn-create");
const btnCreateAcc = document.querySelector(".create-acc");
const btnLogout = document.querySelector(".logout-box");
const addMobile2 = document.querySelector(".add-2");
const btnYes = document.querySelector(".yes");
const btnNo = document.querySelector(".no");
const btnCloseEdit = document.querySelectorAll(".close_edit_box");
const btnEditExpense = document.querySelector(".edit_expense");

const containerRows = document.querySelector(".expenses-rows-box");
const rows = document.querySelector(".expenses-row");
const appContainer = document.querySelector(".app-container");
const loginContainer = document.querySelector(".login_start");
const createContainer = document.querySelector(".login_create");
const overlay = document.querySelector(".overlay");
const deleteExpenseBox = document.querySelector(".delete-box");
const editBox = document.querySelector(".edit-box");
const editCtaBox = document.querySelector(".edit_cta-box");

///////////////////////////////////////
// APLICATION ARCHITETURE
class App {
  #currentAccount;
  #currentExpense;
  #accounts = [];

  constructor() {
    this._initialAppState();

    // Event Listiners
    btnYes.addEventListener("click", this._deleteYes.bind(this));
    btnNo.addEventListener("click", this._deleteNo);
    containerRows.addEventListener("click", this._deleteExpense.bind(this));
    btnLogout.addEventListener("click", this._logout);
    btnLoginAcc.addEventListener("click", this._alterningLogin);
    btnCreateAcc.addEventListener("click", this._alterningCreate);
    btnCreate.addEventListener("click", this._createAccount.bind(this));
    btnLogin.addEventListener("click", this._loginAccount.bind(this));
    btnAddExpense.addEventListener("click", this._renderExpenses.bind(this));
    addMobile2.addEventListener("click", this._renderExpensesMobile.bind(this));
    btnAddExpenseMobile.addEventListener("click", this._addExpenseMobile);
    overlay.addEventListener("click", this._addMobileOverlay);
    btnSeePassword.forEach((see) => {
      see.addEventListener("click", this._showinUserPassword);
    });
  }

  // ALTERNAR ENTRE CRIAR E INICIAR CONTA
  _alterningLogin(e) {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    createContainer.classList.remove("hidden");
  }

  _alterningCreate(e) {
    e.preventDefault();
    loginContainer.classList.remove("hidden");
    createContainer.classList.add("hidden");
  }

  // CRIANDO UMA NOVA CONTA
  _createAccount(e) {
    e.preventDefault();

    const fullName = inputCreateName.value;
    const username = inputCreateUser.value;
    const password = +inputCreatePassword.value;

    this._getLocalStorage();

    if (
      inputCreateName.value === "" ||
      inputCreateUser.value === "" ||
      inputCreatePassword.value === ""
    ) {
      alert("Por favor, preencha todos os campos");
    } else if (this.#accounts.find((acc) => acc.username === username)) {
      alert("Usuário já existe");
    } else if (fullName && username && password && fullName.includes(" ")) {
      const account = {
        fullName: fullName,
        username: username,
        password: password,
        allExpenses: [],
      };
      this.#accounts.push(account);
      this._setLocalStorage();
      alert("A sua conta foi criada com sucesso");
      this._alterningCreate(e);
    } else {
      alert("Credências invalidas");
    }

    // Clear inputs fields
    inputCreateName.value =
      inputCreatePassword.value =
      inputCreateUser.value =
        "";
  }

  // INICIANDO SESSÃO
  _loginAccount(e) {
    e.preventDefault();

    if (containerRows.innerHTML === "") {
      document.querySelector(".expenses-info").classList.add("hidden");
    } else {
      document.querySelector(".expenses-info").classList.remove("hidden");
    }

    const loginUsername = inputLoginUser.value;
    const loginPassword = +inputLoginPassword.value;
    console.log(loginPassword);

    this._getLocalStorage();

    this.#currentAccount = this.#accounts.find(
      (acc) => acc.username === loginUsername
    );

    if (inputLoginPassword.value === "" || inputLoginUser.value === "") {
      alert("Por favor, preencha todos os campos");
    } else if (
      loginUsername === this.#currentAccount?.username &&
      loginPassword === this.#currentAccount?.password
    ) {
      console.log(this.#currentAccount);
      appContainer.classList.remove("hidden");
      loginContainer.classList.add("hidden");
    } else {
      alert("Credências erradas, tente novamente");
    }

    const welcome = this.#currentAccount.fullName.split(" ")[0];
    labelWelcome.textContent = `Bem Vindo de volta, ${welcome}`;

    inputLoginPassword.value = inputLoginUser.value = "";
    this._expensesRows();

    this._calcBalance(this.#currentAccount.allExpenses);
  }

  // MONSTRANDO A PALAVRA PASSE DO USUÁRIO
  _showinUserPassword(e) {
    const loginOff = document.querySelector(".eye-off-outline");
    const loginIn = document.querySelector(".eye-outline");
    const loginOff1 = document.querySelector(".eye-off-outline--1");
    const loginIn1 = document.querySelector(".eye-outline--1");

    e.preventDefault();
    if (inputLoginPassword.type === "password") {
      inputLoginPassword.type = "text";
      loginIn.classList.remove("hidden");
      loginOff.classList.add("hidden");

      inputLoginPassword.value = inputLoginPassword.value;
    } else if (inputLoginPassword.type === "text") {
      inputLoginPassword.type = "password";
      loginIn.classList.add("hidden");
      loginOff.classList.remove("hidden");
    }

    if (inputCreatePassword.type === "password") {
      inputCreatePassword.type = "text";
      loginIn1.classList.remove("hidden");
      loginOff1.classList.add("hidden");

      inputCreatePassword.value = inputCreatePassword.value;
    } else if (inputCreatePassword.type === "text") {
      inputCreatePassword.type = "password";
      loginIn1.classList.add("hidden");
      loginOff1.classList.remove("hidden");
    }
  }

  // RENDERIZANDO DISPESAS
  _renderExpenses(e) {
    e.preventDefault();

    if (containerRows.innerHTML === "") {
      document.querySelector(".expenses-info").classList.add("hidden");
    } else {
      document.querySelector(".expenses-info").classList.remove("hidden");
    }

    const expenseName = inputExpenseName.value;
    const expenseValue = +inputExpenseValue.value;
    const expenseType = inputExpenseType.value;

    const expenses = {};
    expenses.type = expenseType;

    if (expenseType === "entrada" && expenseValue !== 0) {
      expenses.value = +expenseValue;
      expenses.id = Math.trunc(Math.random() * 100000000) + 1;
      expenses.name = expenseName;
      this.#currentAccount.allExpenses.push(expenses);
      this._setLocalStorage();
      console.log(this.#currentAccount);
    }

    if (expenseType === "saida" && expenseValue !== 0) {
      expenses.value = -expenseValue;
      expenses.id = Math.trunc(Math.random() * 100000000) + 1;
      expenses.name = expenseName;
      this.#currentAccount.allExpenses.push(expenses);
      this._setLocalStorage();
      console.log(this.#currentAccount);
    } else if (
      inputExpenseName.value === "" ||
      inputExpenseValue.value === ""
    ) {
      alert("Por favor, preencha todos os campos");
    }

    inputExpenseName.value = inputExpenseValue.value = "";

    document
      .querySelectorAll(".checkbox")
      .forEach((c) => c.classList.remove("checkbox__active"));

    this._expensesRows();
    this._calcBalance(this.#currentAccount.allExpenses);
  }

  _renderExpensesMobile(e) {
    e.preventDefault();

    if (containerRows.innerHTML === "") {
      document.querySelector(".expenses-info").classList.add("hidden");
    } else {
      document.querySelector(".expenses-info").classList.remove("hidden");
    }

    const expenseName = inputExpenseName2.value;
    const expenseValue = +inputExpenseValue2.value;
    const expenseType = inputExpenseType2.value;

    const expenses = {};
    expenses.type = expenseType;

    if (expenseType === "entrada" && expenseValue !== 0) {
      expenses.value = +expenseValue;
      expenses.id = Math.trunc(Math.random() * 100000000) + 1;
      expenses.name = expenseName;
      this.#currentAccount.allExpenses.push(expenses);
      this._setLocalStorage();
    }

    if (expenseType === "saida" && expenseValue !== 0) {
      expenses.value = -expenseValue;
      expenses.id = Math.trunc(Math.random() * 100000000) + 1;
      expenses.name = expenseName;
      this.#currentAccount.allExpenses.push(expenses);
      this._setLocalStorage();
    } else if (
      inputExpenseName2.value === "" ||
      inputExpenseValue2.value === ""
    ) {
      alert("Por favor, preencha todos os campos");
    }

    inputExpenseName2.value = inputExpenseValue2.value = "";

    document
      .querySelectorAll(".checkbox")
      .forEach((c) => c.classList.remove("checkbox__active"));

    this._expensesRowsMobile();
    this._calcBalance(this.#currentAccount.allExpenses);

    overlay.classList.add("hidden");
    document.querySelector(".form-box-2").classList.add("hidden");
  }

  // CALCULANDO A BALANÇA
  _calcBalance(curr) {
    let incomes = 0;
    let out = 0;
    let total = 0;

    curr.forEach((t) => {
      t.value > 0 ? (incomes += t.value) : (out += t.value);
    });
    total = incomes + out;

    if (total === 0) {
      labelSumTot.classList.add("official");
    } else if (total > 0) {
      labelSumTot.classList.add("in_col");
    } else if (total < 0) {
      labelSumTot.classList.add("out_col");
    }

    labelSumIn.textContent = `${currencyIn(incomes)}`.padStart(2, 0);
    labelSumOut.textContent = `${currencyOut(out)}`.padStart(2, 0);
    labelSumTot.textContent = `${currencyTot(total)}`.padStart(2, 0);
    return console.log(incomes, out, total);

    this._setLocalStorage();

    function currencyIn(curr) {
      return new Intl.NumberFormat("pt-pt").format(incomes);
    }
    function currencyOut(curr) {
      return new Intl.NumberFormat("pt-pt").format(out);
    }
    function currencyTot(curr) {
      return new Intl.NumberFormat("pt-pt").format(total);
    }
  }

  // EXIBINDO AS DISPESAS
  _expensesRows() {
    containerRows.innerHTML = "";
    this.#currentAccount.allExpenses.forEach((exp) => {
      const expenseType = exp.type === "entrada" ? "in" : "out";
      const expenseIcon = exp.type === "saída" ? "down" : "up";

      const html = `
      <div class="expenses-row" data-id="${exp.id}">
        <span class="des">${exp.name}</span>
        <span class="val ${expenseType}">${curr(exp.value)}</span>
        <span class="tip">
          <ion-icon
            class="expense__icon ${expenseType}"
            name="arrow-${expenseIcon}-circle-outline">
          </ion-icon>
        </span>
        <button class="delete">
          <ion-icon class="remove" name="trash"></ion-icon>
        </button>
      </div>`;

      containerRows.insertAdjacentHTML("afterbegin", html);

      this._setLocalStorage();

      function curr(gg) {
        return new Intl.NumberFormat("pt-pt").format(exp.value);
      }

      if (containerRows.innerHTML === "") {
        document.querySelector(".expenses-info").classList.add("hidden");
      } else {
        document.querySelector(".expenses-info").classList.remove("hidden");
      }
    });
  }

  _expensesRowsMobile() {
    containerRows.innerHTML = "";
    this.#currentAccount.allExpenses.forEach((exp) => {
      const expenseType = exp.type === "entrada" ? "in" : "out";
      const expenseIcon = exp.type === "saída" ? "down" : "up";

      const html = `
      <div class="expenses-row" data-id="${exp.id}">
        <span class="des">${exp.name}</span>
        <span class="val ${expenseType}">${curr(exp.value)}</span>
        <span class="tip">
          <ion-icon
            class="expense__icon ${expenseType}"
            name="arrow-${expenseIcon}-circle-outline">
          </ion-icon>
        </span>
        <button class="delete">
          <ion-icon class="remove" name="trash"></ion-icon>
        </button>
      </div>`;

      containerRows.insertAdjacentHTML("afterbegin", html);

      this._setLocalStorage();

      function curr(gg) {
        return new Intl.NumberFormat("pt-pt").format(exp.value);
      }

      if (containerRows.innerHTML === "") {
        document.querySelector(".expenses-info").classList.add("hidden");
      } else {
        document.querySelector(".expenses-info").classList.remove("hidden");
      }
    });
  }

  _addExpenseMobile(e) {
    e.preventDefault();

    document.querySelector(".form-box-2").classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  // ELIMINANDO DISPESAS
  _deleteExpense(e) {
    e.preventDefault();

    const target = e.target.closest(".remove");
    if (!target) return;

    deleteExpenseBox.classList.remove("hidden");
    overlay.classList.remove("hidden");

    const expense = target.closest(".expenses-row");
    this.#currentExpense = +expense.dataset.id;
  }

  _deleteNo(e) {
    e.preventDefault();

    deleteExpenseBox.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  _deleteYes(e) {
    e.preventDefault();
    const dele = this.#currentAccount.allExpenses.findIndex(
      (item) => item.id === this.#currentExpense
    );
    this.#currentAccount.allExpenses.splice(dele, 1);
    this._expensesRows();
    this._expensesRowsMobile();
    this._calcBalance(this.#currentAccount.allExpenses);
    this._setLocalStorage();
    deleteExpenseBox.classList.add("hidden");
    overlay.classList.add("hidden");

    if (containerRows.innerHTML === "") {
      document.querySelector(".expenses-info").classList.add("hidden");
    } else {
      document.querySelector(".expenses-info").classList.remove("hidden");
    }
  }

  // OVERLAY
  _addMobileOverlay(e) {
    e.preventDefault();
    document.querySelector(".form-box-2").classList.add("hidden");
    deleteExpenseBox.classList.add("hidden");
    overlay.classList.add("hidden");
    editBox.classList.add("hidden");
    editCtaBox.classList.add("hidden");
  }

  // TERMINAR SESSÃO
  _logout(e) {
    e.preventDefault();
    appContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  }

  // LOCAL STORAGE API
  _setLocalStorage() {
    localStorage.setItem("accounts", JSON.stringify(this.#accounts));
  }

  _getLocalStorage() {
    // const data = localStorage.getItem("accounts")
    //   ? JSON.parse(localStorage.getItem("accounts"))
    //   : [];

    const data = JSON.parse(localStorage.getItem("accounts"));
    console.log(data);

    if (!data) return;

    this.#accounts = data;
  }

  // Inicial App State
  _initialAppState() {
    labelSumIn.textContent = 0;
    labelSumOut.textContent = 0;
    labelSumTot.textContent = 0;

    containerRows.innerHTML = "";
  }
}

const app = new App();
console.log(app);
