let util = {
    //функция генерирует целое случайное число из диапазона min max включительно
    randomInteger: function (min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }
}

Function.prototype.method = function (name, func) {
    if (!this.prototype[name]) {
        this.prototype[name] = func;
        return this;
    }
}

Array.method("fillIncr", function (length, start) {
    start = start || 0;
    for (let i = 0; i < length; i++) {
        this.push(i + start);
    }
    return this;
});

/**
 * Метод popRandom подобен методам shift & pop, но удаляут и возвращяет случайный член массива
 */
Array.method("popRandom", function () {
    return this.splice(Math.floor(Math.random() * this.length), 1)[0];
});

/**
 *Метод смешивает массив случайным образом
 * */
Array.method("shuffle", function () {
    for (let i = 0; i < this.length; i++) {
        let index = Math.floor(Math.random() * (i + 1));
        let saved = this[index];
        this[index] = this[i];
        this[i] = saved;
    }
});

/**
 * Метод нахоит член массива со значением find, меняет его на replace
 * */
Array.method("findAndReplace", function (find, replace) {
    let index = this.indexOf(find);
    if (index > -1) {
        this[index] = replace;
    }
});

/**
 * Метод проверяет все члены массива на соответствие value.
 * Если все равны - вернёт true
 * */
Array.method("allMembers", function (value) {
    for (let i = 0; i < this.length; i += 1) {
        if (this[i] !== value) {
            return false;
        }
    }
    return true;
});

Element.method("addClass", function (className) {
    let classes = this.className.split(" ");
    if (classes.indexOf(className) < 0) {
        classes.push(className);
        this.className = classes.join(" ").trim();
    }
    return this;
});

Element.method("removeClass", function (className) {
    let classes = this.className.split(" ");
    let index = classes.indexOf(className);
    if (index >= 0) {
        classes.splice(index, 1);
        this.className = classes.join(" ").trim();
    }
    return this;
});

let app = {};

app.Sudoku = function (areaNum) {
    let that = this;
    let table = document.createElement("table");
    table.addClass("sudoku");
    let area = areaNum || 3;
    let expo = area * area;
    for (let i = 0; i < expo; i++) {
        let row = table.insertRow(-1);
        for (let j = 0; j < expo; j++) {
            let cell = row.insertCell(-1);
            // cell.innerHTML = i + ';' + j;
            switch (i % area) {
                case 0:
                    cell.addClass("top");
                    break;
                case area - 1:
                    cell.addClass("bottom");
            }
            switch (j % area) {
                case 0:
                    cell.addClass("left");
                    break;
                case area - 1:
                    cell.addClass("right");
            }
        }
    }
    that.table = table;
    that.expo = expo;
}

app.Sudoku.prototype = {
    fill: function (values) {
        let that = this;
        that.values = values;
        for (let i = 0; i < that.expo; i++) {
            let row = that.table.rows[i];
            for (let j = 0; j < that.expo; j++) {
                let cell = row.cells[j];
                // cell.insertAdjacentHTML("beforeend", values[i][j]);
                cell.innerHTML = values[i][j];
            }
        }
    },

    // метод скрывает count полей в случайном порядке, меняет их на поля для ввода
    hide: function (count) {
        let that = this;
        for (let i = 0; i < count; i += 1) {
            let processing = true;
            // избегаем повторения полей, чтобы скрыть нужное количество
            while (processing) {
                let rowNumber = util.randomInteger(0, that.expo - 1);
                let colNumber = util.randomInteger(0, that.expo - 1);
                // если поле уже скрыто, выбираем новое значение
                if (!that.table.rows[rowNumber].cells[colNumber].hided) {
                    that.table.rows[rowNumber].cells[colNumber].hided = true;
                    that.table.rows[rowNumber].cells[colNumber].innerHTML = "";
                    let editCell = document.createElement("input");
                    that.table.rows[rowNumber].cells[colNumber].appendChild(editCell);
                    that.table.rows[rowNumber].cells[colNumber].editCell = editCell;
                    // Добавляем событие наизменение значения
                    editCell.addEventListener("change", function () {
                        // метод проверки описан ниже
                        that.check();
                    });
                    processing = false;
                }
            }
        }
        // Выполняем проверку уже совпавших рядов. В идеале, таких быть не должно.
        that.check();
    },

    // Метод проверяет состояние игры
    check: function () {
        let that = this;
        that.unmark();
        // Создаём и заполняем проверочные массивы.
        // По ним отслежываем, чтобы значения не повторялись
        let rows = [];
        let columns = [];
        let areas = [];
        for (let i = 0; i < that.expo; i += 1) {
            rows.push([].fillIncr(that.expo, 1));
            columns.push([].fillIncr(that.expo, 1));
            areas.push([].fillIncr(that.expo, 1));
        }
        // Проверяем значения
        Array.prototype.forEach.call(that.table.rows, function (row, i) {
            Array.prototype.forEach.call(row.cells, function (cell, j) {
                let value = that.getValue(cell);
                // В проверочных массивах заменяем существующие в игровом поле значения на нули
                rows[i].findAndReplace(value, 0);
                columns[j].findAndReplace(value, 0);
                areas[that.getArea(i, j)].findAndReplace(value, 0);
            });
        });
        // Проверяем правильность заполнения, создаём счётчик для проверки
        let correct = {
            rows: 0,
            columns: 0,
            areas: 0,
        };

        for (let i = 0; i < that.expo; i += 1) {
            // если все цифры в группе уникальны, помечаем группу, увеличиваем счетчик
            if (rows[i].allMembers(0)) {
                that.markRow(i);
                correct.rows += 1;
            }
            if (columns[i].allMembers(0)) {
                that.markColumn(i);
                correct.columns += 1;
            }
            if (areas[i].allMembers(0)) {
                that.markArea(i);
                correct.areas += 1;
            }
        }
        // Если все группы отмеченны как правильные, игра заканчивается
        if (correct.rows === that.expo &&
            correct.columns === that.expo &&
            correct.areas === that.expo) {
            // Функцйию win определяем на любом этапе (позднее), но обязательно проверяем ее существование и тип
            if (typeof (that.win) === "function") {
                that.win();
            }
        }
    },

    // Метод отмечает ячейку cell классом, либо снимает класс - в зависимости от state
    markCell: function (cell, state) {
        if (state) {
            cell.addClass("marked");
        } else {
            cell.removeClass("marked");
        }
    },

    // Возвращяет значение ячейки, для поля, либо простой ячейки
    getValue: function (cell) {
        if (cell.editCell) {
            return parseInt(cell.editCell.value, 10);
        } else {
            return parseInt(cell.innerHTML, 10);
        }
    },

    // Отмечает строку целиком
    markRow: function (number) {
        let that = this;
        Array.prototype.forEach.call(that.table.rows[number].cells, function (cell) {
            that.markCell(cell, true);
        });
    },

    // Отмечает колонку целиком
    markColumn: function (number) {
        let that = this;
        Array.prototype.forEach.call(that.table.rows, function (row) {
            that.markCell(row.cells[number], true);
        });
    },

    // Отмечает область целиком
    markArea: function (number) {
        let that = this;
        let area = Math.sqrt(that.expo);
        let startRow = Math.trunc(number / area,) * area;
        let startColumn = (number % area) * area;

        for (let i = 0; i < area; i += 1) {
            for (let j = 0; j < area; j++) {
                that.markCell(that.table.rows[i + startRow].cells[j + startColumn], true);
            }
        }
    },

    // Снимает отметки со всего игрового поля
    unmark: function () {
        let that = this;
        Array.prototype.forEach.call(that.table.rows, function (row) {
            Array.prototype.forEach.call(row.cells, function (cell) {
                that.markCell(cell, false);
            });
        });
    },

    // Возвращает номер области по номеру строки и столбца
    getArea: function (row, column) {
        let that = this;
        let area = Math.sqrt(that.expo);
        return Math.trunc(row / area) * area + Math.trunc(column / area);
    },
}

app.Generator = function (areaNum) {
    let that = this;
    let area = areaNum || 3;
    let expo = area * area;
    let base = [].fillIncr(expo, 1);
    let rows = [];
    for (let i = 0; i < expo; i++) {
        let row = [];
        let start = (i % area) * area + Math.trunc(i / area);
        for (let j = 0; j < expo; j++) {
            row.push(base.slice(start, expo).concat(base)[j]);
        }
        rows.push(row);
    }
    that.rows = rows;
    that.expo = expo;
    that.area = area;
}

app.Generator.prototype = {
    invertVertical: function () {
        let that = this;
        that.rows.reverse();
        return that;
    },

    invertHorizontal: function () {
        let that = this;
        for (let i = 0; i < that.expo; i++) {
            that.rows[i].reverse();
        }
        return that;
    },

    /**
     * возврвщает два случайных числа из диапазона длины области
     */
    getPosition: function () {
        let source = [].fillIncr(this.area);
        return {
            startPos: source.popRandom(),
            destPos: source.popRandom(),
        };
    },

    //перемешать строки
    swapRows: function (count) {
        let that = this;
        for (let i = 0; i < count; i += 1) {
            let area = util.randomInteger(0, that.area - 1);
            let values = that.getPosition();
            let sourcePosition = area * that.area + values.startPos;
            let destPosition = area * that.area + values.destPos;
            let row = that.rows.splice(sourcePosition, 1)[0];
            that.rows.splice(destPosition, 0, row);
        }
        return that;
    },

    //перемешать колонки
    swapColumns: function (count) {
        let that = this;
        for (let i = 0; i < count; i += 1) {
            let area = util.randomInteger(0, that.area - 1);
            let values = that.getPosition();
            let sourcePosition = area * that.area + values.startPos;
            let destPosition = area * that.area + values.destPos;
            for (let j = 0; j < that.expo; j += 1) {
                let cell = that.rows[j].splice(sourcePosition, 1)[0];
                that.rows[j].splice(destPosition, 0, cell);
            }
        }
        return that;
    },

    //перемешать горизонтальные области
    swapRowsRange: function (count) {
        let that = this;
        for (let i = 0; i < count; i += 1) {
            let values = that.getPosition();
            let rows = that.rows.splice(values.startPos * that.area, that.area);
            let args = [values.destPos * that.area, 0].concat(rows);
            that.rows.splice.apply(that.rows, args);
        }
        return that;
    },

    //перемешать вертикальные области
    swapColumnsRange: function (count) {
        let that = this;
        for (let i = 0; i < count; i += 1) {
            let values = that.getPosition();
            for (let j = 0; j < that.expo; j += 1) {
                let cells = that.rows[j].splice(values.startPos * that.area, that.area);
                let args = [values.destPos * that.area, 0].concat(cells);
                that.rows[j].splice.apply(that.rows[j], args);
            }
        }
        return that;
    },

    // Заменить все цифры в таблице зеачений
    shakeAll: function () {
        let that = this;
        let shaked = [].fillIncr(that.expo, 1);
        shaked.shuffle();
        for (let i = 0; i < that.expo; i += 1) {
            for (let j = 0; j < that.expo; j += 1) {
                that.rows[i][j] = shaked[that.rows[i][j] - 1];
            }
        }
    }
}

// Конструктор для типа Timer, который отвечает за учет времени и очков
app.Timer = function () {
    let that = this;
    let content = document.createElement("div").addClass("timer");
    let display = document.createElement("div").addClass("display");
    content.appendChild(display);
    that.now = 0;
    that.timer = setInterval(function () {
        that.now += 1;
        that.refresh();
    }, 1000);
    that.content = content;
    that.display = display;
    that.refresh();
}

app.Timer.prototype = {
    // Метод для обновления состояния времени
    refresh: function () {
        let that = this;
        that.display.innerHTML = "Прошло времени: " + that.now + " сек.";
    },

    // Метод для определения количества очков. Формула взята для примера.
    /*getScore: function () {
        return Math.trunc(Math.pow(app.parameters.hided * app.parameters.area, 2) * 1000 / this.now);
    },*/

    stop: function () {
        clearInterval(this.timer);
    },
}

app.parameters = {
    area: 3, // размер области
    shuffle: 15, // количество перемешиваний
    hided: 20, // количество скрытых ячеек
}

let tbl = new app.Sudoku(app.parameters.area);
document.body.querySelector("#playGround").appendChild(tbl.table);

let generator = new app.Generator(app.parameters.area);
generator.swapColumnsRange(app.parameters.shuffle)
    .swapRowsRange(app.parameters.shuffle)
    .swapColumns(app.parameters.shuffle)
    .swapRows(app.parameters.shuffle)
    .shakeAll();

util.randomInteger(0, 1) ? generator.invertHorizontal() : 0;
util.randomInteger(0, 1) ? generator.invertVertical() : 0;

tbl.fill(generator.rows);
tbl.hide(app.parameters.hided);

let timer = new app.Timer();
document.body.querySelector("#playGround").appendChild(timer.content);

tbl.win = function () {
    alert("Поздравляем! Вы победили. " + "Игра продлилась" + timer.now + " сек.");
    timer.stop();
}