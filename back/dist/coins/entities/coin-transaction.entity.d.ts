import { User } from "../../users/entities/user.entity";
export declare class CoinTransaction {
    id: number;
    userId: number;
    user: User;
    senderId: number;
    sender: User;
    receiverId: number;
    receiver: User;
    amount: number;
    type: "EARN" | "SPEND" | "TRANSFER";
    description: string;
    createdAt: Date;
}
