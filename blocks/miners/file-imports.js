import walk from "acorn-walk";

export const requires = ['file', 'file/ast'];
export default function(file, ast) {
    const imports = [];

    switch (file.type) {
        case 'javascript':
            walk.simple(ast, {
                ImportDeclaration(node) {
                    imports.push(node)
                }
            });
            break;
    }

    return imports;
}
