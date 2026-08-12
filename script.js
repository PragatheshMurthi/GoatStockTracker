/* =========================================================
   MAIN + SUB TAB CONTROLLERS
   ========================================================= */

(() => {
    const DB_URL = "https://scaling-giggle-qxx47rg7jr42499p-3000.app.github.dev/api/expenses";
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

    function clearExpenseForm() {
        if (expenseName) expenseName.value = "";
        if (expenseCategory) expenseCategory.value = "";
        if (expenseAmount) expenseAmount.value = "";
        if (expenseDate) expenseDate.value = "";
        if (expenseDescription) expenseDescription.value = "";
        if (expenseAttachment) expenseAttachment.value = "";
    }


    if (clearExpense) {
        clearExpense.addEventListener("click", () => {
            clearExpenseForm();
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
            
            // Grab the file input element and its selected file
            const fileInput = document.getElementById("expenseAttachment");
            const file = fileInput?.files[0] || null;

            // --- VALIDATIONS ---
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

            // Validate File Size (5MB Limit)
            if (file && file.size > 5 * 1024 * 1024) {
                alert("File is too large! Maximum size is 5MB.");
                fileInput.focus();
                return;
            }

            // Validate File Type
            if (file && !['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(file.type)) {
                alert("Invalid file type! Only images and PDFs are allowed.");
                fileInput.focus();
                return;
            }

            let selectedDate = date;
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

            // --- CONSTRUCT FORM DATA FOR EXPRESS/SQLITE ---
            // We use FormData instead of a raw object to safely transport binary files
            const formData = new FormData();
            formData.append("expenseName", name);
            formData.append("expenseCategory", category);
            formData.append("expenseAmount", amount);
            formData.append("expenseDate", selectedDate);
            formData.append("expenseDescription", description);
            
            if (file) {
                // Must match the upload.single('expenseAttachment') name on your Express server
                formData.append("expenseAttachment", file); 
            }

            console.log("Saving expense payload to SQLite backend...");

            saveExpense.disabled = true;
            saveExpense.classList.add("saving");

            const originalContent = saveExpense.innerHTML;
            saveExpense.innerHTML = "<span>Saving...</span>";

            try {
                // Send the network request to your Express server API endpoint
                const response = await fetch(DB_URL, {
                    method: "POST",
                    body: formData // No Headers needed; fetch handles multipart/form-data automatically
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Server failed to process data.");
                }

                console.log("Expense saved successfully to SQLite ID:", result.expenseId);

                saveExpense.innerHTML = "<span>Saved ✓</span>";

                clearExpenseForm();

                // Optional: call your update UI function if you have one
                /* await renderHistory(); */

            } catch (error) {
                console.error("Failed to save expense:", error);

                saveExpense.innerHTML = "<span>Save Failed ✕</span>";

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

    // --- Updated Fetch Function for SQLite ---
async function fetchSpendingHistory() {
    try {
        const response = await fetch(DB_URL);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch history');
        }

        return await response.json(); 
    } catch (error) {
        console.error("Error retrieving spending data:", error);
        alert(`Could not load history: ${error.message}`);
        return [];
    }
}

// --- Updated Render Function with Conditional Download Buttons ---
async function renderHistory() {
    const history = await fetchSpendingHistory();
    const tbody = document.getElementById("spending-history-body");

    if (!tbody) return;
    tbody.innerHTML = "";

    let total = 0;

    history.forEach(item => {
        total += item.amount;

        // Default to a completely empty cell string
        let attachmentCellHTML = '';
        
        // The button HTML structure is only drawn if valid binary data is found
        if (item.attachmentDataUrl) {
            const fileName = item.attachmentName || 'attachment';
            
            attachmentCellHTML = `
                <a href="${item.attachmentDataUrl}" download="${fileName}" class="download-btn" style="text-decoration: none; color: #0066cc; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; gap: 4px;">
                    📥 Download File
                </a>`;
        }

        // Append the row to your table layout structure
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
            <td>${attachmentCellHTML}</td>
          </tr>
        `;
    });

    const totalDisplay = document.getElementById("total-spending");
    if (totalDisplay) {
        totalDisplay.textContent = `₹ ${total.toLocaleString()}.00`;
    }
}
})();