class Demo {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }; // placing a semicolon here crashed the declaration compiler

    public getSum() {
        return this.x + this.y;
    }; // here also
}

export { Demo };
