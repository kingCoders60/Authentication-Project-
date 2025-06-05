import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplates.js";
import {mailtrapClient,sender} from "./mailtrap.config.js";

export const sendVerificationEmail = async(email,verificationToken)=>{
    const recipitent=[{email}]
    try{
        const response = await mailtrapClient.send({
            from:sender,
            to:recipitent,
            subject:"Verify your email",
            html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category:"Email Verification"
        })

        console.log("Email Send Successfully!",response);
    }catch(error){
        console.error(`Error sending verification`,error);
        throw new Error(`Error sending verification email:${error}`);
    }
}

export const sendWelcomeEmail=async (email,name)=>{
    const recipitent=[{email}];
    try {
        await mailtrapClient.send({
          from: sender,
          to: recipitent,
          template_uuid: "19b1b419-f0d4-434e-8e81-0a216713aaa6",
          template_variables: {
            name: name,
            company_info_name: "Namaste.io",
          },
        });
        console.log("Welcome Email Send Successfully!");
    } catch (error) {
        console.error("Error Sending Email",email);
        throw new Error(`Error sending welcome Email: ${error}`);
    }
}
export const sendPasswordResetEmail=async(email,resetURL)=>{
    const recipitent = [{email}];
    try {
        const reponse = await mailtrapClient.send({
            from:sender,
            to:recipitent,
            subject:"Reset your password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetURL)
        })
    } catch (error) {
        console.error("Error Sending Email", email);
        throw new Error(`Error in SendPasswordResetEmail: ${error}`);
    }
}