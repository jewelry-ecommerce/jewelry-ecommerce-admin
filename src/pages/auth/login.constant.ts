import * as yup from "yup";

export interface LoginFormValues {
  email: string;
  password: string;
}

const PASSWORD_MIN_LENGTH = 6;

export const DEFAULT_LOGIN_FORM_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export const loginFormSchema: yup.ObjectSchema<LoginFormValues> = yup.object({
  email: yup.string().trim().required("Email is required.").email("Enter a valid email address."),
  password: yup.string().required("Password is required.").min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`),
});
