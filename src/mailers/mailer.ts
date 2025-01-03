import { resend } from "./resendClient"
import {CreateEmailResponse} from "resend";
import { config} from "../config/app.config"

export type EmailFormatter = {
    to: string | string[],
    subject: string,
    text: string,
    html: string,
    from?: string,
}

const mailer_sender = config.NODE_ENV === "production" ?
    `no-reply <onboarding@resend.dev>` : `no-reply <${config.MAILER_SENDER}>`

export const sendEmail = async <T extends EmailFormatter>(val: T): Promise<CreateEmailResponse> => {
    return await resend.emails.send({...val, from: mailer_sender})
}
