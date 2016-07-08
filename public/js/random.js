
exports.getRandomNumberInRange = function (min, max) {
    return Math.floor((Math.random() * max) + min);
};

exports.getRandomElementOfArray = function (array) {
    return array[this.getRandomNumberInRange(0, array.length)];
};

exports.check = function(percentage){
    return this.getRandomNumberInRange(0,100) > percentage;
};