//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome> 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0, 
        percentage: -1   
    }

    return {

        addItem: function(type, des, val) {
            var newItem, ID;

            //create new ID
            if(data.allItems[type].length >0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            //checking if the type is income or expense and creating a new instance of Income or Expense
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //calling data and then pushing new item in the respective type

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1)

            }

        },

        calculateBudget: function() {
            
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }

})();


//UI CONTROLLER
var UIController = (function(){

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector('.add__type').value,
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.querySelector('.add__value').value)
            };
        },

        addItemList: function(obj, type){

            var html, newHtml, element;

            if(type === 'inc') {
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = '.expenses__list';
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replacing the placeholders
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            document.querySelector('.add__description').value = '',
            document.querySelector('.add__value').value = ''
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc': type = 'exp'
            document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type)
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp')

            if(obj.percentage > 0) {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = 'NaN'
            }
        },

        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll('.item__percentage');
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        displayMonth: function() {
            var now, year, month, months;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();

            year = now.getFullYear();
            month =  now.getMonth();

            document.querySelector('.budget__title--month').textContent = months[month] + ' ' + year;
        }


    }

})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){

        if(event.keyCode === 13) {
            ctrlAddItem();
        }

    });

    document.querySelector('.container').addEventListener('click', ctrlDeleteItem)
        
    };

    var updateBudget = function() {
        // 1. Calculate the budget

        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();


        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages)
    };

    var ctrlAddItem = function() {
       var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !='' && !isNaN(input.value) && input.value>0) {
            // 2. Add the item to the budget
             newItem = budgetCtrl.addItem(input.type, input.description, input.value);

             // 3. Add the item to the UI
             UICtrl.addItemList(newItem, input.type);

              // 4. Change values in input Field back to zero
              UICtrl.clearFields();

              // 5. Calculate the budget
              updateBudget();

              // 6. Update percentages
              updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //income-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);


            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID)

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Update percentages
            updatePercentages();
        }

    }

    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalExp: 0,
                totalInc: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    }

    

})(budgetController, UIController)

controller.init();


