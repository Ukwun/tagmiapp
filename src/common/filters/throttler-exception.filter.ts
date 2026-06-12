import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from "@nestjs/common"
import { ThrottlerException } from "@nestjs/throttler"
import { Request, Response } from "express"

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const path = request.url

    let message = "You're doing that too fast. Please wait a moment and try again."

    if (path.includes("/auth/send-otp") || path.includes("/auth/forgot-password")) {
      message = "You can only request a code once every 2 minutes. Please wait and try again."
    } else if (path.includes("/auth/verify-otp") || path.includes("/auth/reset-password")) {
      message = "Too many attempts. Please wait a minute before trying again."
    } else if (path.includes("/auth/check-username")) {
      message = "Slow down! Please wait a moment before checking again."
    }

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message,
    })
  }
}
