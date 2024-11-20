import API from "../_controllers/api";
import LocalStorage from "../_controllers/LocalStorage";

// Define the class based on the provided JSON structure
export class UserClass {
  walletId: string;
  userID: string;
  address: string;

  constructor(walletId: string, userID: string, address: string) {
    this.walletId = walletId;
    this.userID = userID;
    this.address = address;
  }

  // Method to convert the class instance to a JSON string
  toJSON(): string {
    return JSON.stringify({
      walletId: this.walletId,
      userID: this.userID,
      address: this.address,
    });
  }

  // Static method to create an instance from a JSON string
  static fromJSON(jsonString: string): UserClass | null {
    try {
      const data = JSON.parse(jsonString);
      // console.log("JSON.parse(jsonString)" + data);
      const address = data.addresses.length > 0 ? data.addresses[0] : "";
      console.log(data.addresses.length > 0);
      // console.log("JSON.parse(jsonString) modified address" + data);
      return new UserClass(data.id, data.userID, address);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async refreshUser(): Promise<UserClass | null> {
    const newWallet = await API().fetchWalletByID(this.walletId);
    // Call api to generate a new address in back-end
    const result = await LocalStorage().setAttribute("user", this.toJSON());
    // Synchronize the information changed in back-end
    if (result) {
      return newWallet;
    } else {
      return null;
    }
  }

  async addAddress(password: string): Promise<UserClass> {
    const newAddress = await API().createAnAddress(this.walletId, password);
    console.log("New Address:", newAddress);
    return newAddress;
  }
}
