
export const isEmailValid = (email: string) => {
    if (!email) return "El correo electrónico no puede estar vacío";
    if (!email.includes("@")) {
        return "Por favor, introduce una dirección de correo electrónico válida.";
    }
    if (/\s+/g.test(email)) {
        return "El correo electrónico no puede tener espacios en blanco";
    }
    return "";
};