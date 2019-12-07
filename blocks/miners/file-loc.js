export const requires = ['file/content'];
export default function(content) {
    return content.split(/\r\n?|\n/).length - 1;
}
