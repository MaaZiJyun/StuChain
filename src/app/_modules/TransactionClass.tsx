export class TransactionClass {
  walletId: string;
  password: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  changeAddress: string;
  stuId: string;
  teacherId: string;
  eventId: string;
  deadline: string;
  remark: string;

  constructor(data: {
    walletId: string;
    password: string;
    fromAddress: string;
    toAddress: string;
    amount: number;
    changeAddress: string;
    stuId: string;
    teacherId: string;
    eventId: string;
    deadline: string;
    remark: string;
  }) {
    this.walletId = data.walletId;
    this.password = data.password;
    this.fromAddress = data.fromAddress;
    this.toAddress = data.toAddress;
    this.amount = data.amount;
    this.changeAddress = data.changeAddress;
    this.stuId = data.stuId;
    this.teacherId = data.teacherId;
    this.eventId = data.eventId;
    this.deadline = data.deadline;
    this.remark = data.remark;
  }

  // Method to convert the class instance to a JSON string
  toJSON(): string {
    return JSON.stringify({
      walletId: this.walletId,
      password: this.password,
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount,
      changeAddress: this.changeAddress,
      stuId: this.stuId,
      teacherId: this.teacherId,
      eventId: this.eventId,
      deadline: this.deadline,
      remark: this.remark,
    });
  }

  static fromJSON(jsonString: string): TransactionClass | null {
    try {
      const data = JSON.parse(jsonString);
      return new TransactionClass(data);
    } catch (error) {
      console.error("Failed to parse JSON string:", error);
      return null;
    }
  }
}
