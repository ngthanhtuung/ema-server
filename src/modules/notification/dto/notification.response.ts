import { Expose } from "class-transformer";

export class NotificationResponse {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    content: string;

    @Expose()
    readFlag: boolean;

    @Expose()
    createdAt: Date;
}