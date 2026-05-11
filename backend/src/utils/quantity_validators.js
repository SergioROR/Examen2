function isAnIntegerNumber(string_number){
    // Validates if a number surrounded by quotation marks is an integer number 
    // and also greater than zero.
    const number  = Number(string_number);
    return Number.isInteger(number) && number > 0;
}

module.exports = {
    isAnIntegerNumber,
}