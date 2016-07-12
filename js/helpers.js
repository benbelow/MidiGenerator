exports.lastItemInList = function (list) {
    return list.slice(-1)[0]
};

exports.penultimateItemInList = function (list) {
    return list.slice(-2)[0];
};

exports.sign = function (x) {
    return x ? x < 0 ? -1 : 1 : 0;
};