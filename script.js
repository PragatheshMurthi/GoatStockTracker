// Import the functions you need from the SDKs you need
import { initializeApp, } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyCKoQAHXTo2YduiXmrZPuNxGTCzukmpONU",
authDomain: "goatmanagement.firebaseapp.com",
projectId: "goatmanagement",
storageBucket: "goatmanagement.firebasestorage.app",
messagingSenderId: "507936824844",
appId: "1:507936824844:web:1a237fde68450180709829"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================================================
   MAIN + SUB TAB CONTROLLERS
   ========================================================= */

(() => {
    const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
    const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
    const tabPanelsContainer = document.querySelector(".tab-panels");

    const subTabList = document.querySelector(".sub-tab-list");
    const subButtons = Array.from(document.querySelectorAll(".sub-tab"));
    const subPanels = Array.from(document.querySelectorAll(".sub-panel"));

    function resizeMainPanel(panel) {
        if (!panel || !tabPanelsContainer) return;
        tabPanelsContainer.style.height = `${panel.scrollHeight}px`;
    }

    function setMainTabState(targetButton, targetPanel) {
        tabButtons.forEach((button) => {
            const isActive = button === targetButton;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        tabPanels.forEach((panel) => {
            panel.classList.toggle("active", panel === targetPanel);
        });

        requestAnimationFrame(() => resizeMainPanel(targetPanel));
    }

    function activateMainTab(button) {
        if (!button) return;

        const targetId = button.dataset.target;
        if (!targetId) return;

        const targetPanel = document.getElementById(targetId);
        if (!targetPanel) return;

        setMainTabState(button, targetPanel);
    }

    function setSubTabState(targetButton, targetPanel) {
        subButtons.forEach((button) => {
            const isActive = button === targetButton;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        subPanels.forEach((panel) => {
            panel.classList.toggle("active", panel === targetPanel);
        });

        requestAnimationFrame(() => {
            const activeMainPanel = document.querySelector(".tab-panel.active");
            if (activeMainPanel) {
                resizeMainPanel(activeMainPanel);
            }
        });
    }

    function activateSubTab(button) {
        if (!button) return;

        const targetId = button.dataset.subtarget;
        if (!targetId) return;

        const targetPanel = document.getElementById(targetId);
        if (!targetPanel) return;

        setSubTabState(button, targetPanel);

        if (targetId === "spending-history") {
            renderHistory();
        }
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => activateMainTab(button));
    });

    if (subTabList) {
        subTabList.addEventListener("click", (event) => {
            const clicked = event.target.closest(".sub-tab");
            if (!clicked || !subTabList.contains(clicked)) return;
            activateSubTab(clicked);
        });
    }

    const todayButton = document.getElementById("todayButton");
    const expenseDate = document.getElementById("expense-date");

    if (todayButton && expenseDate) {
        todayButton.addEventListener("click", () => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            expenseDate.value = `${yyyy}-${mm}-${dd}`;
        });
    }

    const clearExpense = document.getElementById("clearExpense");
    const expenseName = document.getElementById("expense-name");
    const expenseCategory = document.getElementById("expense-category");
    const expenseAmount = document.getElementById("expense-amount");
    const expenseDescription = document.getElementById("expense-description");
    const expenseAttachment = document.getElementById("expense-attachment");

    if (clearExpense) {
        clearExpense.addEventListener("click", () => {
            if (expenseName) expenseName.value = "";
            if (expenseCategory) expenseCategory.value = "";
            if (expenseAmount) expenseAmount.value = "";
            if (expenseDate) expenseDate.value = "";
            if (expenseDescription) expenseDescription.value = "";
            if (expenseAttachment) expenseAttachment.value = "";
        });
    }

    const saveExpense = document.getElementById("saveExpense");

    if (saveExpense) {
        
        saveExpense.addEventListener("click", async () => {
            const name = expenseName?.value.trim() || "";
            const category = expenseCategory?.value || "";
            const amount = Number(expenseAmount?.value);
            const date = expenseDate?.value || "";
            const description = expenseDescription?.value.trim() || "";

            if (!name) {
                alert("Please enter the expense name.");
                expenseName?.focus();
                return;
            }

            if (!category) {
                alert("Please select an expense category.");
                expenseCategory?.focus();
                return;
            }

            if (!Number.isFinite(amount) || amount <= 0) {
                alert("Please enter a valid expense amount.");
                expenseAmount?.focus();
                return;
            }

            
            let selectedDate = expenseDate?.value;

            if (!selectedDate) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const dd = String(today.getDate()).padStart(2, "0");

                selectedDate = `${yyyy}-${mm}-${dd}`;

                if (expenseDate) {
                    expenseDate.value = selectedDate;
                }
            }


            const expense = {
                name,
                category,
                amount,
                date: selectedDate,
                description,
                createdAt: serverTimestamp()
            };

            console.log("Saving expense:", expense);

            saveExpense.disabled = true;
            saveExpense.classList.add("saving");

            const originalContent = saveExpense.innerHTML;
            saveExpense.innerHTML = "<span>Saving...</span>";

            try {
                const documentReference = await addDoc(
                    collection(db, "expenses"),
                    expense
                );

                console.log(
                    "Expense saved successfully:",
                    documentReference.id
                );

                saveExpense.innerHTML = "<span>Saved ✓</span>";

                clearExpenseForm();

                /*
                * Reload the history from Firestore after the database
                * write completes.
                */
                /*await renderHistory();*/
            } catch (error) {
                console.error("Failed to save expense:", error);

                saveExpense.innerHTML =
                    "<span>Save Failed ✕</span>";

                alert(`Unable to save expense: ${error.message}`);
            } finally {
                setTimeout(() => {
                    saveExpense.innerHTML = originalContent;
                    saveExpense.disabled = false;
                    saveExpense.classList.remove("saving");
                }, 1500);
            }
        });

    }

    function syncInitialStates() {
        const activeMainButton = tabButtons.find((button) => button.classList.contains("active")) || tabButtons[0];
        if (activeMainButton) {
            activateMainTab(activeMainButton);
        }

        const activeSubButton = subButtons.find((button) => button.classList.contains("active")) || subButtons[0];
        if (activeSubButton) {
            activateSubTab(activeSubButton);
        }
    }

    window.addEventListener("load", syncInitialStates);
    window.addEventListener("resize", () => {
        const activeMainPanel = document.querySelector(".tab-panel.active");
        if (activeMainPanel) {
            resizeMainPanel(activeMainPanel);
        }
    });
})();

async function fetchSpendingHistory() {

    const snapshot = await getDocs(
        collection(db, "expenses")
    );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}


async function renderHistory() {

  const history = await fetchSpendingHistory();

  const tbody = document.getElementById(
    "spending-history-body"
  );

  tbody.innerHTML = "";

  let total = 0;

  history.forEach(item => {

    total += item.amount;

    tbody.innerHTML += `
      <tr>
        <td>${item.date}</td>
        <td>${item.name}</td>
        <td>
          <span class="category-pill">
            ${item.category}
          </span>
        </td>
        <td>₹ ${item.amount.toLocaleString()}</td>
      </tr>
    `;
  });

  document.getElementById(
    "total-spending"
  ).textContent = `₹ ${total.toLocaleString()}.00`;
}