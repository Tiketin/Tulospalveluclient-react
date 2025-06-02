export default class InputValidator {
  
    static isNumeric(value) {
    return typeof value === "string" && value.trim() !== "" && !isNaN(value);
  }

  static isMolkkyNumeric(value) {
    return (typeof value === "string" && value.trim() !== "" && !isNaN(value)) && value <= 12 && value >= 0;
  }

}