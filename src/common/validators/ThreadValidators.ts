export const isThreadTitleValid = (title: string) => {
    return isStringValid("Title", title, 5, 150);
};

export const isThreadBodyValid = (body: string) => {
    return isStringValid("Body", body, 10, 2500);
};

export const isStringValid = (label: string, str: string, min: number, max: number) => {
    if (!str) return `${label} No puede estar vacía.`;

    if (str.length < min) {
        return `${label} debe ser por lo menos ${min} caracteres.`;
    }

    if (str.length > max) {
        return `${label} no puede ser mayor que ${max} caracteres.`;
    }

    return "";
};