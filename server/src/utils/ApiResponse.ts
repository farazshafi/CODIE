class ApiResponse<T> {
    constructor(
        public statusCode: number,
        public data: T,
        public message = "Success"
    ) {
        this.statusCode = statusCode
        this.data = data
        this.message = message
    }
}

export { ApiResponse }
