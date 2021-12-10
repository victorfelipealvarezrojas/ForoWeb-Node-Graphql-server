export interface PasswordTestResult {
    message: string;
    isValid: boolean;
}

export const isPasswordValid = (password: string): PasswordTestResult => {
    const passwordTestResult: PasswordTestResult = {
        message: "",
        isValid: true,
    };

    if (password.length < 8) {
        passwordTestResult.message = "La contraseña debe tener al menos 8 caracteres";
        passwordTestResult.isValid = false;
        return passwordTestResult;
    }

    const strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");

    if (!strongPassword.test(password)) {
        passwordTestResult.message = "La contraseña debe contener al menos 1 carácter especial, 1 letra mayúscula y 1 número";
        passwordTestResult.isValid = false;
    }

    return passwordTestResult;
};