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

Element.method("addClass", function (className) {
    let classes = this.className.split(" ");
    if (classes.indexOf(className) < 0) {
        classes.push(className);
        this.className = classes.join(" ").trim();
    }
});

Element.method("removeClass", function (className) {
    let classes = this.className.split(" ");
    let index = classes.indexOf(className);
    if (index >= 0) {
        classes.splice(index, 1);
        this.className = classes.join(" ").trim();
    }
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
    }
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
        let positions = {
            startPos: source.popRandom(),
            destPos: source.popRandom(),
        }
        return positions;
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

let tbl = new app.Sudoku();
document.body.querySelector("#playGround").appendChild(tbl.table);
let generator = new app.Generator();
generator.swapColumnsRange(15)
    .swapRowsRange(15)
    .swapColumns(15)
    .swapRows(15)
    .shakeAll();
util.randomInteger(0, 1) ? generator.invertHorizontal() : 0;
util.randomInteger(0, 1) ? generator.invertVertical() : 0;
tbl.fill(generator.rows);