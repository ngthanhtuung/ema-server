export default class ApiResponse<T> {
    constructor(
        public status: string,
        public message: string,
        public data?: T,
    ) { }
}