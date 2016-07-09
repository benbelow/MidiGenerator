
exports.getRandomNumberInRange = function (min, max) {
    if(max < min){
        throw("Max cannot be less than min.")
    }
    // Do this to allow negative numbers
    return Math.floor((Math.random() * (max - min + 1)) + min);
};

exports.getRandomElementOfArray = function (array) {
    return array[this.getRandomNumberInRange(0, array.length - 1)];
};

exports.check = function(percentage){
    return this.getRandomNumberInRange(0,100) <= percentage;
};