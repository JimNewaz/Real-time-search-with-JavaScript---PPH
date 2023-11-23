    const CSV_URL = "latest.csv";
    let data = [],
        isLoading = true;


    const leftSlider = document.getElementById('input-left');
    const rightSlider = document.getElementById('input-right');

    function updateStepValues() {
        if (leftSlider.value >= 50000) {
            leftSlider.step = 25000;
            rightSlider.step = 25000;
        } else {
            leftSlider.step = 5000;
            rightSlider.step = 5000;
        }

        if (rightSlider.value >= 50000) {
            rightSlider.step = 25000;
        } else {
            rightSlider.step = 5000;
        }

        updateStepDividers();
    }

    leftSlider.addEventListener('input', updateStepValues);
    rightSlider.addEventListener('input', updateStepValues);


    // Function to update the step dividers
    function updateStepDividers() {
        const slider = document.querySelector('.slider');
        const stepDividers = document.querySelectorAll('.step-divider');
        
        // Remove existing step dividers
        stepDividers.forEach(divider => divider.remove());

        // Add new step dividers
        const stepCount = (rightSlider.max - leftSlider.min) / leftSlider.step;
        for (let i = 1; i < stepCount; i++) {
            const stepDivider = document.createElement('div');
            stepDivider.className = 'step-divider';
            const leftPosition = (i / stepCount) * 100;
            stepDivider.style.left = leftPosition + '%';
            slider.appendChild(stepDivider);
        }
    }

    // Initial update of step dividers
    updateStepDividers();

    // elements
    const inputLocation = document.getElementById("location-search");
    const inputWorkspaces = document.getElementById("workspaces-search");

    const inputLeft = document.getElementById("input-left");
    const inputRight = document.getElementById("input-right");
    const thumbLeft = document.querySelector(".slider > .thumb.left");
    const thumbRight = document.querySelector(".slider > .thumb.right");
    const range = document.querySelector(".slider > .range");

    const priceRangeValMin = document.getElementById("price_range_val-min");
    const priceRangeValMax = document.getElementById("price_range_val-max");


    let sortOrders = {};

    function sortTable(column) {
        console.log(`Sorting table by ${column}`);

        // Initialize sort order if not already set
        if (!sortOrders[column]) {
            sortOrders[column] = 'asc';
        } else {
            // Toggle between 'asc' and 'desc'
            sortOrders[column] = sortOrders[column] === 'asc' ? 'desc' : 'asc';
        }

        data.sort((a, b) => {
            let valueA, valueB;

            if (column === 'WorkSpaces' || column === 'List Price') {
                valueA = parseFloat(a[column]) || 0;
                valueB = parseFloat(b[column]) || 0;
            } else {
                valueA = (a[column] || '').toUpperCase();
                valueB = (b[column] || '').toUpperCase();
            }

            let comparison = 0;
            if (valueA < valueB) {
                comparison = -1;
            } else if (valueA > valueB) {
                comparison = 1;
            }

            return sortOrders[column] === 'asc' ? comparison : -comparison;
        });

        loadData(data);
    }


    document.addEventListener("DOMContentLoaded", function () {
        const cityHeader = document.getElementById("cityHeader");
        const locationHeader = document.getElementById("locationHeader");

        if (cityHeader) {
            cityHeader.addEventListener("click", function () {
                console.log("City column header clicked");
                sortTable('City');
            });
        }

        if (locationHeader) {
            locationHeader.addEventListener("click", function () {
                console.log("Location column header clicked");
                sortTable('Location');
            });
        }

        if (addressHeader) {
            addressHeader.addEventListener("click", function () {
                console.log("Address column header clicked");
                sortTable('Address');
            });
        }

        if (workspaceHeader) {
            workspaceHeader.addEventListener("click", function () {
                console.log("Workspaces column header clicked");
                sortTable('WorkSpaces');
            });
        }

        if (lastpriceHeader) {
            lastpriceHeader.addEventListener("click", function () {
                console.log("List Price column header clicked");
                sortTable('List Price');
            });
        }
    });


    // for slider functionality
    function setLeftValue() {
        var _this = inputLeft,
            min = parseInt(_this.min),
            max = parseInt(_this.max);

        _this.value = Math.min(
            parseInt(_this.value),
            parseInt(inputRight.value) - 5
        );

        var percent = ((_this.value - min) / (max - min)) * 100;

        thumbLeft.style.left = percent + "%";
        range.style.left = percent + "%";

        priceRangeValMin.innerHTML = "£" + _this.value;
        doSearch();
    }

    function setRightValue() {
        var _this = inputRight,
            min = parseInt(_this.min),
            max = parseInt(_this.max);

        _this.value = Math.max(
            parseInt(_this.value),
            parseInt(inputLeft.value) + 5
        );

        var percent = ((_this.value - min) / (max - min)) * 100;

        thumbRight.style.right = 100 - percent + "%";
        range.style.right = 100 - percent + "%";

        priceRangeValMax.innerHTML = "£" + _this.value;
        doSearch();
    }

    // helper functions for the search
    function searchByLocation(dt, query) {
        let regx = new RegExp(`^.*?\\b(${query}).*?`, "gi");
        if (!query) return true;
        else if (
            regx.test(dt["City"]) ||
            regx.test(dt["Location"]) ||
            regx.test(dt["Address"])
        ) {
            return true;
        }
        return false;
    }

    function searchByWorkspaces(dt, query) {
        if (query <= 0) return true;
        else if (+dt.WorkSpaces === +query) {
            return true;
        }
        return false;
    }

    function searchByPriceRange(dt, priceRangeMin, priceRangeMax) {
        try {
            if (
                dt["List Price"] &&
                Number(dt["List Price"].replace(/,/g, "")) >= priceRangeMin &&
                Number(dt["List Price"].replace(/,/g, "")) <= priceRangeMax
            ) {
                return true;
            }
            return false;
        } catch (err) {
            throw new Error(err);
        }
    }

    // the search function
    function doSearch() {
        let location = inputLocation.value;
        let workSpaces = inputWorkspaces.value;
        let priceRangeMin = inputLeft.value;
        let priceRangeMax = inputRight.value;

        let tempt = data.filter((dt) => {
            if (
                searchByLocation(dt, location) &&
                searchByWorkspaces(dt, workSpaces) &&
                searchByPriceRange(dt, priceRangeMin, priceRangeMax)
            ) {
                return true;
            } else {
                return false;
            }
        });
        loadData(tempt);
    }

    // load the data into the DOM
    function loadData(filteredData) {
        if (isLoading) return;

        const tableBody = document.getElementById("tbody");
        const newTableBody = document.createElement("tbody");
        newTableBody.setAttribute("id", "tbody");

        if (filteredData.length === 0) {
            const tableRow = document.createElement("tr");
            const tableCell = document.createElement("td");
            tableCell.setAttribute("colspan", 7); // Update colspan to 7
            tableCell.textContent = "No data found!";
            tableRow.appendChild(tableCell);
            newTableBody.appendChild(tableRow);
        } else {
            filteredData.forEach((dt) => {
                const tableRow = document.createElement("tr");
                const cells = Object.values(dt);
                
                for (let i = 0; i < 7; i++) {
                    const tableCell = document.createElement("td");
                    
                    if (i < cells.length) {
                        tableCell.textContent = cells[i];
                    } else {
                        tableCell.textContent = ""; 
                    }
                    tableRow.appendChild(tableCell);
                }

                newTableBody.appendChild(tableRow);
            });
        }

        tableBody.parentNode.replaceChild(newTableBody, tableBody);
    }

    // CSV parser
    function parseCsvIntoJson(csv) {
        const lines = csv.split("\n");
        const headers = lines[0].split(",").map((header) => header.trim());
        const result = [];

        function parseCsvLine(row) {
            var insideQuote = false,
                entries = [],
                entry = [];
            row.split("").forEach(function (character) {
                if (character === '"') {
                    insideQuote = !insideQuote;
                } else {
                    if (character == "," && !insideQuote) {
                        entries.push(entry.join(""));
                        entry = [];
                    } else {
                        entry.push(character);
                    }
                }
            });
            entries.push(entry.join(""));
            return entries;
        }

        for (let i = 1; i < lines.length; i++) {
            let dataLines = lines.slice(i);
            let data = dataLines.map(parseCsvLine)[0];
            const obj = {};

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = data[j];
            }

            result.push(obj);
        }

        return result;
    }

    // fetch data from online URL
    function fetchCsv(endPoint) {
        fetch(endPoint)
            .then((response) => response.text())
            .then((csvData) => {
                data = parseCsvIntoJson(csvData);
                isLoading = false;
                loadData(data);
            })
            .catch((error) => {
                console.error("Error loading CSV file:", error);
            });
    }

    window.addEventListener("load", function () {
        // load data
        fetchCsv(CSV_URL);

        // call necessary functions
        setLeftValue();
        setRightValue();

        // range events
        inputLeft.addEventListener("input", setLeftValue);
        inputRight.addEventListener("input", setRightValue);

        // search events
        inputLocation.addEventListener("input", doSearch);
        inputWorkspaces.addEventListener("input", doSearch);

        // transitions
        inputLeft.addEventListener("mouseover", function () {
            thumbLeft.classList.add("hover");
        });
        inputLeft.addEventListener("mouseout", function () {
            thumbLeft.classList.remove("hover");
        });
        inputLeft.addEventListener("mousedown", function () {
            thumbLeft.classList.add("active");
        });
        inputLeft.addEventListener("mouseup", function () {
            thumbLeft.classList.remove("active");
        });
        inputRight.addEventListener("mouseover", function () {
            thumbRight.classList.add("hover");
        });
        inputRight.addEventListener("mouseout", function () {
            thumbRight.classList.remove("hover");
        });
        inputRight.addEventListener("mousedown", function () {
            thumbRight.classList.add("active");
        });
        inputRight.addEventListener("mouseup", function () {
            thumbRight.classList.remove("active");
        });
    });