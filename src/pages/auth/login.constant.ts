import * as yup from "yup";
import { isJavaBackend, getDataSourceMode } from "@/common/config/app.config";
export const isPhoneLogin = () => isJavaBackend() && getDataSourceMode() === "HTTP";

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
  email: isPhoneLogin() ? yup.string().trim().required("Nhập số điện thoại.").matches(/^0[0-9]{9}$/, "Số điện thoại không hợp lệ.")
    : yup.string().trim().required("Email is required.").email("Enter a valid email address."),
  password: yup.string().required("Password is required.").min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`),
});
