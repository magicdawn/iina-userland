declare namespace IINA {
  namespace API {
    interface Console {
      log(message: any, ...values: any[]): void
      warn(message: any, ...values: any[]): void
      error(message: any, ...values: any[]): void
    }
  }
}
