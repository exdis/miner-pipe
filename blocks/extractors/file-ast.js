import csstree from 'css-tree';
import acorn from 'acorn';

export const requires = ['file', 'file/content'];
export default function(file, content) {
    switch (file.type) {
        case 'javascript':
            return acorn.parse(content, { allowImportExportEverywhere: true });

        case 'css':
            return csstree.parse(content);
    }
}
