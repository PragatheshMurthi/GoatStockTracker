/* =========================================================
   MAIN TABS
   ========================================================= */

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const tabPanelsContainer = document.querySelector(".tab-panels");


function resizeMainPanel(panel) {
    if (!panel || !tabPanelsContainer) return;

    tabPanelsContainer.style.height = panel.scrollHeight + "px";
}


function activateMainTab(button) {

    const targetId = button.dataset.target;
    const targetPanel = document.getElementById(targetId);
     console.log("SPENDING TAB CLICKED:", targetId);
    if (!targetPanel) {
        console.error("Main tab panel not found:", targetId);
        return;
    }

    /* Activate main tab button */
    tabButtons.forEach(tab => {

        const active = tab === button;

        tab.classList.toggle("active", active);
        tab.setAttribute(
            "aria-selected",
            active ? "true" : "false"
        );

    });


    /* Activate main panel */
    tabPanels.forEach(panel => {

        panel.classList.toggle(
            "active",
            panel === targetPanel
        );

    });


    /*
       Wait until the browser has applied the active class
       before calculating the height.
    */
    requestAnimationFrame(() => {

        resizeMainPanel(targetPanel);

    });

}


/* Main tab click */
tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        activateMainTab(button);

    });

});


/* =========================================================
   SPENDING INNER TABS
   ========================================================= */

const subButtons = document.querySelectorAll(".sub-tab");
const subPanels = document.querySelectorAll(".sub-panel");


console.log("SUB BUTTONS FOUND:", subButtons.length);
console.log("SUB PANELS FOUND:", subPanels.length);


/*
   Spending tab click
*/
subButtons.forEach(button => {

    button.addEventListener("click", function () {

        const targetId = this.dataset.subtarget;
        const targetPanel = document.getElementById(targetId);


        console.log("SPENDING TAB CLICKED:", targetId);


        if (!targetPanel) {

            console.error(
                "Spending panel not found:",
                targetId
            );

            return;

        }


        /* -----------------------------------------
           Activate spending button
           ----------------------------------------- */

        subButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        this.classList.add("active");


        /* -----------------------------------------
           Activate spending panel
           ----------------------------------------- */

        subPanels.forEach(panel => {

            panel.classList.remove("active");

        });

        targetPanel.classList.add("active");


        /*
           IMPORTANT:
           Let the browser render the new sub-panel first.
        */
        requestAnimationFrame(() => {

            const activeMain =
                document.querySelector(".tab-panel.active");


            if (activeMain) {

                resizeMainPanel(activeMain);

            }

        });

    });

});


/* =========================================================
   TODAY BUTTON
   ========================================================= */

const todayButton =
    document.getElementById("todayButton");


if (todayButton) {

    todayButton.addEventListener("click", () => {

        const today = new Date();

        const yyyy =
            today.getFullYear();

        const mm =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const dd =
            String(today.getDate())
                .padStart(2, "0");


        document.getElementById("expense-date").value =
            `${yyyy}-${mm}-${dd}`;

    });

}


/* =========================================================
   CLEAR EXPENSE
   ========================================================= */

const clearExpense =
    document.getElementById("clearExpense");


if (clearExpense) {

    clearExpense.addEventListener("click", () => {

        document.getElementById("expense-name").value = "";
        document.getElementById("expense-category").value = "";
        document.getElementById("expense-amount").value = "";
        document.getElementById("expense-date").value = "";
        document.getElementById("expense-description").value = "";
        document.getElementById("expense-attachment").value = "";

    });

}


/* =========================================================
   SAVE EXPENSE
   ========================================================= */

const saveExpense =
    document.getElementById("saveExpense");


if (saveExpense) {

    saveExpense.addEventListener("click", () => {

        const original =
            saveExpense.innerHTML;


        saveExpense.innerHTML =
            "<span>Saved visually ✓</span>";


        setTimeout(() => {

            saveExpense.innerHTML =
                original;

        }, 1400);

    });

}


/* =========================================================
   INITIAL PAGE LOAD
   ========================================================= */

window.addEventListener("load", () => {

    const activeMain =
        document.querySelector(".tab-panel.active");


    if (activeMain) {

        resizeMainPanel(activeMain);

    }

});


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener("resize", () => {

    const activeMain =
        document.querySelector(".tab-panel.active");


    if (activeMain) {

        resizeMainPanel(activeMain);

    }

});
