const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function item(n, q) {
    return { n: String(n), q: q, u: TRANSPARENT_PIXEL };
}

// Addition: easy → hard, double-digit earlier. 12 problems.
const add = [
    item(9, "4+5"),
    item(10, "7+3"),
    item(14, "6+8"),
    item(19, "12+7"),
    item(24, "10+14"),
    item(23, "15+8"),
    item(26, "17+9"),
    item(17, "8+9"),
    item(43, "24+19"),
    item(62, "35+27"),
    item(74, "28+46"),
    item(97, "39+58")
];

// Subtraction: easy → hard. 12 problems.
const sub = [
    item(7, "10-3"),
    item(7, "12-5"),
    item(8, "15-7"),
    item(12, "20-8"),
    item(7, "22-15"),
    item(16, "30-14"),
    item(24, "41-17"),
    item(25, "53-28"),
    item(33, "72-39"),
    item(34, "81-47"),
    item(37, "95-58"),
    item(46, "103-57")
];

// Multiplication: easy → hard. 12 problems.
const mult = [
    item(24, "6×4"),
    item(45, "5×9"),
    item(56, "7×8"),
    item(36, "3×12"),
    item(54, "9×6"),
    item(44, "4×11"),
    item(56, "8×7"),
    item(36, "6×6"),
    item(50, "10×5"),
    item(48, "12×4"),
    item(81, "9×9"),
    item(88, "11×8")
];

// Division: easy → hard. 12 problems.
const div = [
    item(6, "24÷4"),
    item(6, "36÷6"),
    item(6, "42÷7"),
    item(7, "56÷8"),
    item(9, "81÷9"),
    item(7, "35÷5"),
    item(8, "48÷6"),
    item(9, "63÷7"),
    item(9, "72÷8"),
    item(9, "54÷6"),
    item(5, "45÷9"),
    item(8, "32÷4")
];

// Exponents. 6 problems.
const exp = [
    item(8, "2³"),
    item(9, "3²"),
    item(16, "4²"),
    item(25, "5²"),
    item(16, "2⁴"),
    item(100, "10²")
];

// Square roots. 6 problems.
const roots = [
    item(3, "√9"),
    item(4, "√16"),
    item(5, "√25"),
    item(6, "√36"),
    item(7, "√49"),
    item(8, "√64")
];

function interleave(a, b) {
    const out = [];
    for (let i = 0; i < a.length; i++) {
        if (Math.random() < 0.5) {
            out.push(a[i], b[i]);
        } else {
            out.push(b[i], a[i]);
        }
    }
    return out;
}

const mathData = [
    ...interleave(add, sub),
    ...interleave(mult, div),
    ...interleave(exp, roots)
];
if (typeof window !== 'undefined') window.mathData = mathData;
