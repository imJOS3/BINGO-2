export class NumberGenerator {
    constructor() {
        this.availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
        this.calledNumbers = new Set();
    }

    getNextNumber() {
        if (this.availableNumbers.length === 0) {
            throw new Error("Todos los números han sido llamados.");
        }
        
        const randomIndex = Math.floor(Math.random() * this.availableNumbers.length);
        const number = this.availableNumbers.splice(randomIndex, 1)[0];
        this.calledNumbers.add(number);
        
        return number;
    }
}
